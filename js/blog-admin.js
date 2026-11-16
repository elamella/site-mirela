/* ==========================================================
   Espace publication du blog (page réservée à l'auteur, en français).
   En ligne : chaque action (publier un article, mettre en avant, supprimer) est
   envoyée tout de suite au service /api/blog (functions/api/blog.js), protégé par
   mot de passe, qui l'enregistre dans GitHub ; le site se met à jour tout seul.
   Hors ligne (page ouverte depuis un dossier, ou service absent) : la page prépare
   blog/posts.js + les images à télécharger (méthode manuelle).
   ========================================================== */
(function () {
  'use strict';

  var posts = (window.BLOG_POSTS || []).map(function (p) { return JSON.parse(JSON.stringify(p)); });
  var images = {};            // id -> { name: 'id.jpg', blob: Blob }   (images pas encore publiées)
  var dirty = false;          // (méthode manuelle) changements pas encore téléchargés
  var pendingBlob = null;     // image redimensionnée du formulaire
  var pendingBusy = false;
  var online = false;         // vrai quand le service de publication répond
  var busy = false;           // une publication est en cours
  var base = '';              // version du fichier des articles à l'ouverture (contrôle anti-écrasement)
  var editingId = null;       // identifiant de l'article en cours de modification (null = nouvel article)
  var PW_KEY = 'mlx-admin-pw';

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
      '   Format de date : AAAA-MM-JJ, ou AAAA-MM, ou AAAA.\n   type : actu | texte | photo | video      lang : fr | en | sq | it */\n' +
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

  // petit message en bas de l'écran (visible quel que soit l'endroit de la page)
  var toastTimer = null;
  function toast(kind, msg) {
    var t = $('toast');
    clearTimeout(toastTimer);
    t.textContent = msg;
    t.className = 'admin-toast' + (kind === 'error' ? ' is-error' : '');
    t.hidden = false;
    if (kind !== 'error') toastTimer = setTimeout(function () { t.hidden = true; }, 9000);
  }

  /* ---------- Envoi au site ---------- */
  function storeGet() { try { return localStorage.getItem(PW_KEY) || ''; } catch (e) { return ''; } }
  function storeSet(v) { try { if (v) localStorage.setItem(PW_KEY, v); else localStorage.removeItem(PW_KEY); } catch (e) { /* ignoré */ } }

  function blobToBase64(blob) {
    return new Promise(function (resolve, reject) {
      var r = new FileReader();
      r.onload = function () { resolve(String(r.result).split(',')[1] || ''); };
      r.onerror = function () { reject(new Error('lecture')); };
      r.readAsDataURL(blob);
    });
  }

  // Applique un changement. En ligne : l'envoie tout de suite au site (et l'annule si ça échoue).
  // Hors ligne : le garde pour la méthode manuelle. Renvoie une promesse : true si le changement est pris en compte.
  function change(mutate, okMsg) {
    if (!online) { mutate(); markDirty(); renderAll(); return Promise.resolve(true); }
    if (busy) return Promise.resolve(false);
    var pw = $('f-password').value;
    if (!pw) {
      toast('error', 'Saisissez d’abord le mot de passe, en haut de la page.');
      $('f-password').focus();
      return Promise.resolve(false);
    }

    var snapPosts = JSON.stringify(posts), snapImages = images;
    images = Object.assign({}, images);
    mutate();
    busy = true;
    document.body.classList.add('is-busy');
    var submit = $('submit-btn');
    submit.textContent = 'Publication en cours…';

    var ids = Object.keys(images).filter(function (id) { return posts.some(function (p) { return p.id === id; }); });
    return Promise.all(ids.map(function (id) {
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
      if (!res.ok) throw new Error((res.d && res.d.error) || 'La publication a échoué (code ' + res.status + ').');
      base = res.d.base;
      images = {};
      storeSet($('f-remember').checked ? pw : '');
      toast('ok', okMsg + ' Le blog se met à jour : comptez 1 à 2 minutes.');
      return true;
    }).catch(function (err) {
      posts = JSON.parse(snapPosts);   // on annule le changement : rien n'a été publié
      images = snapImages;
      toast('error', err instanceof TypeError ? 'Impossible de joindre le site. Vérifiez votre connexion internet et réessayez.' : err.message);
      return false;
    }).then(function (done) {
      busy = false;
      document.body.classList.remove('is-busy');
      submit.textContent = submitLabel();
      renderAll();
      return done;
    });
  }

  /* ---------- Affichage ---------- */
  function renderList() {
    var ul = $('post-list');
    ul.textContent = '';
    var sorted = posts.slice().sort(function (a, b) { return String(b.date).localeCompare(String(a.date)); });
    $('count-line').textContent = sorted.length + (sorted.length > 1 ? ' articles' : ' article');
    sorted.forEach(function (p) {
      var li = h('li', 'admin-item' + (p.pinned ? ' is-pinned' : '') + (p.id === editingId ? ' is-editing' : ''));
      var info = h('div', 'admin-item-info');
      info.appendChild(h('strong', '', p.title));
      info.appendChild(h('span', '', (p.pinned ? 'À la une · ' : '') + (TYPES[p.type] || p.type) + ' · ' + (LANGS[p.lang] || p.lang) + ' · ' + p.date + (p.video ? ' · vidéo' : '') + (images[p.id] ? ' · nouvelle image' : '')));
      li.appendChild(info);

      var actions = h('div', 'admin-actions');
      var edit = h('button', 'admin-edit', 'Modifier');
      edit.type = 'button';
      edit.addEventListener('click', function () { startEdit(p.id); });
      actions.appendChild(edit);

      var pin = h('button', 'admin-pin' + (p.pinned ? ' is-on' : ''), p.pinned ? 'Retirer de la une' : 'Mettre en avant');
      pin.type = 'button';
      pin.addEventListener('click', function () {
        var wasPinned = !!p.pinned;
        change(function () { if (p.pinned) delete p.pinned; else p.pinned = true; }, wasPinned ? 'Retiré de la une.' : 'Mis en avant.');
      });
      actions.appendChild(pin);

      var del = h('button', 'admin-del', 'Supprimer');
      del.type = 'button';
      del.addEventListener('click', function () {
        if (!window.confirm('Supprimer l’article « ' + p.title + ' »' + (online ? ' du blog ?' : ' ?'))) return;
        change(function () {
          posts = posts.filter(function (x) { return x.id !== p.id; });
          delete images[p.id];
        }, 'Article supprimé.');
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
  function renderAll() {
    if (editingId && !posts.some(function (p) { return p.id === editingId; })) resetForm();   // l'article modifié a disparu (supprimé)
    renderList(); renderImages();
  }

  function submitLabel() { return editingId ? 'Enregistrer les modifications' : (online ? 'Publier l’article' : 'Ajouter l’article'); }

  // vide le formulaire et revient au mode « nouvel article »
  function resetForm() {
    editingId = null;
    $('post-form').reset();
    $('f-date').value = today();
    $('f-preview').hidden = true;
    $('f-noimage-wrap').hidden = true;
    pendingBlob = null;
    $('form-title').textContent = 'Nouvel article';
    $('edit-note').hidden = true;
    $('cancel-edit').hidden = true;
    $('submit-btn').textContent = submitLabel();
    showError('');
  }

  // charge un article déjà publié dans le formulaire pour le modifier
  function startEdit(id) {
    var p = posts.filter(function (x) { return x.id === id; })[0];
    if (!p || busy) return;
    $('post-form').reset();
    pendingBlob = null;
    editingId = id;
    $('f-type').value = p.type || 'actu';
    $('f-lang').value = p.lang || 'fr';
    $('f-date').value = /^\d{4}-\d{2}-\d{2}$/.test(p.date || '') ? p.date : '';
    $('f-title').value = p.title || '';
    $('f-text').value = p.text || '';
    $('f-video').value = p.video || '';
    $('f-pinned').checked = !!p.pinned;
    var prev = $('f-preview');
    var hasImg = !!p.image;
    prev.hidden = !hasImg;
    if (hasImg) prev.src = p.image;
    $('f-noimage-wrap').hidden = !hasImg;
    $('form-title').textContent = 'Modifier l’article';
    $('edit-note').textContent = 'Vous modifiez « ' + p.title + ' ». Changez ce que vous voulez, puis cliquez sur « Enregistrer les modifications ».' + (hasImg ? ' L’image actuelle est conservée, sauf si vous en choisissez une autre ou cochez « Retirer l’image ».' : '');
    $('edit-note').hidden = false;
    $('cancel-edit').hidden = false;
    $('submit-btn').textContent = submitLabel();
    showError('');
    renderList();
    $('post-form').scrollIntoView({ behavior: 'smooth', block: 'start' });
    $('f-title').focus({ preventScroll: true });
  }

  $('cancel-edit').addEventListener('click', function () { resetForm(); renderList(); });

  $('f-date').value = today();

  $('f-image').addEventListener('change', function () {
    var f = this.files && this.files[0];
    var prev = $('f-preview');
    pendingBlob = null;
    prev.hidden = true;
    showError('');
    if (!f) {   // fichier retiré : en modification, on réaffiche l'image actuelle
      var cur = editingId && posts.filter(function (x) { return x.id === editingId; })[0];
      if (cur && cur.image) { prev.src = cur.image; prev.hidden = false; }
      return;
    }
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

    var blob = pendingBlob;

    if (editingId) {   // modification d'un article déjà publié (même identifiant, donc même lien)
      var eid = editingId;
      change(function () {
        var p = posts.filter(function (x) { return x.id === eid; })[0];
        if (!p) return;
        p.date = $('f-date').value || p.date || today();
        p.type = $('f-type').value;
        p.lang = $('f-lang').value;
        p.title = title;
        p.text = text;
        if ($('f-pinned').checked) p.pinned = true; else delete p.pinned;
        if (vid) p.video = vid; else delete p.video;
        if (blob) {   // nouvelle image : nouveau nom, pour que les navigateurs n'affichent pas l'ancienne
          var name = eid.slice(0, 40) + '-' + Date.now().toString(36);
          p.image = 'assets/blog/' + name + '.jpg';
          images[eid] = { name: name + '.jpg', blob: blob };
        } else if ($('f-noimage').checked) {
          p.image = '';
          delete images[eid];
        }
      }, 'Modifications enregistrées !').then(function (done) {
        if (done) resetForm();   // en cas d'échec, le formulaire est conservé : rien n'est perdu
      });
      return;
    }

    change(function () {
      var id = uniqueId(slug(title));
      var post = { id: id, date: $('f-date').value || today(), type: $('f-type').value, lang: $('f-lang').value, title: title, image: '', text: text };
      if ($('f-pinned').checked) post.pinned = true;
      if (vid) post.video = vid;
      if (blob) {
        post.image = 'assets/blog/' + id + '.jpg';
        images[id] = { name: id + '.jpg', blob: blob };
      }
      posts.push(post);
    }, 'Article publié !').then(function (done) {
      if (done) resetForm();      // en cas d'échec, le formulaire est conservé : rien n'est perdu
    });
  });

  $('dl-posts').addEventListener('click', function () {
    download(new Blob([postsJs()], { type: 'text/javascript;charset=utf-8' }), 'posts.js');
    if (!Object.keys(images).length) { dirty = false; $('dirty-note').hidden = true; }   // rien d'autre à télécharger
  });

  window.addEventListener('beforeunload', function (e) {
    if (dirty && !online) { e.preventDefault(); e.returnValue = ''; }
  });

  /* ---------- Quel mode ? ---------- */
  function goOnline(data) {
    online = true;
    posts = data.posts;     // la liste officielle vient du site, pas d'un fichier mis en cache
    base = data.base;
    $('online').hidden = false;
    $('publish').hidden = true;
    $('submit-btn').textContent = submitLabel();
    $('f-password').value = storeGet();
    renderAll();
  }

  function goOffline() {
    online = false;
    $('online').hidden = true;
    $('publish').hidden = false;
    $('submit-btn').textContent = submitLabel();
  }

  if (/^https?:$/.test(location.protocol)) {
    fetch('/api/blog', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('indisponible')); })
      .then(function (d) { if (d && Array.isArray(d.posts) && d.base) goOnline(d); else goOffline(); })
      .catch(goOffline);
  } else {
    goOffline();
  }

  renderAll();
})();
