/* ==========================================================
   Espace publication du blog (page réservée, en français).
   En ligne : le bouton « Publier sur le site » envoie les changements au service
   /api/blog (functions/api/blog.js), qui les enregistre dans GitHub.
   Hors ligne (ou en secours) : la page prépare blog/posts.js + les images à télécharger.
   ========================================================== */
(function () {
  'use strict';

  var posts = (window.BLOG_POSTS || []).map(function (p) { return JSON.parse(JSON.stringify(p)); });
  var images = {};            // id -> { name: 'id.jpg', blob: Blob }   (nouvelles images seulement)
  var dirty = false;
  var pendingBlob = null;     // image redimensionnée du formulaire
  var pendingBusy = false;

  function $(id) { return document.getElementById(id); }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

  var TYPES = { actu: 'Actualité', texte: 'Texte', photo: 'Photo', video: 'Vidéo' };

  // identifiant YouTube (11 caractères) depuis un lien watch / youtu.be / embed / shorts ; '' si vide, null si non reconnu
  function ytId(s) {
    s = String(s || '').trim();
    if (!s) return '';
    var m = s.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/|live\/))([A-Za-z0-9_-]{11})/);
    if (m) return m[1];
    return /^[A-Za-z0-9_-]{11}$/.test(s) ? s : null;
  }
  var LANGS = { fr: 'Français', sq: 'Shqip', en: 'English', it: 'Italiano' };

  function today() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function slug(s) {
    return String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'article';
  }

  function uniqueId(base) {
    var id = base, n = 2;
    while (posts.some(function (p) { return p.id === id; })) { id = base + '-' + n++; }
    return id;
  }

  function download(blob, name) {
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  function postsJs() {
    return '/* Articles du blog.\n   Ce fichier est généré par la page « blog-admin.html » (espace publication).\n' +
      '   Format de date : AAAA-MM-JJ, ou AAAA-MM, ou AAAA.\n   type : actu | texte | photo      lang : fr | en | sq | it */\n' +
      'window.BLOG_POSTS = ' + JSON.stringify(posts, null, 2) + ';\n';
  }

  function resizeImage(file, max, cb) {
    var img = new Image();
    var url = URL.createObjectURL(file);
    img.onload = function () {
      var s = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
      var c = document.createElement('canvas');
      c.width = Math.round(img.naturalWidth * s);
      c.height = Math.round(img.naturalHeight * s);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      c.toBlob(function (b) { URL.revokeObjectURL(url); cb(b); }, 'image/jpeg', 0.86);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }

  function showError(msg) {
    var e = $('f-error');
    e.textContent = msg || '';
    e.hidden = !msg;
  }

  function renderList() {
    var ul = $('post-list');
    ul.textContent = '';
    var sorted = posts.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    $('count-line').textContent = sorted.length + (sorted.length > 1 ? ' articles' : ' article');
    sorted.forEach(function (p) {
      var li = h('li', 'admin-item' + (p.pinned ? ' is-pinned' : ''));
      var info = h('div', 'admin-item-info');
      info.appendChild(h('strong', '', p.title));
      info.appendChild(h('span', '', (p.pinned ? 'À la une · ' : '') + (TYPES[p.type] || p.type) + ' · ' + (LANGS[p.lang] || p.lang) + ' · ' + p.date + (p.video ? ' · vidéo' : '') + (images[p.id] ? ' · nouvelle image' : '')));
      li.appendChild(info);

      var actions = h('div', 'admin-actions');
      var pin = h('button', 'admin-pin' + (p.pinned ? ' is-on' : ''), p.pinned ? 'Retirer de la une' : 'Mettre en avant');
      pin.type = 'button';
      pin.addEventListener('click', function () {
        if (p.pinned) delete p.pinned; else p.pinned = true;
        markDirty();
        renderAll();
      });
      actions.appendChild(pin);

      var del = h('button', 'admin-del', 'Supprimer');
      del.type = 'button';
      del.addEventListener('click', function () {
        if (!window.confirm('Supprimer l’article « ' + p.title + ' » ?')) return;
        posts = posts.filter(function (x) { return x.id !== p.id; });
        delete images[p.id];
        markDirty();
        renderAll();
      });
      actions.appendChild(del);
      li.appendChild(actions);
      ul.appendChild(li);
    });
  }

  function renderImages() {
    var box = $('dl-images');
    box.textContent = '';
    var ids = Object.keys(images);
    if (!ids.length) { box.appendChild(h('span', 'admin-hint', 'Aucune nouvelle image.')); return; }
    ids.forEach(function (id) {
      var b = h('button', 'btn btn-ghost', 'Télécharger ' + images[id].name);
      b.type = 'button';
      b.addEventListener('click', function () { download(images[id].blob, images[id].name); });
      box.appendChild(b);
    });
  }

  function markDirty() { dirty = true; $('dirty-note').hidden = false; }
  function renderAll() { renderList(); renderImages(); }

  $('f-date').value = today();

  $('f-image').addEventListener('change', function () {
    var f = this.files && this.files[0];
    var prev = $('f-preview');
    pendingBlob = null;
    prev.hidden = true;
    showError('');
    if (!f) return;
    pendingBusy = true;
    resizeImage(f, 1600, function (blob) {
      pendingBusy = false;
      if (!blob) { showError('Cette image ne peut pas être lue. Essayez une photo au format JPG ou PNG.'); $('f-image').value = ''; return; }
      pendingBlob = blob;
      prev.src = URL.createObjectURL(blob);
      prev.hidden = false;
    });
  });

  $('post-form').addEventListener('submit', function (e) {
    e.preventDefault();
    showError('');
    var title = $('f-title').value.trim();
    var text = $('f-text').value.replace(/\r\n/g, '\n').trim();
    if (!title) { showError('Ajoutez un titre.'); return; }
    if (!text) { showError('Ajoutez du texte.'); return; }
    if (pendingBusy) { showError('L’image est en cours de préparation, réessayez dans une seconde.'); return; }
    var vid = ytId($('f-video').value);
    if (vid === null) { showError('Ce lien YouTube n’est pas reconnu. Collez l’adresse de la vidéo (par exemple https://www.youtube.com/watch?v=…).'); return; }

    var id = uniqueId(slug(title));
    var post = { id: id, date: $('f-date').value || today(), type: $('f-type').value, lang: $('f-lang').value, title: title, image: '', text: text };
    if ($('f-pinned').checked) post.pinned = true;
    if (vid) post.video = vid;
    if (pendingBlob) {
      post.image = 'assets/blog/' + id + '.jpg';
      images[id] = { name: id + '.jpg', blob: pendingBlob };
    }
    posts.push(post);
    markDirty();
    renderAll();

    this.reset();
    $('f-date').value = today();
    $('f-preview').hidden = true;
    pendingBlob = null;
    $('publish').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  $('dl-posts').addEventListener('click', function () {
    download(new Blob([postsJs()], { type: 'text/javascript;charset=utf-8' }), 'posts.js');
    if (!Object.keys(images).length) { dirty = false; $('dirty-note').hidden = true; }   // rien d'autre à télécharger
  });

  window.addEventListener('beforeunload', function (e) {
    if (dirty) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------- Publication en un clic (service /api/blog, voir functions/api/blog.js) ---------- */
  var base = '';          // version du fichier des articles au moment de l'ouverture (contrôle anti-écrasement)
  var PW_KEY = 'mlx-admin-pw';

  function storeGet() { try { return localStorage.getItem(PW_KEY) || ''; } catch (e) { return ''; } }
  function storeSet(v) { try { if (v) localStorage.setItem(PW_KEY, v); else localStorage.removeItem(PW_KEY); } catch (e) { /* ignoré */ } }

  function say(kind, msg) {   // kind : 'error' | 'ok' | ''
    $('p-error').hidden = kind !== 'error' || !msg;
    $('p-ok').hidden = kind !== 'ok' || !msg;
    if (kind === 'error') $('p-error').textContent = msg;
    if (kind === 'ok') $('p-ok').textContent = msg;
  }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { reject(new Error('lecture')); };
      r.readAsDataURL(blob);
    });
  }

  function goOnline(data) {
    posts = data.posts;     // la liste officielle vient du site, pas d'un fichier mis en cache
    base = data.base;
    $('online').hidden = false;
    $('offline-note').hidden = true;
    $('manual').open = false;
    $('f-password').value = storeGet();
    renderAll();
  }

  function goOffline() {
    $('online').hidden = true;
    $('offline-note').hidden = false;
    $('manual').open = true;
  }

  if (/^https?:$/.test(location.protocol)) {
    fetch('/api/blog', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('indisponible')); })
      .then(function (d) { if (d && Array.isArray(d.posts) && d.base) goOnline(d); else goOffline(); })
      .catch(goOffline);
  } else {
    goOffline();
  }

  $('publish-btn').addEventListener('click', function () {
    var btn = this;
    var pw = $('f-password').value;
    say('', '');
    if (!pw) { say('error', 'Saisissez le mot de passe.'); return; }
    if (!dirty) { say('error', 'Aucun changement à publier.'); return; }

    var ids = Object.keys(images).filter(function (id) { return posts.some(function (p) { return p.id === id; }); });
    btn.disabled = true;
    btn.textContent = 'Publication en cours…';

    Promise.all(ids.map(function (id) {
      return blobToBase64(images[id].blob).then(function (data) { return { path: 'assets/blog/' + images[id].name, data: data }; });
    })).then(function (imgs) {
      return fetch('/api/blog', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: pw, base: base, posts: posts, images: imgs })
      });
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (d) { return { ok: r.ok, status: r.status, d: d }; });
    }).then(function (res) {
      if (!res.ok) { say('error', (res.d && res.d.error) || 'La publication a échoué (code ' + res.status + ').'); return; }
      base = res.d.base;
      images = {};
      dirty = false;
      $('dirty-note').hidden = true;
      storeSet($('f-remember').checked ? pw : '');
      renderAll();
      say('ok', 'C’est publié ! Le site se met à jour : comptez 1 à 2 minutes avant de voir le changement sur le blog.');
    }).catch(function () {
      say('error', 'Impossible de joindre le site. Vérifiez votre connexion internet et réessayez.');
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Publier sur le site';
    });
  });

  renderAll();
})();
