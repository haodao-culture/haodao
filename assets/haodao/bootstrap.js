/* The same complete HTML is served to visitors and search crawlers. */
(() => {
  const assetBase = '/assets/haodao/';
  const pageKey = document.body.dataset.page || 'home';
  const courses = ['level-1','level-2','advanced','meditation','awareness'];
  const hrefFor = value => {
    const [key, anchor] = value.replace(/^#/, '').split('/');
    if (key === 'home') return '/';
    if (key === 'courses' && /^course-[0-4]$/.test(anchor || '')) return '/courses/' + courses[Number(anchor.slice(-1))] + '/';
    return '/' + key + '/' + (anchor ? '#' + anchor : '');
  };
  const legacy = location.hash.slice(1);
  if (/^(home|about|learning|courses|community|retreat|volunteer|gallery|contact|privacy|copyright|search)(\/.*)?$/.test(legacy)) {
    location.replace(hrefFor(legacy));
    return;
  }
  document.getElementById('menu-toggle').onclick = () => {
    const menu = document.getElementById('menu');
    menu.hidden = !menu.hidden;
    document.getElementById('menu-toggle').setAttribute('aria-expanded', String(!menu.hidden));
  };
  document.getElementById('search-toggle').onclick = () => { location.href = '/search/'; };
  document.getElementById('back-top').onclick = () => window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  document.addEventListener('keydown', e => {
    if(e.key === 'Escape') {
      document.getElementById('menu').hidden = true;
      document.getElementById('menu-toggle').setAttribute('aria-expanded','false');
    }
  });
  document.querySelectorAll('[data-filter="regions"] button').forEach(button => {
    button.onclick = () => {
      button.parentElement.querySelectorAll('button').forEach(x => x.classList.toggle('active', x === button));
      document.querySelectorAll('[data-region]').forEach(x => { x.hidden = button.textContent !== '全部' && x.dataset.region !== button.textContent; });
    };
  });
  // Build output must not reuse a registration request ID across visitors.
  document.querySelectorAll('[name="request_id"]').forEach(input => { input.value = crypto.randomUUID(); });
  window.HaodaoEvents?.mount(pageKey);
  const queryField = document.getElementById('query');
  if(queryField) {
    fetch(assetBase + 'search-index.json').then(r => {if(!r.ok)throw Error();return r.json();}).then(entries => {
      queryField.oninput = () => {
        const query = queryField.value.trim().toLocaleLowerCase();
        const results = document.getElementById('results');
        results.replaceChildren();
        if(!query) return;
        const found = entries.filter(entry => (entry.title+' '+entry.text).toLocaleLowerCase().includes(query));
        if(!found.length) {results.textContent = '找不到相關內容，試試「共學」或「修煉」。';return;}
        found.forEach(entry => {const a=document.createElement('a');a.className='searchresult';a.href=entry.path;a.textContent=entry.title;results.append(a);});
      };
    }).catch(() => {document.getElementById('results').textContent='暫時無法載入搜尋，請使用上方導覽或聯絡我們。';});
  }
})();
