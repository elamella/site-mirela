/* ==========================================================
   Mirela Leka Xhava — comportement du site
   - sélecteur de langue FR / EN / SQ / IT (le français est la langue de base :
     son texte vit directement dans le HTML, les autres langues sont ci-dessous)
   - menu mobile, lightbox de la galerie
   ========================================================== */
(function () {
  'use strict';

  var LANGS = {
    fr: { code: 'FR', name: 'Français' },
    en: { code: 'EN', name: 'English' },
    sq: { code: 'SQ', name: 'Shqip' },
    it: { code: 'IT', name: 'Italiano' }
  };

  /* ---------- Traductions (fr = texte du HTML) ---------- */
  var T = {
    en: {
      't.index': 'Mirela Leka Xhava — French-Albanian writer & poet',
      't.prix': 'Awards & honours — Mirela Leka Xhava',
      't.entretiens': 'Interviews — Mirela Leka Xhava',
      't.galerie': 'Gallery — Mirela Leka Xhava',

      'nav.home': 'Home', 'nav.bio': 'About', 'nav.books': 'Books', 'nav.prizes': 'Awards',
      'nav.interviews': 'Interviews', 'nav.gallery': 'Gallery', 'nav.contact': 'Contact',
      'nav.menu': 'Menu', 'lang.label': 'Language',
      'nav.blog': 'Blog',
      't.blog': 'Blog — Mirela Leka Xhava',
      'b.eyebrow': 'News',
      'b.title': 'Blog',
      'b.intro': 'Texts, images and news from Mirela, shared over time.',
      'b.welcome': 'Welcome to Mirela’s blog. Over time, you will find her news, texts and images here. Thank you for visiting.',
      'home.feat.title': 'Featured',
      'home.feat.all': 'See all posts',

      'hero.quote': 'Life is a philosophy and a lesson for those who know how to perceive it.',
      'hero.role': 'French-Albanian writer and poet',
      'hero.cta_books': 'Discover her books',
      'hero.cta_bio': 'Read her biography',
      'stat1.l': 'collections published',
      'stat2.l': 'countries where her poems have appeared',
      'stat3.l': 'first collection published',
      'stat4.l': 'languages of publication',
      'feat.label': 'Latest collection · 2025',
      'feat.desc': 'A bridge between two languages and two worlds: a poetic testimony between emotion and reflection, where each poem invites an inner journey through memories, hopes and questions of identity.',
      'alt.portrait1': 'Portrait of Mirela Leka Xhava among autumn leaves',
      'alt.portrait2': 'Black-and-white portrait of Mirela Leka Xhava',
      'alt.banner': 'Fountain pen and handwritten letter with flowers',
      'credit.photo': 'Banner photo:',

      'bio.eyebrow': 'The author',
      'bio.title': 'About',
      'bio.p1': 'I am a French-Albanian author, born in Elbasan, Albania. Passionate about literature since childhood, my texts have been published from time to time in various magazines and newspapers.',
      'bio.p2': 'I hold a degree in Albanian Language and Literature from “A. Xhuvani” University in Elbasan. Until 2002, before emigrating to France, I worked as a librarian at the city’s university library and was a member of the Elbasan Writers’ League.',
      'bio.p3': 'My poems have appeared in prestigious journals and newspapers in Albania, Kosovo, France, England, Canada, the United States, Belgium, India, Tunisia, Romania, Bulgaria, Italy, the Dominican Republic and the Netherlands, as well as on French online literary websites. I take part in book fairs and festivals, and I am also active in the field of contemporary literature.',
      'bio.p4': 'My texts have been published regularly in the literary magazine Poètes Sans Frontières “Florilège” (Dijon), on Poetika17.com, in the RAL-M review, in the Canadian anthology of literary poetry for the defence of children Ethics and Global Education, in the international anthology Poets for Peace (Tunisia), in the anthology Paris Window (vol. 2, Poetry), in the anthology Confessions (India), in the annual anthologies Atunis Galaxy Poetry (Belgium), and more.',
      'bio.members': 'I am a member of',
      'bio.m1': 'Les Poètes de l’amitié, Poètes sans frontières – Dijon (association)',
      'bio.m2': 'Association Francophone de Haïku (AFH)',
      'bio.m3': 'Association des Poètes Français, since 2024',
      'bio.closing': 'I am currently working on my next books. I live with my family in Bordeaux, France.',
      'bio.role': 'French-Albanian writer and poet',

      'books.eyebrow': 'Bibliography',
      'books.title': 'Her books',
      'books.intro': 'Poetry collections, available in bookshops and online.',
      'tag.fr': 'Poems · French',
      'tag.fr_tr': 'Poems · French, translated from Albanian',
      'tag.sq': 'Poems · Albanian',
      'tag.bi': 'Poems · bilingual Albanian–French',
      'b.udhetar.sub': 'Albanian version of “Voyageur des vents du sud”',
      'b.voyageur.sub': 'French version of “Udhëtar me erën e jugut”',
      'b.dimrin.sub': '“I don’t want winter in my eyes” — her first collection',
      'buy.amazon_both': 'Buy on Amazon (paperback & Kindle)',
      'buy.amazon': 'Buy on Amazon',
      'buy.kindle': 'Buy on Amazon (Kindle)',
      'buy.lulu_paper': 'Buy on Lulu (paperback)',
      'buy.lulu_ebook': 'Buy on Lulu (ebook)',
      'buy.maia': 'View at Éditions Maïa',
      'buy.gallimard': 'View at Librairie Gallimard',
      'buy.library': 'Mériadeck Library, Bordeaux',

      'more.title': 'Explore further',
      'more.prizes.text': 'Competitions, festivals and awards along her journey.',
      'more.int.text': 'Conversations about her writing, her inspirations and her path.',
      'more.gal.text': 'Moments and memories from her literary journey.',
      'more.cta': 'Discover',

      'contact.eyebrow': 'Contact',
      'contact.title': 'Contact',
      'contact.text': 'For a meeting, a reading, a book fair or a press enquiry, you can write to Mirela by e-mail or through her Facebook page.',
      'contact.mail': 'Send an e-mail',
      'contact.fb': 'Write on Facebook',

      'p.eyebrow': 'Recognition',
      'p.title': 'Awards & honours',
      'p.intro': 'Literary distinctions received in international competitions and festivals.',
      'pz1.t': 'Grand Jury Prize',
      'pz1.d': '8th Amilcare Solferini International Literary Competition — Turin, Italy',
      'pz2.t': 'I.P.A. Special Prize “Poetry of the Peoples”',
      'pz2.d': 'In memory of Alfredo Pirola — 34th “Centro Giovani e Poesia” International Prize, Triuggio, Italy',
      'pz3.t': '“Foreigner” Prize',
      'pz3.d': 'International Prize of Excellence “Città del Galateo” (11th edition) — Verbumlandi Arts Aps, Milan, Italy, 25 October 2024',
      'pz4.t': 'Finalist and Honorable Mention',
      'pz4.d': 'Mediterranean Poetry Prize 2021/2022 (Mediterranean Poetry Festival) — Rome, Italy',
      'pz5.t': 'Semi-finalist',
      'pz5.d': 'Mili-Dueli competition — Bosnia and Herzegovina',
      'pz6.t': 'Diploma of Honour',
      'pz6.d': '24th edition of the Printemps des Poètes — Sartrouville, France',
      'p.more': '… and other honours.',

      'e.eyebrow': 'In conversation',
      'e.title': 'Interviews',
      'e.intro': 'Conversations about her writing, her sources of inspiration and her journey.',
      'e.read': 'Read the interview',
      'e.lang_sq': 'In Albanian',
      'e1.t': 'Interview with Mirela Leka Xhava',
      'e1.d': 'Interview published in the “Entretiens Auteurs” section of the literary website Poetika17.com.',
      'e2.d': 'She talks about starting to write around the age of eleven, her inspirations (classic French poetry — Baudelaire, Hugo, Prévert — as well as life and nature), her favourite themes — family love, beauty, memories of the communist era, peace — and her view of poetry as emotion, dream and therapy.',
      'e2.date': '2 February 2026',

      'g.eyebrow': 'Moments',
      'g.title': 'Gallery',
      'g.intro': 'Moments and memories from her literary journey.',
      'g1': 'Poster of the Mediterranean Poetry Prize 2021/2022 ceremony — Rome, Palazzo Firenze, 9 September 2022',
      'g2': 'Mirela with her Finalist and Honorable Mention diploma — Mediterranean Poetry',
      'g3': 'Awards ceremony at Palazzo Firenze, Rome',
      'g4': 'The audience at the ceremony',
      'g5': 'The speakers’ table, Società Dante Alighieri',
      'g6': 'Certificate of contribution — International Literature Language Journal',
      'g7': '“Foreigner” Prize — International Prize of Excellence “Città del Galateo” (11th edition), Milan, 25 October 2024',
      'g8': 'I.P.A. Special Prize “Poetry of the Peoples” — Triuggio, 15 June 2025',
      'g9': 'Title of “Krijues e shquar” (Distinguished Creator) — “Pegasi” International Association of Poets, Writers and Artists, Albania, 23 April 2026',
      'g.close': 'Close'
    },

    sq: {
      't.index': 'Mirela Leka Xhava — shkrimtare dhe poete franko-shqiptare',
      't.prix': 'Çmime & dallime — Mirela Leka Xhava',
      't.entretiens': 'Intervista — Mirela Leka Xhava',
      't.galerie': 'Galeria — Mirela Leka Xhava',

      'nav.home': 'Kreu', 'nav.bio': 'Rreth meje', 'nav.books': 'Librat', 'nav.prizes': 'Çmimet',
      'nav.interviews': 'Intervistat', 'nav.gallery': 'Galeria', 'nav.contact': 'Kontakt',
      'nav.menu': 'Menuja', 'lang.label': 'Gjuha',
      'nav.blog': 'Blogu',
      't.blog': 'Blogu — Mirela Leka Xhava',
      'b.eyebrow': 'Lajme',
      'b.title': 'Blogu',
      'b.intro': 'Tekste, imazhe dhe lajme nga Mirela, të ndara me kohë.',
      'b.welcome': 'Mirë se vini në blogun e Mirelës. Këtu, me kalimin e kohës, do të gjeni lajmet e saj, tekste dhe imazhe. Faleminderit për vizitën.',
      'home.feat.title': 'Në ballë',
      'home.feat.all': 'Shiko të gjithë artikujt',

      'hero.quote': 'Jeta është filozofi dhe mësim për atë që di ta perceptojë.',
      'hero.role': 'Shkrimtare dhe poete franko-shqiptare',
      'hero.cta_books': 'Zbulo librat e saj',
      'hero.cta_bio': 'Lexo biografinë',
      'stat1.l': 'përmbledhje të botuara',
      'stat2.l': 'vende ku janë botuar poezitë e saj',
      'stat3.l': 'përmbledhja e parë e botuar',
      'stat4.l': 'gjuhë botimi',
      'feat.label': 'Përmbledhja e fundit · 2025',
      'feat.desc': 'Një urë mes dy gjuhësh dhe dy botëve: një dëshmi poetike mes emocionit dhe reflektimit, ku çdo poezi është ftesë për një udhëtim të brendshëm nëpër kujtime, shpresa dhe pyetje identiteti.',
      'alt.portrait1': 'Portret i Mirela Leka Xhavës mes gjetheve të vjeshtës',
      'alt.portrait2': 'Portret bardhezi i Mirela Leka Xhavës',
      'alt.banner': 'Penë me bojë dhe letër e shkruar me dorë me lule',
      'credit.photo': 'Fotoja e banerit:',

      'bio.eyebrow': 'Autorja',
      'bio.title': 'Rreth meje',
      'bio.p1': 'Jam autore franko-shqiptare, e lindur në Elbasan, Shqipëri. E apasionuar pas letërsisë që në fëmijëri, tekstet e mia janë botuar herë pas here në revista dhe gazeta të ndryshme.',
      'bio.p2': 'E diplomuar në Gjuhë dhe Letërsi Shqipe në Universitetin «A. Xhuvani» të Elbasanit, deri në vitin 2002, para se të emigroja në Francë, kam punuar si bibliotekare në bibliotekën universitare të qytetit dhe kam qenë anëtare e Lidhjes së Shkrimtarëve të Elbasanit.',
      'bio.p3': 'Poezitë e mia janë botuar në revista dhe gazeta të njohura në Shqipëri, Kosovë, Francë, Angli, Kanada, Shtetet e Bashkuara, Belgjikë, Indi, Tunizi, Rumani, Bullgari, Itali, Republikën Dominikane dhe Holandë, si dhe në faqe letrare franceze online. Marr pjesë në salone dhe panaire librash dhe jam e angazhuar edhe në fushën e letërsisë bashkëkohore.',
      'bio.p4': 'Tekstet e mia janë botuar periodikisht në revistën letrare Poètes Sans Frontières «Florilège» (Dijon), në Poetika17.com, në revistën RAL-M, në antologjinë kanadeze të poezisë letrare për mbrojtjen e fëmijëve Ethics and Global Education, në antologjinë ndërkombëtare Poets for Peace (Tunizi), në antologjinë Paris Window (vëll. 2, Poezi), në antologjinë Confessions (Indi), në antologjitë vjetore Atunis Galaxy Poetry (Belgjikë), etj.',
      'bio.members': 'Jam anëtare e',
      'bio.m1': 'Shoqatës «Les Poètes de l’amitié», Poètes sans frontières – Dijon',
      'bio.m2': 'Shoqatës Frankofone të Haikut (Association Francophone de Haïku, AFH)',
      'bio.m3': 'Shoqatës së Poetëve Francezë (Association des Poètes Français) që nga viti 2024',
      'bio.closing': 'Aktualisht punoj për veprat e mia të ardhshme. Jetoj me familjen time në Bordeaux, Francë.',
      'bio.role': 'Shkrimtare dhe poete franko-shqiptare',

      'books.eyebrow': 'Bibliografia',
      'books.title': 'Librat e saj',
      'books.intro': 'Përmbledhje poezish, të disponueshme në librari dhe online.',
      'tag.fr': 'Poezi · frëngjisht',
      'tag.fr_tr': 'Poezi · frëngjisht, përkthyer nga shqipja',
      'tag.sq': 'Poezi · shqip',
      'tag.bi': 'Poezi · dygjuhësh shqip–frëngjisht',
      'b.udhetar.sub': 'Versioni shqip i «Voyageur des vents du sud»',
      'b.voyageur.sub': 'Versioni frëngjisht i «Udhëtar me erën e jugut»',
      'b.dimrin.sub': 'Përmbledhja e saj e parë me poezi',
      'buy.amazon_both': 'Bli në Amazon (i printuar & Kindle)',
      'buy.amazon': 'Bli në Amazon',
      'buy.kindle': 'Bli në Amazon (Kindle)',
      'buy.lulu_paper': 'Bli në Lulu (i printuar)',
      'buy.lulu_ebook': 'Bli në Lulu (ebook)',
      'buy.maia': 'Shiko te Éditions Maïa',
      'buy.gallimard': 'Shiko në Librairie Gallimard',
      'buy.library': 'Biblioteka Mériadeck, Bordeaux',

      'more.title': 'Zbulo më shumë',
      'more.prizes.text': 'Konkurset, festivalet dhe çmimet që shënojnë rrugëtimin e saj.',
      'more.int.text': 'Biseda rreth shkrimit të saj, frymëzimeve dhe rrugës së saj.',
      'more.gal.text': 'Çaste dhe kujtime nga rrugëtimi i saj letrar.',
      'more.cta': 'Zbulo',

      'contact.eyebrow': 'Kontakt',
      'contact.title': 'Kontakt',
      'contact.text': 'Për një takim, një lexim, një sallon librash ose një kërkesë për shtyp, mund t’i shkruani Mirelës me e-mail ose përmes faqes së saj në Facebook.',
      'contact.mail': 'Dërgo një e-mail',
      'contact.fb': 'Shkruaj në Facebook',

      'p.eyebrow': 'Njohje',
      'p.title': 'Çmime & dallime',
      'p.intro': 'Dallime letrare të marra në konkurse dhe festivale ndërkombëtare.',
      'pz1.t': 'Çmimi i Madh i Jurisë',
      'pz1.d': 'Konkursi i 8-të letrar ndërkombëtar Amilcare Solferini — Torino, Itali',
      'pz2.t': 'Çmimi special I.P.A. «Poezia e popujve»',
      'pz2.d': 'Në kujtim të Alfredo Pirolës — Çmimi ndërkombëtar i 34-të «Centro Giovani e Poesia», Triuggio, Itali',
      'pz3.t': 'Çmimi «Foreigner»',
      'pz3.d': 'Çmimi ndërkombëtar i Përsosmërisë «Città del Galateo» (edicioni i 11-të) — Verbumlandi Arts Aps, Milano, Itali, 25 tetor 2024',
      'pz4.t': 'Finaliste dhe përmendje nderi',
      'pz4.d': 'Mediterranean Poetry Prize 2021/2022 (Festivali i poezisë mesdhetare) — Romë, Itali',
      'pz5.t': 'Gjysmëfinaliste',
      'pz5.d': 'Konkursi Mili-Dueli — Bosnjë dhe Hercegovinë',
      'pz6.t': 'Diplomë nderi',
      'pz6.d': 'Edicioni i 24-t i Printemps des Poètes — Sartrouville, Francë',
      'p.more': '… dhe dallime të tjera.',

      'e.eyebrow': 'Në bisedë',
      'e.title': 'Intervistat',
      'e.intro': 'Biseda rreth shkrimit të saj, burimeve të frymëzimit dhe rrugëtimit të saj.',
      'e.read': 'Lexo intervistën',
      'e.lang_sq': 'Në shqip',
      'e1.t': 'Intervistë me Mirela Leka Xhava',
      'e1.d': 'Intervistë e botuar në rubrikën «Entretiens Auteurs» të faqes letrare Poetika17.com.',
      'e2.d': 'Ajo rrëfen se si nisi të shkruajë rreth moshës njëmbëdhjetë vjeç, frymëzimet e saj (poezia klasike franceze — Baudelaire, Hugo, Prévert — si dhe jeta dhe natyra), temat e saj të preferuara — dashuria për familjen, bukuria, kujtimet e kohës komuniste, paqja — dhe pikëpamjen e saj për poezinë si emocion, ëndërr dhe terapi.',
      'e2.date': '2 shkurt 2026',

      'g.eyebrow': 'Çaste',
      'g.title': 'Galeria',
      'g.intro': 'Çaste dhe kujtime nga rrugëtimi i saj letrar.',
      'g1': 'Afishja e ceremonisë së Mediterranean Poetry Prize 2021/2022 — Romë, Palazzo Firenze, 9 shtator 2022',
      'g2': 'Mirela me diplomën e finalistes dhe përmendjes së nderit — Mediterranean Poetry',
      'g3': 'Ceremonia e ndarjes së çmimeve në Palazzo Firenze, Romë',
      'g4': 'Publiku i ceremonisë',
      'g5': 'Tavolina e folësve, Società Dante Alighieri',
      'g6': 'Certifikatë kontributi — International Literature Language Journal',
      'g7': 'Çmimi «Foreigner» — Çmimi ndërkombëtar i Përsosmërisë «Città del Galateo» (edicioni i 11-të), Milano, 25 tetor 2024',
      'g8': 'Çmimi special I.P.A. «Poezia e popujve» — Triuggio, 15 qershor 2025',
      'g9': 'Titulli «Krijues e shquar» — Lidhja Ndërkombëtare e Poetëve, Shkrimtarëve dhe Artistëve «Pegasi», Shqipëri, 23 prill 2026',
      'g.close': 'Mbyll'
    },

    it: {
      't.index': 'Mirela Leka Xhava — scrittrice e poetessa franco-albanese',
      't.prix': 'Premi e riconoscimenti — Mirela Leka Xhava',
      't.entretiens': 'Interviste — Mirela Leka Xhava',
      't.galerie': 'Galleria — Mirela Leka Xhava',

      'nav.home': 'Home', 'nav.bio': 'Chi sono', 'nav.books': 'Libri', 'nav.prizes': 'Premi',
      'nav.interviews': 'Interviste', 'nav.gallery': 'Galleria', 'nav.contact': 'Contatti',
      'nav.menu': 'Menu', 'lang.label': 'Lingua',
      'nav.blog': 'Blog',
      't.blog': 'Blog — Mirela Leka Xhava',
      'b.eyebrow': 'Novità',
      'b.title': 'Blog',
      'b.intro': 'Testi, immagini e notizie di Mirela, condivisi nel tempo.',
      'b.welcome': 'Benvenuti nel blog di Mirela. Con il tempo, troverete qui le sue novità, testi e immagini. Grazie della visita.',
      'home.feat.title': 'In evidenza',
      'home.feat.all': 'Vedi tutti gli articoli',

      'hero.quote': 'La vita è filosofia e insegnamento per chi sa coglierla.',
      'hero.role': 'Scrittrice e poetessa franco-albanese',
      'hero.cta_books': 'Scopri i suoi libri',
      'hero.cta_bio': 'Leggi la biografia',
      'stat1.l': 'raccolte pubblicate',
      'stat2.l': 'paesi in cui sono apparse le sue poesie',
      'stat3.l': 'prima raccolta pubblicata',
      'stat4.l': 'lingue di pubblicazione',
      'feat.label': 'Ultima raccolta · 2025',
      'feat.desc': 'Un ponte tra due lingue e due mondi: una testimonianza poetica tra emozione e riflessione, in cui ogni poesia invita a un viaggio interiore tra ricordi, speranze e domande sull’identità.',
      'alt.portrait1': 'Ritratto di Mirela Leka Xhava tra le foglie d’autunno',
      'alt.portrait2': 'Ritratto in bianco e nero di Mirela Leka Xhava',
      'alt.banner': 'Penna stilografica e lettera manoscritta con fiori',
      'credit.photo': 'Foto del banner:',

      'bio.eyebrow': 'L’autrice',
      'bio.title': 'Chi sono',
      'bio.p1': 'Sono un’autrice franco-albanese, nata a Elbasan, in Albania. Appassionata di letteratura fin dall’infanzia, i miei testi sono stati pubblicati occasionalmente su diverse riviste e giornali.',
      'bio.p2': 'Laureata in Lingua e Letteratura albanese presso l’Università «A. Xhuvani» di Elbasan, fino al 2002, prima di emigrare in Francia, ho lavorato come bibliotecaria presso la biblioteca universitaria della città e sono stata membro della Lega degli scrittori di Elbasan.',
      'bio.p3': 'Le mie poesie sono apparse in riviste e giornali prestigiosi in Albania, Kosovo, Francia, Inghilterra, Canada, Stati Uniti, Belgio, India, Tunisia, Romania, Bulgaria, Italia, Repubblica Dominicana e Paesi Bassi, nonché su siti letterari francesi online. Partecipo a saloni e fiere del libro e sono attiva anche nel campo della letteratura contemporanea.',
      'bio.p4': 'I miei testi sono stati pubblicati periodicamente nella rivista letteraria Poètes Sans Frontières «Florilège» (Digione), su Poetika17.com, nella rivista RAL-M, nell’antologia canadese di poesia letteraria per la difesa dei bambini Ethics and Global Education, nell’antologia internazionale Poets for Peace (Tunisia), nell’antologia Paris Window (vol. 2, Poesia), nell’antologia Confessions (India), nelle antologie annuali Atunis Galaxy Poetry (Belgio), ecc.',
      'bio.members': 'Sono membro di',
      'bio.m1': 'Associazione Les Poètes de l’amitié, Poètes sans frontières – Digione',
      'bio.m2': 'Association Francophone de Haïku (AFH)',
      'bio.m3': 'Association des Poètes Français, dal 2024',
      'bio.closing': 'Sto lavorando attualmente alle mie prossime opere. Vivo con la mia famiglia a Bordeaux, in Francia.',
      'bio.role': 'Scrittrice e poetessa franco-albanese',

      'books.eyebrow': 'Bibliografia',
      'books.title': 'I suoi libri',
      'books.intro': 'Raccolte di poesie, disponibili in libreria e online.',
      'tag.fr': 'Poesie · francese',
      'tag.fr_tr': 'Poesie · francese, tradotto dall’albanese',
      'tag.sq': 'Poesie · albanese',
      'tag.bi': 'Poesie · bilingue albanese–francese',
      'b.udhetar.sub': 'Versione albanese di «Voyageur des vents du sud»',
      'b.voyageur.sub': 'Versione francese di «Udhëtar me erën e jugut»',
      'b.dimrin.sub': '«Non voglio l’inverno negli occhi» — la sua prima raccolta',
      'buy.amazon_both': 'Acquista su Amazon (brossura e Kindle)',
      'buy.amazon': 'Acquista su Amazon',
      'buy.kindle': 'Acquista su Amazon (Kindle)',
      'buy.lulu_paper': 'Acquista su Lulu (brossura)',
      'buy.lulu_ebook': 'Acquista su Lulu (ebook)',
      'buy.maia': 'Vedi presso Éditions Maïa',
      'buy.gallimard': 'Vedi alla Librairie Gallimard',
      'buy.library': 'Biblioteca Mériadeck, Bordeaux',

      'more.title': 'Scopri di più',
      'more.prizes.text': 'Concorsi, festival e riconoscimenti che segnano il suo percorso.',
      'more.int.text': 'Conversazioni sulla sua scrittura, le sue ispirazioni e il suo percorso.',
      'more.gal.text': 'Momenti e ricordi del suo percorso letterario.',
      'more.cta': 'Scopri',

      'contact.eyebrow': 'Contatti',
      'contact.title': 'Contatti',
      'contact.text': 'Per un incontro, una lettura, una fiera del libro o una richiesta stampa, potete scrivere a Mirela via e-mail o tramite la sua pagina Facebook.',
      'contact.mail': 'Invia un’e-mail',
      'contact.fb': 'Scrivi su Facebook',

      'p.eyebrow': 'Riconoscimenti',
      'p.title': 'Premi e riconoscimenti',
      'p.intro': 'Riconoscimenti letterari ricevuti in concorsi e festival internazionali.',
      'pz1.t': 'Gran Premio della Giuria',
      'pz1.d': '8º Concorso letterario internazionale Amilcare Solferini — Torino, Italia',
      'pz2.t': 'Premio speciale I.P.A. «Poesia dei Popoli»',
      'pz2.d': 'In memoria di Alfredo Pirola — 34º Premio internazionale «Centro Giovani e Poesia», Triuggio, Italia',
      'pz3.t': 'Premio «Foreigner»',
      'pz3.d': 'Premio Internazionale d’Eccellenza «Città del Galateo» (XI edizione) — Verbumlandi Arts Aps, Milano, Italia, 25 ottobre 2024',
      'pz4.t': 'Finalista e menzione d’onore',
      'pz4.d': 'Mediterranean Poetry Prize 2021/2022 (Festival della poesia mediterranea) — Roma, Italia',
      'pz5.t': 'Semifinalista',
      'pz5.d': 'Concorso Mili-Dueli — Bosnia-Erzegovina',
      'pz6.t': 'Diploma d’onore',
      'pz6.d': '24ª edizione del Printemps des Poètes — Sartrouville, Francia',
      'p.more': '… e altri riconoscimenti.',

      'e.eyebrow': 'In conversazione',
      'e.title': 'Interviste',
      'e.intro': 'Conversazioni sulla sua scrittura, le sue fonti di ispirazione e il suo percorso.',
      'e.read': 'Leggi l’intervista',
      'e.lang_sq': 'In albanese',
      'e1.t': 'Intervista a Mirela Leka Xhava',
      'e1.d': 'Intervista pubblicata nella rubrica «Entretiens Auteurs» del sito letterario Poetika17.com.',
      'e2.d': 'Racconta di aver iniziato a scrivere intorno agli undici anni, le sue ispirazioni (la poesia classica francese — Baudelaire, Hugo, Prévert — ma anche la vita e la natura), i suoi temi prediletti — l’amore per la famiglia, la bellezza, i ricordi dell’epoca comunista, la pace — e la sua idea di poesia come emozione, sogno e terapia.',
      'e2.date': '2 febbraio 2026',

      'g.eyebrow': 'Momenti',
      'g.title': 'Galleria',
      'g.intro': 'Momenti e ricordi del suo percorso letterario.',
      'g1': 'Locandina della cerimonia del Mediterranean Poetry Prize 2021/2022 — Roma, Palazzo Firenze, 9 settembre 2022',
      'g2': 'Mirela con il diploma di finalista e menzione d’onore — Mediterranean Poetry',
      'g3': 'Cerimonia di premiazione a Palazzo Firenze, Roma',
      'g4': 'Il pubblico della cerimonia',
      'g5': 'Il tavolo dei relatori, Società Dante Alighieri',
      'g6': 'Attestato di contributo — International Literature Language Journal',
      'g7': 'Premio «Foreigner» — Premio Internazionale d’Eccellenza «Città del Galateo» (XI edizione), Milano, 25 ottobre 2024',
      'g8': 'Premio speciale I.P.A. «Poesia dei Popoli» — Triuggio, 15 giugno 2025',
      'g9': 'Titolo di «Krijues e shquar» (creatrice illustre) — Associazione internazionale di poeti, scrittori e artisti «Pegasi», Albania, 23 aprile 2026',
      'g.close': 'Chiudi'
    }
  };

  var STORE_KEY = 'mlx-lang';
  var current = 'fr';
  var frText = new Map();     // élément -> texte français d'origine
  var frAlt = new Map();      // élément -> alt français d'origine
  var frAria = new Map();
  var frTitle = document.title;

  function tr(key, lang) {
    if (lang === 'fr') return null;
    return (T[lang] && T[lang][key]) || null;
  }

  function cacheFrench() {
    document.querySelectorAll('[data-i18n]').forEach(function (el) { frText.set(el, el.textContent); });
    document.querySelectorAll('[data-i18n-alt]').forEach(function (el) { frAlt.set(el, el.getAttribute('alt')); });
    document.querySelectorAll('[data-i18n-aria]').forEach(function (el) { frAria.set(el, el.getAttribute('aria-label')); });
  }

  function apply(lang) {
    current = lang;
    document.documentElement.lang = lang;

    frText.forEach(function (fr, el) {
      var v = tr(el.getAttribute('data-i18n'), lang);
      el.textContent = v !== null ? v : fr;
    });
    frAlt.forEach(function (fr, el) {
      var v = tr(el.getAttribute('data-i18n-alt'), lang);
      el.setAttribute('alt', v !== null ? v : fr);
    });
    frAria.forEach(function (fr, el) {
      var v = tr(el.getAttribute('data-i18n-aria'), lang);
      el.setAttribute('aria-label', v !== null ? v : fr);
    });

    var tkey = document.body.getAttribute('data-title-key');
    var tv = tkey ? tr(tkey, lang) : null;
    document.title = tv !== null ? tv : frTitle;

    // alt des photos de la galerie = légende affichée
    document.querySelectorAll('figure.shot').forEach(function (f) {
      var img = f.querySelector('img'), cap = f.querySelector('figcaption');
      if (img && cap) img.alt = cap.textContent;
    });

    var codeEl = document.getElementById('lang-code');
    if (codeEl) codeEl.textContent = LANGS[lang].code;
    document.querySelectorAll('.lang-menu button').forEach(function (b) {
      b.setAttribute('aria-current', b.getAttribute('data-lang') === lang ? 'true' : 'false');
    });

    try { localStorage.setItem(STORE_KEY, lang); } catch (e) { /* stockage indisponible : sans importance */ }

    fillTicker();   // la largeur des textes change avec la langue

    // prévient les autres scripts (ex. le blog) pour qu'ils redessinent dans la nouvelle langue
    document.dispatchEvent(new CustomEvent('mlx:lang', { detail: lang }));
  }

  function initLang() {
    cacheFrench();

    var btn = document.getElementById('lang-btn');
    var menu = document.getElementById('lang-menu');
    if (btn && menu) {
      function setOpen(open) {
        menu.classList.toggle('open', open);
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      }
      btn.addEventListener('click', function (e) { e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
      menu.addEventListener('click', function (e) {
        var b = e.target.closest('button[data-lang]');
        if (!b) return;
        apply(b.getAttribute('data-lang'));
        setOpen(false);
        btn.focus();
      });
      document.addEventListener('click', function () { setOpen(false); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setOpen(false); });
    }

    var saved = 'fr';
    try { saved = localStorage.getItem(STORE_KEY) || 'fr'; } catch (e) { /* ignore */ }
    if (!LANGS[saved]) saved = 'fr';
    apply(saved);
  }

  /* ---------- Menu mobile ---------- */
  function initNav() {
    var burger = document.getElementById('burger');
    var nav = document.getElementById('nav');
    if (!burger || !nav) return;
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  /* ---------- Lightbox ---------- */
  function initLightbox() {
    var targets = document.querySelectorAll('[data-lightbox]');
    if (!targets.length) return;

    var box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button type="button" aria-label="Fermer" data-i18n-aria="g.close">×</button><img alt=""><p></p>';
    document.body.appendChild(box);
    var closeBtn = box.querySelector('button');
    frAria.set(closeBtn, 'Fermer');
    var img = box.querySelector('img');
    var cap = box.querySelector('p');

    function open(el) {
      var fig = el.closest('figure');
      img.src = el.getAttribute('data-full') || el.src;
      img.alt = el.alt || '';
      cap.textContent = fig && fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent : (el.alt || '');
      box.classList.add('open');
      closeBtn.focus();
    }
    function close() { box.classList.remove('open'); img.removeAttribute('src'); }

    targets.forEach(function (el) {
      el.addEventListener('click', function () { open(el); });
    });
    box.addEventListener('click', function (e) { if (e.target === box || e.target === closeBtn) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) close(); });
  }

  /* ---------- Bande défilante : remplit la largeur et boucle sans coupure ---------- */
  var tickerTimer = null;
  function fillTicker() {
    document.querySelectorAll('.ticker').forEach(function (t) {
      var track = t.querySelector('.ticker-track');
      var base = track && track.querySelector('.ticker-group[data-base]');
      if (!base) return;
      // repartir de zéro (langue ou taille d'écran changées)
      track.querySelectorAll('.ticker-group.clone').forEach(function (n) { n.remove(); });
      base.querySelectorAll('li.dup').forEach(function (n) { n.remove(); });
      var items = [].slice.call(base.querySelectorAll('li'));
      // le groupe de base doit être plus large que l'écran, sinon on verrait un vide dans la boucle
      var guard = 0;
      while (base.getBoundingClientRect().width < t.clientWidth * 1.05 && guard++ < 8) {
        items.forEach(function (li) {
          var c = li.cloneNode(true);
          c.classList.add('dup');
          c.setAttribute('aria-hidden', 'true');
          base.appendChild(c);
        });
      }
      var clone = base.cloneNode(true);
      clone.classList.add('clone');
      clone.removeAttribute('data-base');
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
      var w = base.getBoundingClientRect().width;
      track.style.setProperty('--dur', Math.max(12, w / 55) + 's');   // ~55 px par seconde
    });
  }
  window.addEventListener('resize', function () {
    clearTimeout(tickerTimer);
    tickerTimer = setTimeout(fillTicker, 200);
  });

  /* ---------- Photos : petite inclinaison 3D qui suit la souris ---------- */
  function initTilt() {
    // seulement avec une vraie souris, et sans « réduire les animations »
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    document.querySelectorAll('.hero-photo img, .bio-side img, .book-cover img, .feature-cover img').forEach(function (el) {
      var max = el.matches('.book-cover img, .feature-cover img') ? 9 : 6;   // degrés max
      var raf = 0;
      el.classList.add('tilt');
      el.addEventListener('pointerenter', function () { el.classList.add('is-tilting'); });
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;    // -0.5 … 0.5
        var py = (e.clientY - r.top) / r.height - 0.5;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          el.style.transform = 'perspective(900px) rotateX(' + (-py * max).toFixed(2) + 'deg) rotateY(' + (px * max).toFixed(2) + 'deg) scale(1.035)';
        });
      });
      el.addEventListener('pointerleave', function () {
        cancelAnimationFrame(raf);
        el.classList.remove('is-tilting');
        el.style.transform = '';
      });
    });
  }

  /* ---------- Apparition douce au défilement ---------- */
  function initReveal() {
    var els = document.querySelectorAll('.reveal, .prize, .talk, .shot, .book');
    if (!('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          var t = e.target;
          t.classList.add('in');
          io.unobserve(t);
          setTimeout(function () { t.style.transitionDelay = ''; }, 1200);   // le délai ne doit pas gêner les survols
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((i % 4) * 70) + 'ms';
      io.observe(el);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initReveal();
    initTilt();
    initNav();
    initLightbox();   // avant initLang pour que le bouton « fermer » soit traduit
    initLang();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fillTicker);   // largeurs définitives une fois les polices chargées
  });
})();
