import fs from 'node:fs';
import { formatHtml } from './format-html.mjs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { webcrypto, createHash } from 'node:crypto';

const src = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(src, '..');
const read = f => fs.readFileSync(path.join(src, f), 'utf8');
// Source hooks must match exactly once, so a formatting change fails the build
// instead of silently skipping a replacement.
function matchOnce(text, pattern, label) {
  const matches = [...text.matchAll(new RegExp(pattern.source, pattern.flags + 'g'))];
  if (matches.length !== 1)
    throw new Error(`Expected one match for ${label}, found ${matches.length}`);
  return matches[0];
}
function replaceOnce(text, pattern, replace, label) {
  const m = matchOnce(text, pattern, label);
  const replacement = typeof replace === 'function' ? replace(...m) : replace;
  return text.slice(0, m.index) + replacement + text.slice(m.index + m[0].length);
}
// Fills an empty placeholder element such as <main id="main"></main>.
const fill = (html, tag, id, content) =>
  replaceOnce(
    html,
    new RegExp(`(<${tag}\\b[^>]*\\bid="${id}"[^>]*>)\\s*(</${tag}\\s*>)`),
    (_, open, close) => open + content + close,
    `#${id} placeholder`,
  );
const editorialVersion = createHash('sha256')
  .update(read('editorial.css'))
  .digest('hex')
  .slice(0, 12);
const bootstrapVersion = createHash('sha256')
  .update(read('bootstrap.js'))
  .digest('hex')
  .slice(0, 12);
const routes = JSON.parse(read('routes.json'));
const manifest = JSON.parse(read('media-manifest.json'));
const dimensions = JSON.parse(read('image-dimensions.json'));
const origin = 'https://www.haodao.org';
const mediaBase = 'https://media.haodao.org/images/website-20261005/';
const mediaUrl = file => mediaBase + encodeURIComponent(manifest[file] || file);
const out = path.join(root, 'assets/haodao');
fs.mkdirSync(out, { recursive: true });
const ctx = vm.createContext({
  window: { addEventListener() {} },
  document: {},
  location: { hash: '' },
  crypto: webcrypto,
  setInterval() {},
  console,
});
const app = read('app.js');
// Only the templates before render() are needed; render() touches the DOM.
vm.runInContext(app.slice(0, matchOnce(app, /function render\s*\(\)\s*\{/, 'render()').index), ctx);
vm.runInContext(read('events.js'), ctx);
ctx.HaodaoEvents = ctx.window.HaodaoEvents;
vm.runInContext(
  replaceOnce(
    read('editorial.js'),
    /if\s*\(content\.about\)\s*render\(\);/,
    '',
    'editorial render()',
  ),
  ctx,
);
ctx.data = {
  content: JSON.parse(read('content.json')),
  source: JSON.parse(read('source-content.json')),
  manifest,
};
vm.runInContext('content=data.content;source=data.source;manifest=data.manifest;', ctx);
const esc = s =>
  String(s).replace(
    /[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
  );
const plain = s =>
  s
    .replace(/<template\b[^>]*>[\s\S]*?<\/template>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
function hrefFor(hash) {
  const [key, anchor] = hash.split('/');
  if (['main', 'story'].includes(key)) return '#' + key;
  if (key === 'courses' && /^course-[0-4]$/.test(anchor || ''))
    return routes.find(r => r.course === Number(anchor.slice(-1))).path;
  const found = routes.find(r => r.key === key);
  if (!found) throw new Error('Unknown internal link: ' + hash);
  return found.path + (anchor ? '#' + anchor : '');
}
function finalize(html) {
  return html
    .replace(/href="#([^"]+)"/g, (_, hash) => 'href="' + hrefFor(hash) + '"')
    .replace(/<img\b([^>]*?)data-image="([^"]+)"([^>]*?)\s*\/?>/g, (_, before, file, after) => {
      const filename = manifest[file];
      if (!filename || !dimensions[filename]) throw Error('Missing media: ' + file);
      const d = dimensions[filename];
      const attrs = (before + after).replace(/\s(?:width|height)="[^"]*"/g, '');
      return `<img${attrs} src="${esc(mediaUrl(file))}" width="${d.width}" height="${d.height}" decoding="async">`;
    });
}
const template = read('index.html');
const bodyTag = matchOnce(template, /<body\s*>/, '<body>');
let body = '<body>' + template.slice(bodyTag.index + bodyTag[0].length);
body = fill(
  body,
  'nav',
  'menu',
  `${vm.runInContext('Object.entries(titles).map(([k,t])=>`<a href="#${k}">${t}</a>`).join(\'\')', ctx)}<a href="#search">全站搜尋</a>`,
);
const socials = vm.runInContext('socials()', ctx);
body = fill(body, 'div', 'footer-social', socials);
body = fill(
  body,
  'aside',
  'floating',
  `${socials}<button class="back-top" id="back-top" aria-label="回到頁首"><span>↑</span><small>TOP</small></button>`,
);
const privacy =
  '<div class="article"><h1>隱私權政策</h1><p>昊道文化文教發展協會透過共學報名表蒐集姓名、手機號碼、LINE ID、所在地及希望參與的場次，僅用於聯繫、安排共學及管理報名。未提供必要資料時，將無法透過此表單完成共學意願登記；也可選擇透過官方 LINE 聯絡。</p><p>資料保存在協會管理的後台，僅供獲授權的管理者處理。Google 試算表連接完成後，會同步至協會指定試算表，供獲授權的志工安排聯繫。協會不會將上述資料用於與共學安排無關的目的。</p><p>資料依聯繫及活動安排需要保存；目的消失或您提出刪除要求後，將依適用規定處理。您可以申請查詢、閱覽、取得複本、補充、更正、停止處理或利用，以及刪除個人資料，請來信 <a href="mailto:team@haodao.org">team@haodao.org</a>。</p><p>管理後台使用 Google 帳號登入。我們接收已驗證的電子郵件地址與 Google 帳號識別碼，僅用於確認管理者身分、管理編輯權限及維持登入狀態，不存取您的 Gmail 信件或 Google 雲端硬碟內容。登入使用必要的工作階段 Cookie；編輯者被移除後，其網站登入權限與帳號綁定資料一併移除。點擊外部社群及服務連結後，適用該服務的隱私權政策。</p></div>';
