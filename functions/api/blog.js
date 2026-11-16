/* ==========================================================
   Publication du blog en un clic (Cloudflare Pages Function).
   URL : /api/blog

   GET  → renvoie la liste actuelle des articles (lue sur GitHub, donc toujours à jour).
   POST → vérifie le mot de passe, contrôle chaque champ, puis enregistre dans GitHub
          en UN SEUL commit : blog/posts.js (régénéré ici) + les nouvelles images.
          Cloudflare republie ensuite le site tout seul.

   Réglages à créer dans Cloudflare (Settings → Variables and Secrets) :
     ADMIN_PASSWORD  le mot de passe de Mirela (secret)
     GITHUB_TOKEN    jeton GitHub limité à ce seul dépôt, droit « Contents : Read and write » (secret)
     GITHUB_REPO     « compte/nom-du-depot », par exemple  moncompte/site-mirela
     GITHUB_BRANCH   (facultatif) branche publiée, « main » par défaut
   ========================================================== */

const GH = 'https://api.github.com';
const POSTS_PATH = 'blog/posts.js';
const TYPES = ['actu', 'texte', 'photo', 'video'];
const LANGS = ['fr', 'en', 'sq', 'it'];
const MAX_POSTS = 300;
const MAX_IMAGES = 8;
const MAX_IMAGE_BYTES = 3 * 1024 * 1024;
const MAX_BODY_BYTES = 16 * 1024 * 1024;
const IMAGE_PATH = /^assets\/blog\/[a-z0-9-]{1,60}\.jpg$/;

class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}

function reply(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' }
  });
}

function settings(env) {
  const repo = String(env.GITHUB_REPO || '');
  if (!env.GITHUB_TOKEN || !/^[\w.-]+\/[\w.-]+$/.test(repo)) {
    throw new HttpError(500, 'La publication en un clic n’est pas encore configurée sur le site.');
  }
  return { repo: '/repos/' + repo, branch: String(env.GITHUB_BRANCH || 'main') };
}

async function gh(env, path, init) {
  const headers = {
    authorization: 'Bearer ' + env.GITHUB_TOKEN,
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'site-blog-publisher'
  };
  if (init && init.body) headers['content-type'] = 'application/json';
  const r = await fetch(GH + path, Object.assign({}, init, { headers }));
  if (!r.ok) {
    let detail = '';
    try { detail = (await r.json()).message || ''; } catch (e) { /* ignoré */ }
    const err = new HttpError(r.status === 409 || r.status === 422 ? 409 : 502, 'GitHub a refusé la demande (' + r.status + '). ' + detail);
    err.github = r.status;
    throw err;
  }
  return r.json();
}

function fromBase64(b64) {
  const bin = atob(b64.replace(/\s/g, ''));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

function parsePosts(source) {
  const m = source.match(/window\.BLOG_POSTS\s*=\s*(\[[\s\S]*\])\s*;?\s*$/);
  if (!m) throw new HttpError(502, 'Le fichier des articles est illisible.');
  return JSON.parse(m[1]);
}

function postsFile(posts) {
  return '/* Articles du blog.\n   Ce fichier est généré par l’espace publication (blog-admin.html).\n' +
    '   Format de date : AAAA-MM-JJ, ou AAAA-MM, ou AAAA.\n' +
    '   type : actu | texte | photo | video      lang : fr | en | sq | it\n' +
    '   pinned : true  → article mis en avant (affiché en haut, en grand)\n' +
    '   video : identifiant YouTube (les 11 caractères après « v= » dans le lien) */\n' +
    'window.BLOG_POSTS = ' + JSON.stringify(posts, null, 2) + ';\n';
}

async function sameSecret(a, b) {
  // comparaison à temps constant (on compare des empreintes de même taille)
  const enc = new TextEncoder();
  const [x, y] = await Promise.all([
    crypto.subtle.digest('SHA-256', enc.encode(String(a))),
    crypto.subtle.digest('SHA-256', enc.encode(String(b)))
  ]);
  const xa = new Uint8Array(x), ya = new Uint8Array(y);
  let diff = 0;
  for (let i = 0; i < xa.length; i++) diff |= xa[i] ^ ya[i];
  return diff === 0;
}

function cleanPosts(list) {
  if (!Array.isArray(list)) throw new HttpError(400, 'Liste d’articles invalide.');
  if (list.length > MAX_POSTS) throw new HttpError(400, 'Trop d’articles.');
  const seen = new Set();
  return list.map(function (p, i) {
    const n = i + 1;
    if (!p || typeof p !== 'object') throw new HttpError(400, 'Article ' + n + ' invalide.');
    const out = {};
    if (typeof p.id !== 'string' || !/^[a-z0-9-]{1,60}$/.test(p.id) || seen.has(p.id)) throw new HttpError(400, 'Identifiant invalide pour l’article ' + n + '.');
    seen.add(p.id);
    out.id = p.id;
    if (typeof p.date !== 'string' || !/^\d{4}(-\d{2}(-\d{2})?)?$/.test(p.date)) throw new HttpError(400, 'Date invalide pour l’article ' + n + '.');
    out.date = p.date;
    if (TYPES.indexOf(p.type) < 0) throw new HttpError(400, 'Type invalide pour l’article ' + n + '.');
    out.type = p.type;
    if (LANGS.indexOf(p.lang) < 0) throw new HttpError(400, 'Langue invalide pour l’article ' + n + '.');
    out.lang = p.lang;
    if (p.pinned === true) out.pinned = true;
    if (typeof p.title !== 'string' || !p.title.trim() || p.title.length > 200) throw new HttpError(400, 'Titre invalide pour l’article ' + n + '.');
    out.title = p.title.trim();
    const image = p.image == null ? '' : p.image;
    if (typeof image !== 'string' || (image && !IMAGE_PATH.test(image))) throw new HttpError(400, 'Image invalide pour l’article ' + n + '.');
    out.image = image;
    if (p.video) {
      if (typeof p.video !== 'string' || !/^[A-Za-z0-9_-]{11}$/.test(p.video)) throw new HttpError(400, 'Vidéo invalide pour l’article ' + n + '.');
      out.video = p.video;
    }
    if (typeof p.text !== 'string' || !p.text.trim() || p.text.length > 20000) throw new HttpError(400, 'Texte invalide pour l’article ' + n + '.');
    out.text = p.text.replace(/\r\n/g, '\n').trim();
    return out;
  });
}

function cleanImages(list) {
  if (list == null) return [];
  if (!Array.isArray(list) || list.length > MAX_IMAGES) throw new HttpError(400, 'Trop d’images à la fois.');
  return list.map(function (im) {
    if (!im || typeof im.path !== 'string' || !IMAGE_PATH.test(im.path)) throw new HttpError(400, 'Nom d’image invalide.');
    const data = typeof im.data === 'string' ? im.data : '';
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(data) || data.length < 16) throw new HttpError(400, 'Image illisible.');
    if (Math.floor(data.length * 3 / 4) > MAX_IMAGE_BYTES) throw new HttpError(400, 'Image trop lourde (3 Mo maximum).');
    const head = atob(data.slice(0, 8));
    if (head.charCodeAt(0) !== 0xFF || head.charCodeAt(1) !== 0xD8 || head.charCodeAt(2) !== 0xFF) throw new HttpError(400, 'Seules les images JPEG sont acceptées.');
    return { path: im.path, data };
  });
}

