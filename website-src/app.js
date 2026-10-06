const titles = {
  home: '首頁',
  about: '關於昊道',
  learning: '學習地圖',
  courses: '課程與活動',
  community: '各地共學與陪伴',
  retreat: '修煉營',
  volunteer: '昊道志工',
  'volunteer-reflections': '志工成長心得',
  gallery: '昊道法舟數位館',
  contact: '聯絡我們',
};
const english = {
  about: 'ABOUT HAODAO',
  learning: 'LEARNING MAP',
  courses: 'COURSES & EVENTS',
  community: 'GROWING TOGETHER',
  retreat: 'PRACTICE & TRANSFORMATION',
  volunteer: 'A LIFE OF GIVING',
  'volunteer-reflections': 'VOICES OF GROWTH',
  gallery: 'HAODAO FAZHOU',
  contact: 'GET IN TOUCH',
};
let content = {},
  source = {},
  manifest = {};
const photo = (file, alt, cls = '', eager = false) =>
  `<img data-image="${file}" alt="${alt}" class="${cls}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'}>`;
const clean = s =>
  s
    .replace(/\*\*/g, '')
    .replace(/<empty-block\/>/g, '')
    .replace(/<span[^>]*>(.*?)<\/span>/g, '$1');
const paras = a => a.map(p => `<p>${clean(p)}</p>`).join('');
function hydrate() {
  document.querySelectorAll('[data-image]').forEach(img => {
    img.src =
      window.HAODAO_CONFIG.mediaBase +
      encodeURIComponent(manifest[img.dataset.image] || img.dataset.image);
  });
}
const social = [
  ['LINE', 'LINE.png', 'https://lin.ee/VJrd0i3'],
  ['Facebook', 'FB.png', 'https://www.facebook.com/profile.php?id=100063957733524'],
  ['Instagram', 'IG.png', 'https://www.instagram.com/haodao_culture'],
  ['Threads', 'threads.png', 'https://www.threads.com/@haodao_culture'],
];
const socials = () =>
  social
    .map(
      ([n, f, u]) =>
        `<a href="${u}" target="_blank" rel="noopener noreferrer" aria-label="${n}">${photo(f, n)}</a>`,
    )
    .join('');
const icon = i =>
  `<svg viewBox="0 0 48 48" aria-hidden="true">${['<path d="M6 10c8-3 12-2 18 2 6-4 10-5 18-2v29c-8-3-12-2-18 2-6-4-10-5-18-2zM24 12v29"/>', '<circle cx="24" cy="24" r="18"/><path d="M13 27c7 5 15 5 22 0M24 12v12M19 19l5 5 5-5"/>', '<path d="M6 27l10 10h16l10-10M12 24l12 9 12-9M24 27s-13-7-13-14c0-7 10-8 13-2 3-6 13-5 13 2 0 7-13 14-13 14z"/>'][i]}</svg>`;