const copyright =
  '<div class="article"><h1>版權聲明</h1><p>本站品牌文字與圖片由昊道文化提供。相關內容如需轉載或使用，請先聯絡 <a href="mailto:team@haodao.org">team@haodao.org</a>。</p></div>';
const organization = {
  '@type': 'NGO',
  '@id': origin + '/#organization',
  name: '昊道文化文教發展協會',
  alternateName: ['昊道文化', '昊道'],
  url: origin + '/',
  logo: mediaUrl('LOGO v_01.png'),
  description: '以聖賢智慧與心智教育，用生命陪伴生命，支持生命成長與心靈提升。',
  email: 'team@haodao.org',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '錦湖里渡子頭8之9號',
    addressLocality: '北門區',
    addressRegion: '臺南市',
    postalCode: '727',
    addressCountry: 'TW',
  },
  sameAs: [
    'https://www.facebook.com/profile.php?id=100063957733524',
    'https://www.instagram.com/haodao_culture',
    'https://www.threads.com/@haodao_culture',
    'https://www.youtube.com/@昊道文化',
  ],
};
const searchIndex = [];
function head(route) {
  const url = origin + route.path;
  const ogImage = mediaUrl(
    route.image ||
      (route.course !== undefined
        ? ctx.data.content.courses[route.course].image
        : '昊道文化主頁2.jpg'),
  );
  const graph = [
    organization,
    {
      '@type': 'WebSite',
      '@id': origin + '/#website',
      name: '昊道文化文教發展協會',
      url: origin + '/',
      inLanguage: 'zh-Hant',
      publisher: { '@id': organization['@id'] },
    },
    {
      '@type': 'WebPage',
      '@id': url + '#webpage',
      url,
      name: route.title,
      description: route.description,
      inLanguage: 'zh-Hant',
      isPartOf: { '@id': origin + '/#website' },
    },
  ];
  if (route.key !== 'home')
    graph.push({
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: '首頁', item: origin + '/' },
        ...(route.course !== undefined
          ? [{ '@type': 'ListItem', position: 2, name: '課程與活動', item: origin + '/courses/' }]
          : []),
        {
          '@type': 'ListItem',
          position: route.course !== undefined ? 3 : 2,
          name: route.title.split('｜')[0],
          item: url,
        },
      ],
    });
  if (route.course !== undefined)
    graph.push({
      '@type': 'Course',
      name: route.title.split('｜')[0],
      description: route.description,
      url,
      provider: { '@id': organization['@id'] },
      inLanguage: 'zh-Hant',
    });
  const json = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }).replace(
    /</g,
    '\\u003c',
  );
  return `<!DOCTYPE html><html lang="zh-Hant"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(route.title)}</title><meta name="description" content="${esc(route.description)}"><meta name="robots" content="${route.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large'}"><link rel="canonical" href="${url}"><meta property="og:site_name" content="昊道文化文教發展協會"><meta property="og:type" content="website"><meta property="og:locale" content="zh_TW"><meta property="og:url" content="${url}"><meta property="og:title" content="${esc(route.title)}"><meta property="og:description" content="${esc(route.description)}"><meta property="og:image" content="${esc(ogImage)}"><meta property="og:image:alt" content="昊道文化的學習與生活"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(route.title)}"><meta name="twitter:description" content="${esc(route.description)}"><meta name="twitter:image" content="${esc(ogImage)}"><meta name="theme-color" content="#293f4b"><link rel="icon" href="/assets/haodao/favicon.svg" type="image/svg+xml"><link rel="preconnect" href="https://media.haodao.org"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link rel="stylesheet" href="/assets/haodao/style.css"><link rel="stylesheet" href="/assets/haodao/editorial.css?v=${editorialVersion}"><link rel="stylesheet" href="/assets/haodao/events.css"><script src="/assets/haodao/config.js"></script><script defer src="/assets/haodao/events.js"></script><script defer src="/assets/haodao/bootstrap.js?v=${bootstrapVersion}"></script><script type="application/ld+json">${json}</script></head>`;
}
for (const route of routes) {
  ctx.location.hash =
    '#' + route.key + (route.course !== undefined ? '/course-' + route.course : '');
  let main =
    route.key === 'home'
      ? vm.runInContext('home()', ctx)
      : route.key === 'privacy'
        ? privacy
        : route.key === 'copyright'
          ? copyright
          : route.key === 'search'
            ? vm.runInContext('search()', ctx)
            : vm.runInContext(`page(${JSON.stringify(route.key)})`, ctx);
  if (route.course !== undefined) {
    const name = vm.runInContext(`courseNames[${route.course}]`, ctx);
    main = replaceOnce(
      main,
      /<span>／<\/span>課程與活動<\/p>/,
      '<span>／</span><a href="#courses">課程與活動</a><span>／</span>' + name + '</p>',
      'course breadcrumb',
    );
  }
  main = main.replace(/value="[0-9a-f]{8}-[0-9a-f-]{27}"/g, 'value=""');
  main = main.replaceAll(
    '本機預覽：Google 試算表尚待授權，目前提交會先存入預覽後台。',
    '報名資料將保存於協會後台，供志工聯繫及安排共學。',
  );
  main = main.replaceAll(
    '<p class="note">正在讀取活動…</p>',
    '<p class="note">活動資訊載入中。也可<a class="textlink" href="/events/">查看活動與報名資訊</a>，或<a class="textlink" href="https://lin.ee/VJrd0i3" rel="noopener noreferrer" target="_blank">聯絡官方 LINE</a>。</p>',
  );
  const html =
    head(route) +
    finalize(fill(body.replace('<body>', `<body data-page="${route.key}">`), 'main', 'main', main));
  const target = path.join(root, route.path, 'index.html');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, await formatHtml(html));
  if (!route.noindex) searchIndex.push({ title: route.title, path: route.path, text: plain(main) });
}
for (const f of ['style.css', 'editorial.css', 'events.css', 'bootstrap.js'])
  fs.copyFileSync(path.join(src, f), path.join(out, f));