async function readCurrent(env, ref) {
  const { repo } = settings(env);
  const f = await gh(env, repo + '/contents/' + POSTS_PATH + '?ref=' + encodeURIComponent(ref));
  if (typeof f.content !== 'string') throw new HttpError(502, 'Le fichier des articles est introuvable.');
  const text = new TextDecoder().decode(fromBase64(f.content));
  return { posts: parsePosts(text), sha: f.sha };
}

export async function onRequestGet(context) {
  try {
    const { branch } = settings(context.env);
    const cur = await readCurrent(context.env, branch);
    return reply({ posts: cur.posts, base: cur.sha });
  } catch (e) {
    return reply({ error: e.message || 'Erreur.' }, e.status || 500);
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;
  try {
    // uniquement depuis les pages du site lui-même
    const origin = request.headers.get('origin');
    if (!origin || origin !== new URL(request.url).origin) throw new HttpError(403, 'Origine refusée.');
    const len = Number(request.headers.get('content-length') || 0);
    if (len > MAX_BODY_BYTES) throw new HttpError(413, 'Envoi trop volumineux.');

    if (!env.ADMIN_PASSWORD) throw new HttpError(500, 'La publication en un clic n’est pas encore configurée sur le site.');
    let body;
    try { body = await request.json(); } catch (e) { throw new HttpError(400, 'Requête illisible.'); }
    if (!body || typeof body !== 'object') throw new HttpError(400, 'Requête illisible.');

    if (!(await sameSecret(body.password || '', env.ADMIN_PASSWORD))) {
      await new Promise(function (r) { setTimeout(r, 1000); });   // ralentit les essais au hasard
      throw new HttpError(401, 'Mot de passe incorrect.');
    }

    const posts = cleanPosts(body.posts);
    const images = cleanImages(body.images);
    if (typeof body.base !== 'string' || !body.base) throw new HttpError(400, 'Version de départ manquante : rechargez la page.');

    const { repo, branch } = settings(env);

    // 1) état actuel de la branche
    const ref = await gh(env, repo + '/git/ref/heads/' + encodeURIComponent(branch));
    const headSha = ref.object.sha;
    const head = await gh(env, repo + '/git/commits/' + headSha);

    // 2) personne d'autre n'a modifié les articles depuis l'ouverture de la page ?
    const cur = await readCurrent(env, headSha);
    if (cur.sha !== body.base) throw new HttpError(409, 'Le blog a été modifié depuis l’ouverture de cette page. Rechargez la page, puis refaites votre modification.');

    // 3) un seul commit : posts.js + nouvelles images
    const entries = [];
    for (const im of images) {
      const blob = await gh(env, repo + '/git/blobs', { method: 'POST', body: JSON.stringify({ content: im.data, encoding: 'base64' }) });
      entries.push({ path: im.path, mode: '100644', type: 'blob', sha: blob.sha });
    }
    const postsBlob = await gh(env, repo + '/git/blobs', { method: 'POST', body: JSON.stringify({ content: postsFile(posts), encoding: 'utf-8' }) });
    entries.push({ path: POSTS_PATH, mode: '100644', type: 'blob', sha: postsBlob.sha });

    const tree = await gh(env, repo + '/git/trees', { method: 'POST', body: JSON.stringify({ base_tree: head.tree.sha, tree: entries }) });
    const commit = await gh(env, repo + '/git/commits', {
      method: 'POST',
      body: JSON.stringify({ message: 'Blog : mise à jour (' + posts.length + (posts.length > 1 ? ' articles' : ' article') + ')', tree: tree.sha, parents: [headSha] })
    });
    await gh(env, repo + '/git/refs/heads/' + encodeURIComponent(branch), { method: 'PATCH', body: JSON.stringify({ sha: commit.sha, force: false }) });

    return reply({ ok: true, commit: commit.sha, base: postsBlob.sha, images: images.length });
  } catch (e) {
    return reply({ error: e.message || 'Erreur.' }, e.status || 500);
  }
}
