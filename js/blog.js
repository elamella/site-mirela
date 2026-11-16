/* ==========================================================
   Blog : liste des articles, lecture d'un article, et section « À la une »
   de la page d'accueil.
   Les articles viennent de blog/posts.js (window.BLOG_POSTS).
   Un article s'ouvre avec blog.html#identifiant (lien partageable).
   Un article peut avoir : une image, une vidéo YouTube (video), et être
   « mis en avant » (pinned : true) : il passe alors en haut, en grand, et
   s'affiche aussi sur la page d'accueil.
   ========================================================== */
(function () {
  'use strict';

  var root = document.getElementById('blog-root');          // page blog.html
  var homeRoot = document.getElementById('home-featured');  // page d'accueil
  if (!root && !homeRoot) return;
  var hero = document.querySelector('.page-hero');
  var welcome = document.getElementById('blog-welcome');
  var postBtn = document.getElementById('blog-post');   // bouton discret « Poster (réservé) »
  var posts = (window.BLOG_POSTS || []).slice();

  var LOCALE = { fr: 'fr-FR', en: 'en-GB', sq: 'sq-AL', it: 'it-IT' };
  var LANGNAME = { fr: 'Français', en: 'English', sq: 'Shqip', it: 'Italiano' };
  var L = {
    fr: { read: 'Lire la suite', watch: 'Regarder la vidéo', back: '← Retour au blog', empty: 'Les premiers articles arrivent bientôt.', pinned: 'À la une', yt: 'Voir sur YouTube', types: { actu: 'Actualité', texte: 'Texte', photo: 'Photo', video: 'Vidéo' } },
    en: { read: 'Read more', watch: 'Watch the video', back: '← Back to the blog', empty: 'The first posts are coming soon.', pinned: 'Featured', yt: 'Watch on YouTube', types: { actu: 'News', texte: 'Text', photo: 'Photo', video: 'Video' } },
    sq: { read: 'Lexo më shumë', watch: 'Shiko videon', back: '← Kthehu te blogu', empty: 'Artikujt e parë vijnë së shpejti.', pinned: 'Në ballë', yt: 'Shiko në YouTube', types: { actu: 'Lajm', texte: 'Tekst', photo: 'Foto', video: 'Video' } },
    it: { read: 'Leggi tutto', watch: 'Guarda il video', back: '← Torna al blog', empty: 'I primi articoli arriveranno presto.', pinned: 'In evidenza', yt: 'Guarda su YouTube', types: { actu: 'Notizia', texte: 'Testo', photo: 'Foto', video: 'Video' } }
  };

  function lang() {
    var l = document.documentElement.lang;
    return L[l] ? l : 'fr';
  }

  function h(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function validVideo(id) { return /^[A-Za-z0-9_-]{11}$/.test(String(id || '')); }

  function fmtDate(s) {
    if (!s) return '';
    var p = String(s).split('-');
    var y = +p[0], m = p[1] ? +p[1] - 1 : null, d = p[2] ? +p[2] : null;
    if (m === null) return String(y);
    if (lang() === 'sq') {   // les navigateurs ne connaissent pas toujours l'albanais : mois écrits à la main
      var SQ = ['janar', 'shkurt', 'mars', 'prill', 'maj', 'qershor', 'korrik', 'gusht', 'shtator', 'tetor', 'nëntor', 'dhjetor'];
      return (d === null ? '' : d + ' ') + SQ[m] + ' ' + y;
    }
    try {
      if (d === null) return new Intl.DateTimeFormat(LOCALE[lang()], { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m, 1)));
      return new Intl.DateTimeFormat(LOCALE[lang()], { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(y, m, d)));
    } catch (e) { return String(s); }
  }

  function excerpt(t) {
    var first = String(t || '').split(/\n{2,}/)[0];   // l'extrait = le premier paragraphe seulement (la suite se lit dans l'article)
    var s = first.replace(/\s+/g, ' ').trim();
    return s.length > 170 ? s.slice(0, 167).replace(/\s+\S*$/, '') + '…' : s;
  }

  function meta(p) {
    var m = h('div', 'post-meta');
    if (p.pinned) m.appendChild(h('span', 'chip chip-pin', L[lang()].pinned));
    var c = h('span', 'chip', (L[lang()].types[p.type]) || p.type || '');
    c.setAttribute('data-type', p.type || '');
    m.appendChild(c);
    if (p.lang && p.lang !== lang()) m.appendChild(h('span', 'chip chip-lang', LANGNAME[p.lang] || p.lang));
    if (p.date) m.appendChild(h('span', 'post-date', fmtDate(p.date)));
    return m;
  }

  // les articles mis en avant d'abord, puis les plus récents
  function sortPosts(list) {
    return list.slice().sort(function (a, b) {
      var pa = a.pinned ? 1 : 0, pb = b.pinned ? 1 : 0;
      if (pa !== pb) return pb - pa;
      return String(b.date).localeCompare(String(a.date));
    });
  }

  function cardMedia(p) {
    if (p.image) {
      var img = h('img', 'thumb');
      img.src = p.image; img.alt = ''; img.loading = 'lazy';
      return img;
    }
    if (validVideo(p.video)) {
      // pas d'image tirée de YouTube : aucune requête vers un site tiers tant qu'on n'ouvre pas la vidéo
      var box = h('div', 'post-media-video');
      box.appendChild(h('span', 'play'));
      return box;
    }
    return null;
  }

  // carte d'article ; hrefBase = '#' sur le blog, 'blog.html#' depuis l'accueil
  function buildCard(p, hrefBase) {
    var a = h('a', 'post-card' + (p.pinned ? ' is-pinned' : ''));
    a.href = hrefBase + encodeURIComponent(p.id);
    var media = cardMedia(p);
    if (media) a.appendChild(media);
    var b = h('div', 'post-body');
    b.appendChild(meta(p));
    b.appendChild(h('h2', 'post-title', p.title));
    b.appendChild(h('p', 'post-excerpt', excerpt(p.text)));
    b.appendChild(h('span', 'post-more', (validVideo(p.video) ? L[lang()].watch : L[lang()].read) + ' →'));
    a.appendChild(b);
    return a;
  }

  /* ---------- Page blog.html ---------- */
  function renderList() {
    root.textContent = '';
    if (hero) hero.style.display = '';
    if (welcome) welcome.style.display = '';   // le message de bienvenue reste toujours affiché sur la liste
    if (postBtn) postBtn.style.display = '';
    var sorted = sortPosts(posts);
    if (!sorted.length) { root.appendChild(h('p', 'post-empty', L[lang()].empty)); return; }
    var grid = h('div', 'post-grid');
    sorted.forEach(function (p) { grid.appendChild(buildCard(p, '#')); });
    root.appendChild(grid);
  }

  function renderPost(p) {
    root.textContent = '';
    if (hero) hero.style.display = 'none';
    if (welcome) welcome.style.display = 'none';   // pas pendant la lecture d'un article
    if (postBtn) postBtn.style.display = 'none';
    var v = h('article', 'post-view');
    var back = h('a', 'post-back', L[lang()].back);
    back.href = '#';
    v.appendChild(back);
    v.appendChild(meta(p));
    v.appendChild(h('h1', '', p.title));

    if (validVideo(p.video)) {
      var wrap = h('div', 'post-video');
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + p.video + '?rel=0';
      f.title = p.title;
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.setAttribute('allowfullscreen', '');
      f.referrerPolicy = 'strict-origin-when-cross-origin';
      wrap.appendChild(f);
      v.appendChild(wrap);
      var yt = h('a', 'post-yt', L[lang()].yt + ' ↗');
      yt.href = 'https://www.youtube.com/watch?v=' + p.video;
      yt.target = '_blank'; yt.rel = 'noopener';
      v.appendChild(yt);
    }

    if (p.image) {
      var img = h('img', 'post-image');
      img.src = p.image; img.alt = p.title;
      v.appendChild(img);
    }
    String(p.text || '').split(/\n{2,}/).forEach(function (para) {
      if (para.trim()) v.appendChild(h('p', 'post-para', para.trim()));
    });
    var back2 = h('a', 'btn btn-ghost', L[lang()].back);
    back2.href = '#';
    v.appendChild(back2);
    root.appendChild(v);
    document.title = p.title + ' — Mirela Leka Xhava';
  }

  function route() {
    var id = decodeURIComponent((location.hash || '').slice(1));
    var p = null;
    for (var i = 0; i < posts.length; i++) { if (posts[i].id === id) { p = posts[i]; break; } }
    if (p) renderPost(p); else renderList();
  }

  /* ---------- Page d'accueil : section « À la une » ---------- */
  var HOME_MAX = 2;   // nombre maximum d'articles mis en avant affichés sur l'accueil
  function renderHome() {
    var section = homeRoot.closest('section');
    var pinned = sortPosts(posts).filter(function (p) { return p.pinned; }).slice(0, HOME_MAX);
    homeRoot.textContent = '';
    if (!pinned.length) { if (section) section.hidden = true; return; }   // rien d'épinglé : la section n'apparaît pas
    pinned.forEach(function (p) { homeRoot.appendChild(buildCard(p, 'blog.html#')); });
    if (section) section.hidden = false;
  }

  function refresh() {
    if (root) route();
    if (homeRoot) renderHome();
  }

  if (root) window.addEventListener('hashchange', function () { route(); window.scrollTo(0, 0); });
  document.addEventListener('mlx:lang', refresh);   // changement de langue du site : on redessine (dates, étiquettes)
  refresh();
})();