let events = read('events.js');
events = replaceOnce(
  events,
  /fetch\(\s*'api\/'\s*\+\s*path/,
  "fetch((window.HAODAO_CONFIG.apiBase || '/api/') + path",
  'events API base',
);
events = replaceOnce(events, /href="#privacy"/, 'href="/privacy/"', 'events privacy link');
events = replaceOnce(
  events,
  /credentials:\s*'same-origin'/,
  "credentials: 'include'",
  'events credentials',
);
events = events
  .replaceAll(
    '本機預覽：Google 試算表尚待授權，目前提交會先存入預覽後台。',
    '報名資料將保存於協會後台，供志工聯繫及安排共學。',
  )
  .replaceAll('本機預覽', '管理後台')
  .replaceAll('預覽後台', '協會後台')
  .replaceAll('本機後台', '協會後台')
  .replaceAll('本機專用金鑰', '本站專用金鑰');
events = replaceOnce(
  events,
  /const media\s*=\s*u\s*=>[^;]*__uploads\|__media[^;]*;/,
  `const media=u=>{try{const p=new URL(u,location.origin);return p.protocol==='https:'&&p.hostname==='media.haodao.org'?p.href:'';}catch{return '';}};`,
  'events media URL check',
);
fs.writeFileSync(path.join(out, 'events.js'), events);
fs.writeFileSync(
  path.join(out, 'config.js'),
  `window.HAODAO_CONFIG=${JSON.stringify({ mediaBase, apiBase: 'https://api.haodao.org/api/', production: true })};\n`,
);
fs.writeFileSync(path.join(out, 'search-index.json'), JSON.stringify(searchIndex, null, 2) + '\n');
fs.writeFileSync(
  path.join(out, 'favicon.svg'),
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="24" fill="#293f4b"/><text x="24" y="33" text-anchor="middle" font-size="30" fill="#f7f5ef" font-family="serif">昊</text></svg>',
);
const baseline = read('legacy-sitemap.xml');
const old = Array.from(baseline.matchAll(/<url>\s*<loc>([^<]+)<\/loc>[\s\S]*?<\/url>/g))
  .filter(m => m[1] !== origin + '/')
  .map(m => m[0]);
const entries = routes
  .filter(r => !r.noindex)
  .map(
    r => `<url><loc>${origin + r.path}</loc><lastmod>${r.lastmod || '2026-10-05'}</lastmod></url>`,
  );
fs.writeFileSync(
  path.join(root, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    [...entries, ...old].join('\n') +
    '\n</urlset>\n',
);
fs.writeFileSync(
  path.join(root, 'robots.txt'),
  'User-agent: *\nAllow: /\nDisallow: /preview/\nDisallow: /test/\nDisallow: /website-src/\nDisallow: /backend/\nDisallow: /api/\n\nSitemap: https://www.haodao.org/sitemap.xml\n',
);
const notFound = {
  key: '404',
  path: '/404.html',
  title: '找不到此頁面｜昊道文化',
  description: '此頁面不存在，請從昊道文化首頁繼續瀏覽。',
  noindex: true,
};
fs.writeFileSync(
  path.join(root, '404.html'),
  await formatHtml(
    head(notFound) +
      finalize(
        fill(
          body.replace('<body>', '<body data-page="404">'),
          'main',
          'main',
          '<div class="article"><h1>找不到此頁面</h1><p>您可以回到<a class="textlink" href="/">首頁</a>，或<a class="textlink" href="/search/">搜尋網站內容</a>。</p></div>',
        ),
      ),
  ),
);
console.log(
  `Built ${routes.length} complete HTML pages; ${old.length} legacy sitemap entries preserved.`,
);

// Standalone admin stays out of the public navigation, search index and sitemap.
fs.mkdirSync(path.join(root, 'admin'), { recursive: true });
for (const file of ['index.html', 'admin.js', 'admin.css'])
  fs.copyFileSync(path.join(src, 'admin', file), path.join(root, 'admin', file));