function cards() {
  return `<div class="cards">${[
    ['community', '各地共學', '學習地圖各地共學.jpeg'],
    ['courses', '課程與活動', '課程與活動.JPG'],
    ['retreat', '各項修煉營', '學習地圖修煉營.jpg'],
    ['volunteer', '志工服務', '昊道文化志工/DSC02342.JPG'],
  ]
    .map(
      ([k, t, f], i) =>
        `<a class="card" href="#${k}">${photo(f, t)}<div class="num"><small>0${i + 1} / ${english[k]}</small></div><h3>${t}</h3>${paras(content.learning?.[i]?.paragraphs || [])}<span class="card-more">瞭解更多 <span aria-hidden="true">↗</span></span></a>`,
    )
    .join('')}</div>`;
}
function heroBrandmark() {
  const gradient = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#142c4e" offset="0"/><stop stop-color="#203e62" offset=".28"/><stop stop-color="#b88232" offset=".48"/><stop stop-color="#cb9b51" offset=".58"/><stop stop-color="#213e5b" offset=".76"/><stop stop-color="#12294b" offset="1"/></linearGradient></defs><path fill="url(#g)" d="M0 0h100v100H0z"/></svg>`;
  const paint = 'data:image/svg+xml,' + encodeURIComponent(gradient).replace(/'/g, '%27');
  return `<svg class="hero-paint-defs" width="0" height="0" aria-hidden="true" focusable="false"><defs><filter id="hero-brand-paint" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB"><feImage href="${paint}" x="0" y="0" width="100%" height="100%" preserveAspectRatio="none" result="paint"/><feComposite in="paint" in2="SourceAlpha" operator="in"/></filter></defs></svg>${photo('昊道-黑.png', '', 'watermark hero-brandmark', true)}`;
}
function home() {
  return `<section class="hero hero-sunrise">${photo('ChatGPT 圖像 2026年10月6日 下午05_36_34.png', '晨光映照山海，以紙張紋理與暖陽拼貼的風景', '', true)}${heroBrandmark()}<div class="hero-copy"><div class="eyebrow">HAODAO CULTURE · LIFE IN BLOOM</div><h1>讓生命，在學習、修煉<br>與實踐中持續成長。</h1><p>明理・修煉・愿行</p></div><div class="hero-bottom"><span>回到內在本有的清明</span><a href="#story" id="scroll-story">SCROLL TO EXPLORE　↓</a></div></section><section class="intro"><h2>從成長自己，走向陪伴生命。</h2><p>從明白走向修煉，從修煉走向轉化，從成長自己走向陪伴生命。<br>回到內在本有的清明，提升內心文明與生命維度，活出生命本質的智慧、愛與力量。</p></section><section class="section split" id="story"><div>${photo('昊道文化主頁1.jpeg', '木質空間中的昊道品牌書法', 'photo')}<div class="photo-caption">HAODAO CULTURE ／ 生命相遇的地方</div></div><div><div class="eyebrow">OUR STORY</div><h2>用生命陪伴生命，<br>用修煉陪伴成長。</h2><p>${clean(content.about[0].paragraphs[0])}</p><p>${clean(content.about[0].paragraphs[2])}</p><a class="textlink" href="#about">閱讀昊道的故事</a></div></section><section class="stats" aria-label="昊道的成長支持"><div><strong>3</strong><span>三維根基</span><small>理法・修煉・愿景使命</small></div><div><strong>4</strong><span>學習途徑</span><small>共學・課程・修煉・服務</small></div><div><strong>5</strong><span>各地共學點</span><small>讓陪伴，走進日常</small></div></section><section class="section"><div class="section-head"><div><div class="eyebrow">THE WAY WE GROW</div><h2>把成長，帶回每一天。</h2></div><p>在學習中明理，在生活中修煉，在修煉中轉化。</p></div><div class="features">${[
    [
      '聖賢智慧與心智教育',
      '古今中外許多聖賢，都留下了深刻的領悟與智慧，學習與理解這些智慧，拓展我們的心智格局與人生視野，看見不同的生命可能。',
    ],
    ['共學、共修與生命陪伴', '所以，生命成長需要陪伴，也需要一個能持續支持自己學習與成長的環境。'],
    [
      '修煉實踐與志工服務',
      '透過志工服務，在付出、服務與陪伴中，學習放下自我、拓展心量格局，也讓自己的生命在服務中恢復本有的愛與光。',
    ],
  ]
    .map(([t, p], i) => `<article class="feature">${icon(i)}<h3>${t}</h3><p>${p}</p></article>`)
    .join(
      '',
    )}</div></section><section class="learning"><div class="section"><div class="section-head"><div><div class="eyebrow">YOUR LEARNING JOURNEY</div><h2>找到適合自己的成長起點。</h2></div><a class="textlink" href="#learning">探索學習地圖</a></div>${cards()}</div></section><section class="letter">${photo('昊道-黑.png', '', 'letter-mark')}${photo('板塊四共學.jpg', '共學夥伴彼此陪伴')}<div class="eyebrow">A LETTER TO YOU</div><h2>每個生命，<br>都有本自具足的光與力量。</h2><p>用生命陪伴生命，用修煉陪伴成長；在愿行中發光，成為別人的好環境，也陪伴更多人看見自己本自具足的光與力量。</p><p>讓愛持續傳出去，提升內心文明與生命維度，回到內在本有的清明，活出生命本質實相。</p><div class="signature">昊道文化</div></section><section class="contact"><div><div class="eyebrow">LET'S BEGIN</div><h2>生命成長的路，我們一起走。</h2><p>歡迎與我們聊聊，找到適合你的學習與陪伴。</p></div><a class="pill" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">與昊道聊聊</a></section>`;
}
function block(b, i, title = '') {
  return `<section class="article-block">${title ? `<h2>${title}</h2>` : ''}${b.image ? photo(b.image, title || '昊道文化學習與生活') : ''}${paras(b.paragraphs)}</section>`;
}
function page(k) {
  let body = '';
  if (k === 'about')
    body = content.about
      .map((b, i) =>
        block(
          b,
          i,
          [
            '生命學習、修煉與愿景實踐',
            '生命的成長，從生活開始',
            '重新理解自己與生命',
            '一起走，讓成長持續發生',
            '讓明白，成為生命的力量',
            '讓生命在愿行中發光',
          ][i],
        ),
      )
      .join('');
  if (k === 'learning')
    body = `<p>在學習中明理，在生活中修煉，在修煉中轉化，在愿行中發光。</p>${cards()}`;
  if (k === 'retreat' || k === 'volunteer') body = content[k].map(b => block(b, 0)).join('');
  if (k === 'retreat')
    body += `<a class="pill" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">詢問修煉營</a>`;
  if (k === 'volunteer')
    body += `${photo('昊道志工1.jpg', '昊道志工在服務中同行')}<h2>無相修行、無求愿行</h2><p>單純無求 樂愿同行</p><p>協同修辦 集體證量</p>`;
  if (k === 'gallery')
    body = `${photo('書法.jpg', '昊道書法')}<p>昊道文化數位策展～書法展廳、書法法舟、心靈慧談法舟、理法法舟、音樂法舟與書院法舟閱覽，共同展開觀看、閱讀、修習、聆聽與空間行旅。</p><a class="pill" href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/" target="_blank" rel="noopener noreferrer">走進昊道法舟數位館</a>`;
  if (k === 'contact')
    body = `<h2>讓我們，從一次相遇開始。</h2><p>課程諮詢、共學陪伴、志工服務，歡迎透過官方 LINE 或電子郵件與我們聯繫。</p><a class="pill" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">加入官方 LINE</a><p><a href="mailto:team@haodao.org">team@haodao.org</a><br>727 臺南市北門區錦湖里渡子頭8之9號</p>`;
  if (k === 'courses') body = courses();
  if (k === 'community') body = community();
  return `<div class="page-title"><div class="eyebrow">${english[k] || 'HAODAO CULTURE'}</div><h1>${titles[k]}</h1></div><div class="article">${body}</div>`;
}
function introFrom(k) {
  return paras(source[k]?.intro || []);
}
function courses() {
  return `${introFrom('courses')}<h2 id="regular">常態課程與活動</h2>${content.courses.map((b, i) => `<details><summary>${['一階課程｜生命再前進', '二階課程｜乘法風揚升', '進階課程｜深化理法', '靜心修煉課程', '覺察覺知課程'][i]}</summary>${block(b, i)}</details>`).join('')}<h2 id="upcoming">近期報名中課程與活動</h2><div class="region-tabs" data-filter="events"><button class="active">全部</button><button>線下</button><button>線上</button></div><div class="empty" id="events-empty">近期課程資訊整理中。<br><a class="textlink" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">向志工詢問開課資訊</a></div><h2 id="archive">近年課程與活動歷史回顧</h2><p>課程紀錄整理中。</p>`;
}
function community() {
  return `${paras(source.community.intro)}<h2>各地共學點</h2><div class="region-tabs" data-filter="regions">${['全部', '北區', '中區', '嘉南區', '高屏區'].map((t, i) => `<button class="${i ? '' : 'active'}">${t}</button>`).join('')}</div><div class="region-grid">${[
    ['北區', '厚德共修點', '厚德共修點.jpg'],
    ['中區', '妙智共修點', '妙智共修點.jpg'],
    ['嘉南區', '觀自在共修點', '觀自在共修點.jpg'],
    ['嘉南區', '心燈長明共修點', '心燈長明.jpg'],
    ['高屏區', '覺明共修點', '覺明共修點.jpg'],
  ]
    .map(
      ([r, t, f]) =>
        `<article data-region="${r}">${photo(f, t)}<p class="eyebrow">${r}</p><h2>${t}</h2><a class="textlink" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">聯絡共學主辦人</a></article>`,
    )
    .join(
      '',
    )}</div><h2 id="upcoming">近期共修活動</h2><p>活動資訊整理中，歡迎聯絡共學主辦人。</p><h2 id="archive">近年共學活動歷史回顧</h2><p>共學紀錄整理中。</p>`;
}
function search() {
  return '<div class="page-title"><div class="eyebrow">FIND YOUR PATH</div><h1>全站搜尋</h1></div><section class="searchpanel"><label for="query">想了解什麼？</label><input id="query" type="search" placeholder="搜尋課程、共學、修煉…"><div id="results" aria-live="polite"></div></section>';
}
function render() {
  let [key, anchor] = (location.hash.slice(1) || 'home').split('/');
  if (key === 'story' || key === 'main') {
    document.querySelector(key === 'story' ? '#story' : '#main')?.scrollIntoView();
    return;
  }
  document.getElementById('main').innerHTML =
    key === 'home'
      ? home()
      : key === 'search'
        ? search()
        : titles[key]
          ? page(key)
          : `<div class="article"><h1>${key === 'privacy' ? '隱私權政策' : '版權聲明'}</h1><p>${key === 'privacy' ? '共學表單收集姓名、手機號碼、LINE ID、所在地及參與場次，僅供昊道文化文教發展協會聯繫、安排共學及管理報名。資料先保存於協會管理後台，Google 試算表連接完成後，會同步至協會指定的 Google 試算表供志工安排聯繫。此本機預覽不會自動發送訊息通知志工；正式公開上線前將確認保存期限與處理流程。如需更正或移除資料，請聯絡 team@haodao.org。點擊外部社群連結時，適用各服務平台的隱私權政策。' : '本站品牌文字與圖片由昊道文化提供。相關內容如需轉載或使用，請先聯絡 team@haodao.org。'}</p></div>`;
  document.title = (titles[key] || '搜尋') + '｜昊道文化';
  document.getElementById('menu').hidden = true;
  document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
  hydrate();
  if (anchor)
    document
      .getElementById(anchor.startsWith('course-') ? 'regular' : anchor)
      ?.scrollIntoView({ behavior: 'instant' });
  else window.scrollTo({ top: 0, behavior: 'instant' });
  document.querySelectorAll('[data-filter] button').forEach(
    b =>
      (b.onclick = () => {
        b.parentElement
          .querySelectorAll('button')
          .forEach(x => x.classList.toggle('active', x === b));
        if (b.parentElement.dataset.filter === 'regions')
          document
            .querySelectorAll('[data-region]')
            .forEach(
              x => (x.hidden = b.textContent !== '全部' && x.dataset.region !== b.textContent),
            );
        else
          document.getElementById('events-empty').firstChild.textContent =
            `${b.textContent === '全部' ? '近期' : b.textContent}課程資訊整理中。`;
      }),
  );
  window.HaodaoEvents?.mount(key);
  const q = document.getElementById('query');
  if (q) {
    q.oninput = () => {
      const query = q.value.trim();
      const matches = Object.keys(titles).filter(
        k =>
          k !== 'home' &&
          (JSON.stringify(source[k] || '') + JSON.stringify(content[k] || '') + titles[k]).includes(
            query,
          ),
      );
      document.getElementById('results').innerHTML = query
        ? matches.length
          ? matches.map(k => `<a class="searchresult" href="#${k}">${titles[k]}</a>`).join('')
          : '<p>找不到相關內容，試試「共學」或「修煉」。</p>'
        : '';
    };
    q.focus();
  }
}
Promise.all(
  ['content.json', 'source-content.json', 'media-manifest.json'].map(f =>
    fetch(f).then(r => r.json()),
  ),
).then(([c, s, m]) => {
  content = c;
  source = s;
  manifest = m;
  document.getElementById('menu').innerHTML =
    Object.entries(titles)
      .map(([k, t]) => `<a href="#${k}">${t}</a>`)
      .join('') + '<a href="#search">全站搜尋</a>';
  document.getElementById('footer-social').innerHTML = socials();
  document.getElementById('floating').innerHTML =
    socials() +
    '<button class="back-top" id="back-top" aria-label="回到頁首"><span>↑</span><small>TOP</small></button>';
  document.getElementById('back-top').onclick = () =>
    window.scrollTo({
      top: 0,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    });
  render();
});
document.getElementById('menu-toggle').onclick = () => {
  const menu = document.getElementById('menu');
  menu.hidden = !menu.hidden;
  document.getElementById('menu-toggle').setAttribute('aria-expanded', String(!menu.hidden));
};
document.getElementById('search-toggle').onclick = () => (location.hash = 'search');
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.getElementById('menu').hidden = true;
    document.getElementById('menu-toggle').setAttribute('aria-expanded', 'false');
  }
});
window.addEventListener('hashchange', render);
