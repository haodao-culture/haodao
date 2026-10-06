/* Server-backed events, registrations and administration. No passwords in client source. */
window.HaodaoEvents = (() => {
  let all = [],
    today = '',
    admin = false,
    csrf = '',
    requestVersion = 0,
    filters = {},
    currentKind = '',
    loadError = '',
    lastFocus = null,
    sheetConnected = false;
  const cities = [
    '臺北市',
    '新北市',
    '桃園市',
    '臺中市',
    '臺南市',
    '高雄市',
    '基隆市',
    '新竹市',
    '嘉義市',
    '新竹縣',
    '苗栗縣',
    '彰化縣',
    '南投縣',
    '雲林縣',
    '嘉義縣',
    '屏東縣',
    '宜蘭縣',
    '花蓮縣',
    '臺東縣',
    '澎湖縣',
    '金門縣',
    '連江縣',
  ];
  const esc = s =>
    String(s ?? '').replace(
      /[&<>"']/g,
      c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c],
    );
  const media = u => (/^\/(__uploads|__media)\//.test(u) ? u : '');
  async function api(path, data) {
    const r = await fetch('api/' + path, {
      method: data ? 'POST' : 'GET',
      headers: data ? { 'Content-Type': 'application/json', 'X-CSRF-Token': csrf } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: 'same-origin',
    });
    let result;
    try {
      result = await r.json();
    } catch {
      throw new Error('暫時無法連線，請保留內容並稍後重試。');
    }
    if (!r.ok) {
      if (r.status === 401) {
        admin = false;
        csrf = '';
      }
      throw new Error(result.error || '操作未完成。');
    }
    return result;
  }
  function shell() {
    let d = document.getElementById('site-dialog');
    if (!d) {
      d = document.createElement('dialog');
      d.id = 'site-dialog';
      d.innerHTML =
        '<button type="button" class="dialog-close" aria-label="關閉視窗">×</button><div id="dialog-body"></div>';
      document.body.append(d);
      d.querySelector('.dialog-close').onclick = () => d.close();
      d.addEventListener('click', e => {
        if (e.target === d) {
          const r = d.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            d.close();
        }
      });
      d.addEventListener('close', () => {
        lastFocus?.focus?.();
      });
    }
    return d;
  }
  function open(html) {
    const d = shell();
    if (!d.open) lastFocus = document.activeElement;
    d.querySelector('#dialog-body').innerHTML = html;
    if (!d.open) d.showModal();
    d.setAttribute('aria-labelledby', 'dialog-title');
    d.scrollTop = 0;
    return d;
  }
  const feedback = (form, message, bad = true) => {
    const el = form.querySelector('[data-feedback]');
    el.textContent = message;
    el.classList.toggle('success', !bad);
  };
  const opts = (values, current = '') =>
    values.map(x => `<option ${x === current ? 'selected' : ''}>${esc(x)}</option>`).join('');
  function section(kind, archived = false) {
    return `<section class="event-section" id="${archived ? 'archive' : 'upcoming'}" data-event-section="${kind}-${archived}"><div class="section-head"><div><p class="eyebrow">${archived ? 'MOMENTS WE SHARE' : 'GROW WITH US'}</p><h2>${archived ? (kind === 'courses' ? '近年課程與活動歷史回顧' : '近年共學活動歷史回顧') : kind === 'courses' ? '近期報名中課程與活動' : '近期共修活動'}</h2></div><button class="admin-entry" data-admin-kind="${kind}" data-archive="${archived}">管理者編輯</button></div><div class="event-filters" aria-label="活動篩選">${(kind === 'courses' ? ['全部', '線下', '線上'] : ['全部', '北區', '中區', '嘉南區', '高屏區']).map((t, i) => `<button class="${i ? '' : 'active'}" aria-pressed="${!i}" data-event-filter="${esc(t)}">${t}</button>`).join('')}</div><div class="event-grid" data-event-list><p class="note">正在讀取活動…</p></div></section>`;
  }
  function paint() {
    document.querySelectorAll('[data-event-section]').forEach(sec => {
      const [kind, archive] = sec.dataset.eventSection.split('-'),
        archived = archive === 'true',
        f = filters[sec.dataset.eventSection] || '全部';
      const events = all
        .filter(
          e =>
            e.kind === kind &&
            e.archived === archived &&
            (f === '全部' || (kind === 'courses' ? e.mode : e.region) === f),
        )
        .sort((a, b) =>
          archived
            ? b.end_date.localeCompare(a.end_date)
            : a.start_date.localeCompare(b.start_date),
        );
      sec.querySelector('[data-event-list]').innerHTML = loadError
        ? `<div class="empty"><p>${esc(loadError)}</p><button class="pill" data-retry>重新讀取</button></div>`
        : events.length
          ? events
              .map(
                e =>
                  `<button class="event-card" data-event="${e.id}">${e.poster ? `<img src="${esc(media(e.poster))}" alt="${esc(e.title)}" loading="lazy">` : `<div class="event-cover"><span>${e.start_date.slice(5).replace('-', ' / ')}</span><small>${kind === 'courses' ? '學習 · 修煉' : '共學 · 陪伴'}</small></div>`}<div class="event-card-body"><div class="event-meta"><span>${esc(e.mode)}${e.region ? ' · ' + esc(e.region) : ''}</span><time>${e.start_date}${e.end_date !== e.start_date ? ' — ' + e.end_date : ''}</time></div><h3>${esc(e.title)}</h3><p>${esc(e.description.slice(0, 90))}${e.description.length > 90 ? '…' : ''}</p><span class="textlink">${archived ? '閱讀活動紀錄' : '了解活動'}</span></div></button>`,
              )
              .join('')
          : `<div class="empty"><p>${archived ? '這段旅程的紀錄，將在這裡慢慢收藏。' : '目前尚未公布' + (f === '全部' ? '' : esc(f)) + '活動，歡迎透過官方 LINE 與我們聊聊。'}</p>${archived ? '' : '<a class="textlink" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">加入 LINE 官方帳號</a>'}</div>`;
      sec
        .querySelectorAll('[data-event]')
        .forEach(b => (b.onclick = () => detail(b.dataset.event)));
      sec.querySelector('[data-retry]')?.addEventListener('click', () => mount(currentKind));
    });
  }
  function registration(eventId = '') {
    return `<form class="registration-form" data-register><input type="hidden" name="request_id" value="${crypto.randomUUID()}"><div class="form-row"><label>姓名<input name="name" required maxlength="80" autocomplete="name" placeholder="請填寫姓名"></label><label>手機號碼<input name="phone" type="tel" required pattern="09[0-9]{8}" inputmode="numeric" maxlength="10" autocomplete="tel" placeholder="09xxxxxxxx"></label></div><div class="form-row"><label>LINE ID<input name="line_id" required maxlength="100" placeholder="方便志工與您聯繫"></label><label>所在地<select name="city" required><option value="">請選擇縣市</option>${opts(cities)}</select></label></div><label>想參與的共學<select name="event_id"><option value="">請志工協助安排適合的共學</option>${all
      .filter(e => e.kind === 'community' && !e.archived)
      .map(
        e =>
          `<option value="${e.id}" ${e.id === eventId ? 'selected' : ''}>${esc(e.title)} · ${e.start_date}</option>`,
      )
      .join(
        '',
      )}</select></label><label class="consent"><input type="checkbox" name="consent" required><span>我同意昊道文化使用上述資料聯繫及安排共學。<a href="#privacy" data-close-dialog>資料使用說明</a></span></label><p class="form-feedback" data-feedback role="status"></p><button class="pill filled" type="submit">我想報名參與共學</button><p class="preview-note">${sheetConnected ? '報名資料將保存於協會後台及 Google 試算表，供志工聯繫。' : '本機預覽：Google 試算表尚待授權，目前提交會先存入預覽後台。'}</p></form>`;
  }
  function registrationSection() {
    return `<section class="join-section" id="join"><div class="join-invitation"><span class="ink-backdrop" aria-hidden="true"><img data-image="昊道-黑.png" alt="" loading="lazy"></span><p class="eyebrow">A PLACE TO BELONG</p><h2>我想報名<br>參與共學。</h2><p>留下你的聯絡方式，<br>讓我們陪你找到適合的共學起點。</p><p>正式報名後，會有志工與您聯繫。<br>也歡迎加入 LINE 官方帳號，與我們聊聊。</p><a class="pill" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">加入 LINE 官方帳號</a></div><div data-registration-slot>${registration()}</div></section>`;
  }
  function bindRegistration(root = document) {
    root.querySelectorAll('[data-register]').forEach(form => {
      form.onsubmit = async e => {
        e.preventDefault();
        if (!form.reportValidity()) return;
        const button = form.querySelector('[type=submit]');
        button.disabled = true;
        feedback(form, '正在送出…', false);
        const data = Object.fromEntries(new FormData(form));
        data.consent = form.querySelector('[name=consent]').checked;
        try {
          const result = await api('registrations', data);
          form.innerHTML = `<div class="registration-success" role="status"><span class="eyebrow">THANK YOU</span><h3>已收到你的共學意願。</h3><p>${result.sheetSynced ? '資料已送達報名試算表，後續將由志工與您聯繫。' : result.sheetConfigured ? '資料已安全保存在後台，試算表同步暫時等待中；系統會自動重試，無需重複報名。' : '資料已保存在本機預覽後台。Google 試算表尚待授權連接，目前尚未送達試算表或通知志工。'}</p><a class="pill" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">加入 LINE 官方帳號</a></div>`;
        } catch (err) {
          feedback(form, err.message);
          button.disabled = false;
        }
      };
    });
    root.querySelectorAll('[data-close-dialog]').forEach(a => (a.onclick = () => shell().close()));
  }
  function eventSchedule(e) {
    if (!e.start_time && !e.end_time)
      return `${e.start_date}${e.end_date !== e.start_date ? ' — ' + e.end_date : ''} ${e.time_text || ''}`;
    return `${e.start_date} ${e.start_time || ''} — ${e.end_date !== e.start_date ? e.end_date + ' ' : ''}${e.end_time || '結束時間未定'}`;
  }
  function detail(id) {
    const e = all.find(e => e.id === id);
    if (!e) return;
    const d = open(
      `<p class="eyebrow">${e.archived ? 'MEMORIES' : 'UPCOMING EVENT'} · ${esc(e.mode)}</p><h2 id="dialog-title">${esc(e.title)}</h2><p class="event-meta">${esc(eventSchedule(e))}<br>${esc(e.region)}　${esc(e.location)}</p>${e.poster ? `<img class="event-detail-image" src="${esc(media(e.poster))}" alt="${esc(e.title)}">` : ''}<div class="event-description">${e.description
        .split('\n')
        .map(x => `<p>${esc(x)}</p>`)
        .join(
          '',
        )}</div>${e.photos.length ? `<h3>活動紀錄</h3><div class="record-grid">${e.photos.map((p, i) => `<a href="${esc(media(p))}" target="_blank" rel="noopener noreferrer"><img src="${esc(media(p))}" alt="${esc(e.title)} 活動紀錄 ${i + 1}" loading="lazy"></a>`).join('')}</div>` : ''}${!e.archived ? (e.kind === 'community' ? '<button class="pill filled" data-join-event>我想報名參與共學</button>' : e.registration_url ? `<a class="pill filled" href="${esc(e.registration_url)}" target="_blank" rel="noopener noreferrer">前往報名</a>` : '<a class="pill" href="https://lin.ee/VJrd0i3" target="_blank" rel="noopener noreferrer">加入 LINE 官方帳號</a>') : '<p class="note">本活動已結束，謝謝每一份相遇與同行。</p>'}`,
    );
    d.querySelector('[data-join-event]')?.addEventListener('click', () => {
      open(`<h2 id="dialog-title">我想報名參與共學</h2>${registration(e.id)}`);
      bindRegistration(d);
    });
  }
  async function manage(kind, archived = false) {
    try {
      const s = await api('session');
      admin = s.authenticated;
      csrf = s.csrf || '';
      if (!admin) {
        const d = open(
          `<p class="eyebrow">FOR OUR TEAM</p><h2 id="dialog-title">管理者登入</h2><p>登入後可新增、編輯活動與整理紀錄。</p><form id="login-form"><label>管理者密碼<input name="password" type="password" required autocomplete="current-password"></label><p data-feedback role="alert" class="form-feedback"></p><button class="pill filled" type="submit">登入</button></form>`,
        );
        const f = d.querySelector('form');
        f.onsubmit = async ev => {
          ev.preventDefault();
          const button = f.querySelector('button');
          button.disabled = true;
          try {
            const r = await api('login', { password: f.password.value });
            csrf = r.csrf;
            admin = true;
            dashboard(kind, archived);
          } catch (err) {
            feedback(f, err.message);
            button.disabled = false;
          }
        };
        return;
      }
      dashboard(kind, archived);
    } catch (err) {
      open(`<h2 id="dialog-title">暫時無法開啟管理功能</h2><p>${esc(err.message)}</p>`);
    }
  }
  async function dashboard(kind, archived = false) {
    try {
      const data = await api('events');
      all = data.events;
      today = data.today;
      paint();
      const items = all.filter(e => e.kind === kind && e.archived === archived);
      const d = open(
        `<div class="admin-heading"><div><p class="eyebrow">HAODAO STUDIO</p><h2 id="dialog-title">${kind === 'courses' ? '課程與活動' : '共學活動'}管理</h2></div><button class="admin-entry" data-logout>登出</button></div><div class="admin-toolbar"><button class="pill ${!archived ? 'filled' : ''}" data-view="upcoming">近期活動</button><button class="pill ${archived ? 'filled' : ''}" data-view="archive">歷史回顧</button><button class="pill" data-registrations>共學報名</button></div><div class="admin-list">${items.length ? items.map(e => `<div class="admin-row"><div><small>${e.start_date} · ${esc(e.mode)}</small><h3>${esc(e.title)}</h3><span>${e.photos.length} 張活動紀錄照片</span></div><button class="pill" data-edit="${e.id}">編輯</button></div>`).join('') : '<p>此分類目前沒有活動。</p>'}</div><button class="pill filled" data-new>＋ 新增${archived ? '歷史活動紀錄' : '活動'}</button><p class="note">活動結束日期早於臺灣當日（${today}）時，會自動顯示於歷史回顧。</p>`,
      );
      d.querySelector('[data-new]').onclick = () => editor(kind, archived);
      d.querySelectorAll('[data-edit]').forEach(
        b =>
          (b.onclick = () =>
            editor(
              kind,
              archived,
              all.find(e => e.id === b.dataset.edit),
            )),
      );
      d.querySelectorAll('[data-view]').forEach(
        b => (b.onclick = () => dashboard(kind, b.dataset.view === 'archive')),
      );
      d.querySelector('[data-registrations]').onclick = () =>
        registrationsDashboard(kind, archived);
      d.querySelector('[data-logout]').onclick = async () => {
        await api('logout', {});
        admin = false;
        csrf = '';
        d.close();
      };
    } catch (err) {
      open(`<h2 id="dialog-title">讀取未完成</h2><p>${esc(err.message)}</p>`);
    }
  }
  async function registrationsDashboard(kind, archived) {
    try {
      const { registrations: rows } = await api('registrations');
      const d = open(
        `<p class="eyebrow">GROWING TOGETHER</p><h2 id="dialog-title">共學報名</h2><div class="admin-toolbar"><button class="pill" data-back>返回活動管理</button><button class="pill" data-sheets-setup>試算表連接</button><button class="pill" data-sheets-retry>重試待同步資料</button></div><div class="registration-list">${rows.length ? rows.map(r => `<article class="registration-entry"><div><h3>${esc(r.name)}</h3><span class="tag">${esc(r.status)}</span></div><span class="sync-state ${r.sheet_state === 'synced' ? '' : 'sync-warning'}">${r.sheet_state === 'synced' ? '已同步 Google 試算表' : '等待同步 Google 試算表'}</span><p>${esc(r.event_title || '請志工協助安排共學')}<br>${esc(r.city)} · ${esc(r.phone)}<br>LINE ID：${esc(r.line_id)}<br><small>${esc(r.created_at.slice(0, 16).replace('T', ' '))}</small></p><button class="pill" data-status-id="${r.id}" data-status="${r.status === '待聯繫' ? '已聯繫' : '待聯繫'}">標記為${r.status === '待聯繫' ? '已聯繫' : '待聯繫'}</button></article>`).join('') : '<p>目前尚無報名資料。</p>'}</div><p class="form-feedback" data-feedback role="status"></p>`,
      );
      d.querySelector('[data-back]').onclick = () => dashboard(kind, archived);
      d.querySelector('[data-sheets-setup]').onclick = () => sheetsSetup(kind, archived);
      d.querySelector('[data-sheets-retry]').onclick = async () => {
        try {
          await api('sheets-retry', {});
          feedback(d, '已安排重試，稍後重新開啟報名清單查看同步狀態。', false);
        } catch (err) {
          feedback(d, err.message);
        }
      };
      d.querySelectorAll('[data-status-id]').forEach(
        b =>
          (b.onclick = async () => {
            try {
              await api('registration-status', {
                id: b.dataset.statusId,
                status: b.dataset.status,
              });
              registrationsDashboard(kind, archived);
            } catch (err) {
              feedback(d, err.message);
            }
          }),
      );
    } catch (err) {
      open(`<h2 id="dialog-title">無法讀取報名</h2><p>${esc(err.message)}</p>`);
    }
  }
  async function sheetsSetup(kind, archived) {
    try {
      const config = await api('sheets-setup');
      const d = open(
        `<p class="eyebrow">GOOGLE SHEETS CONNECTION</p><h2 id="dialog-title">連接共學報名試算表</h2><p><a class="sheet-link" href="${esc(config.spreadsheet_url)}" target="_blank" rel="noopener noreferrer">開啟「官方網站後台」試算表 ↗</a></p><ol class="setup-steps"><li>在試算表選擇「擴充功能 → Apps Script」。</li><li>複製下方連接程式，取代 Apps Script 的預設程式並儲存。</li><li>選擇「部署 → 新增部署 → 網頁應用程式」，執行身分選自己，存取權選所有人；由你完成 Google 帳號授權。</li><li>將部署完成的 /exec 網址貼到下方，按「驗證並連接」。</li></ol><p class="note">連接程式只接受本站伺服器簽署的報名，不提供報名資料查詢。程式內含本機專用金鑰，請只貼入自己的 Apps Script，不要上傳 GitHub。</p><button type="button" class="pill" data-copy-script>複製連接程式</button><details><summary>檢視連接程式</summary><label>Google Apps Script 程式碼<textarea class="sheets-setup-code" readonly data-script spellcheck="false">${esc(config.code)}</textarea></label></details><form id="sheets-connect-form"><label>網頁應用程式網址<input name="url" type="url" required placeholder="https://script.google.com/macros/s/…/exec" value="${esc(config.url)}"></label><p class="form-feedback" data-feedback role="status">${config.connected ? '目前已連接指定試算表。' : '尚未連接，報名資料暫存在本機後台。'}</p><div class="form-actions"><button type="submit" class="pill filled">驗證並連接</button><button type="button" class="pill" data-setup-back>返回報名</button></div></form>`,
      );
      const f = d.querySelector('form');
      d.querySelector('[data-copy-script]').onclick = async () => {
        try {
          await navigator.clipboard.writeText(config.code);
          feedback(f, '程式已複製，請貼到自己的 Apps Script 專案。', false);
        } catch {
          d.querySelector('details').open = true;
          d.querySelector('[data-script]').select();
          feedback(f, '請複製已選取的程式碼。', false);
        }
      };
      d.querySelector('[data-setup-back]').onclick = () => registrationsDashboard(kind, archived);
      f.onsubmit = async ev => {
        ev.preventDefault();
        const b = f.querySelector('[type=submit]');
        b.disabled = true;
        feedback(f, '正在驗證試算表連接…', false);
        try {
          await api('sheets-connect', { url: f.elements.url.value.trim() });
          sheetConnected = true;
          feedback(f, '已連接成功。後續報名會自動同步，先前等待中的報名也會補送。', false);
        } catch (err) {
          feedback(f, err.message);
        } finally {
          b.disabled = false;
        }
      };
    } catch (err) {
      open(`<h2 id="dialog-title">無法開啟連接設定</h2><p>${esc(err.message)}</p>`);
    }
  }
  function dropZone(id, multiple) {
    return `<label class="upload-dropzone" data-dropzone="${id}"><span class="drop-icon" aria-hidden="true">↑</span><strong>將${multiple ? '活動紀錄照片' : '活動封面'}拖曳至此</strong><span>或點此選擇${multiple ? '照片（可多選）' : '一張照片'}</span><input aria-label="${multiple ? '上傳活動紀錄照片' : '上傳活動封面'}" type="file" ${multiple ? 'multiple' : ''} accept="image/jpeg,image/png,image/webp" id="${id}-upload"></label>`;
  }
  function editor(kind, archived, e = {}) {
    let poster = e.poster || '',
      photos = [...(e.photos || [])],
      pending = 0;
    const yesterday = new Date(Date.parse(today + 'T00:00:00+08:00') - 86400000).toLocaleDateString(
      'en-CA',
      { timeZone: 'Asia/Taipei' },
    );
    const defaultDate = archived ? yesterday : today;
    const d = open(
      `<p class="eyebrow">EDIT A MOMENT</p><h2 id="dialog-title">${e.id ? '編輯' : '新增'}${kind === 'courses' ? '課程與活動' : '共學活動'}</h2><form id="event-editor"><label>活動名稱<input name="title" required maxlength="120" value="${esc(e.title)}"></label><div class="form-row"><label>開始日期<input name="start_date" type="date" required value="${e.start_date || defaultDate}"></label><label>開始時間<input name="start_time" type="time" value="${esc(e.start_time)}"></label></div><div class="form-row"><label>結束日期<input name="end_date" type="date" required value="${e.end_date || defaultDate}"></label><label>結束時間<input name="end_time" type="time" value="${esc(e.end_time)}"></label></div>${e.time_text && !e.start_time && !e.end_time ? `<p class="note">原活動時間：${esc(e.time_text)}（填入新時間後取代）</p>` : ''}<div class="form-row"><label>活動形式<select name="mode">${opts(['線下', '線上'], e.mode)}</select></label><label>所在地區<select name="region" ${kind === 'community' ? 'required' : ''}><option value="">請選擇地區</option>${opts(['北區', '中區', '嘉南區', '高屏區'], e.region)}</select></label></div><label>地點／線上參與方式<input name="location" maxlength="300" value="${esc(e.location)}"></label><label>活動介紹／活動紀錄<textarea name="description" rows="7" required maxlength="15000">${esc(e.description)}</textarea></label>${kind === 'courses' ? `<label>報名連結（選填）<input name="registration_url" type="url" pattern="https://.*" placeholder="https://" value="${esc(e.registration_url)}"></label>` : ''}<fieldset><legend>活動封面</legend>${dropZone('poster', false)}<div id="poster-preview"></div></fieldset><fieldset><legend>活動紀錄照片（最多 20 張）</legend>${dropZone('record', true)}<p class="note">JPG、PNG 或 WebP，每張最多 8 MB。照片獨立保存，不會寫進 GitHub 程式碼。</p><div class="upload-previews" id="record-preview"></div></fieldset><p data-feedback class="form-feedback" role="status"></p><div class="form-actions"><button class="pill filled" type="submit">儲存活動</button><button class="pill" type="button" data-cancel>返回管理</button></div></form>`,
    );
    const f = d.querySelector('form'),
      save = f.querySelector('[type=submit]');
    function previews() {
      f.querySelector('#poster-preview').innerHTML = poster
        ? `<div class="upload-thumb"><img src="${esc(media(poster))}" alt="活動封面預覽"><button type="button" data-remove-poster>移除封面</button></div>`
        : '';
      f.querySelector('[data-remove-poster]')?.addEventListener('click', () => {
        poster = '';
        previews();
      });
      f.querySelector('#record-preview').innerHTML = photos
        .map(
          (p, i) =>
            `<div class="upload-thumb"><img src="${esc(media(p))}" alt="紀錄照片 ${i + 1}"><button type="button" data-remove-photo="${i}">移除</button></div>`,
        )
        .join('');
      f.querySelectorAll('[data-remove-photo]').forEach(
        b =>
          (b.onclick = () => {
            photos.splice(Number(b.dataset.removePhoto), 1);
            previews();
          }),
      );
    }
    previews();
    async function upload(file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type))
        throw new Error('請選擇 JPG、PNG 或 WebP 照片。');
      if (file.size > 8 * 1024 * 1024) throw new Error('單張照片上限為 8 MB。');
      const b64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      return (await api('uploads', { data: b64 })).url;
    }
    async function handleUpload(files, isPoster) {
      files = [...files];
      if (!files.length) return;
      if (pending) {
        feedback(f, '照片上傳中，請稍候再加入照片。');
        return;
      }
      if (isPoster && files.length > 1) {
        feedback(f, '活動封面只能選擇一張照片。');
        return;
      }
      if (!isPoster && photos.length + files.length > 20) {
        feedback(f, '紀錄照片最多 20 張。');
        return;
      }
      pending++;
      save.disabled = true;
      f.querySelectorAll('[type=file]').forEach(i => (i.disabled = true));
      f.querySelectorAll('[data-dropzone]').forEach(z => z.setAttribute('aria-busy', 'true'));
      feedback(f, '正在上傳照片…', false);
      try {
        for (const file of files) {
          const url = await upload(file);
          if (isPoster) poster = url;
          else photos.push(url);
          previews();
        }
        feedback(f, '照片已上傳，請按「儲存活動」套用。', false);
      } catch (err) {
        feedback(f, err.message);
      } finally {
        pending--;
        save.disabled = pending > 0;
        f.querySelectorAll('[type=file]').forEach(i => {
          i.disabled = false;
          i.value = '';
        });
        f.querySelectorAll('[data-dropzone]').forEach(z => z.setAttribute('aria-busy', 'false'));
      }
    }
    f.querySelectorAll('[data-dropzone]').forEach(zone => {
      const input = zone.querySelector('input'),
        isPoster = zone.dataset.dropzone === 'poster';
      let dragDepth = 0;
      input.onchange = () => handleUpload(input.files, isPoster);
      zone.addEventListener('dragenter', ev => {
        ev.preventDefault();
        dragDepth++;
        zone.classList.add('drag-over');
      });
      zone.addEventListener('dragover', ev => {
        ev.preventDefault();
        ev.dataTransfer.dropEffect = 'copy';
      });
      zone.addEventListener('dragleave', () => {
        if (--dragDepth <= 0) {
          dragDepth = 0;
          zone.classList.remove('drag-over');
        }
      });
      zone.addEventListener('drop', ev => {
        ev.preventDefault();
        dragDepth = 0;
        zone.classList.remove('drag-over');
        handleUpload(ev.dataTransfer.files, isPoster);
      });
    });
    f.addEventListener('dragover', ev => ev.preventDefault());
    f.addEventListener('drop', ev => ev.preventDefault());
    f.querySelector('[data-cancel]').onclick = () => dashboard(kind, archived);
    f.onsubmit = async ev => {
      ev.preventDefault();
      if (pending || !f.reportValidity()) return;
      const b = Object.fromEntries(new FormData(f));
      b.kind = kind;
      b.time_text = b.start_time || b.end_time ? '' : e.time_text || '';
      b.poster = poster;
      b.photos = photos;
      if (e.id) {
        b.id = e.id;
        b.revision = e.revision;
      }
      if (b.end_date < b.start_date) {
        feedback(f, '結束日期不可早於開始日期。');
        return;
      }
      if (b.start_time && b.end_time && b.start_date === b.end_date && b.end_time < b.start_time) {
        feedback(f, '結束時間不可早於開始時間。');
        return;
      }
      save.disabled = true;
      feedback(f, '正在儲存…', false);
      try {
        const result = await api('events', b);
        await dashboard(kind, result.event.archived);
      } catch (err) {
        feedback(f, err.message);
        save.disabled = false;
      }
    };
  }
  async function mount(kind) {
    currentKind = kind;
    const version = ++requestVersion;
    document
      .querySelectorAll('[data-admin-kind]')
      .forEach(b => (b.onclick = () => manage(b.dataset.adminKind, b.dataset.archive === 'true')));
    document.querySelectorAll('[data-event-filter]').forEach(b => {
      const selected =
        (filters[b.closest('[data-event-section]').dataset.eventSection] || '全部') ===
        b.dataset.eventFilter;
      b.classList.toggle('active', selected);
      b.setAttribute('aria-pressed', String(selected));
      b.onclick = () => {
        const sec = b.closest('[data-event-section]');
        filters[sec.dataset.eventSection] = b.dataset.eventFilter;
        sec.querySelectorAll('[data-event-filter]').forEach(x => {
          x.classList.toggle('active', x === b);
          x.setAttribute('aria-pressed', String(x === b));
        });
        paint();
      };
    });
    bindRegistration();
    if (!['courses', 'community'].includes(kind)) return;
    try {
      const result = await api('events');
      if (version !== requestVersion) return;
      all = result.events;
      today = result.today;
      sheetConnected = !!result.sheetsConnected;
      loadError = '';
      paint();
      const slot = document.querySelector('[data-registration-slot]');
      if (slot) {
        const note = slot.querySelector('.preview-note');
        if (note)
          note.textContent = sheetConnected
            ? '報名資料將保存於協會後台及 Google 試算表，供志工聯繫。'
            : '本機預覽：Google 試算表尚待授權，目前提交會先存入預覽後台。';
        const field = slot.querySelector('[name=event_id]');
        if (field) {
          field.innerHTML =
            '<option value="">請志工協助安排適合的共學</option>' +
            all
              .filter(e => e.kind === 'community' && !e.archived)
              .map(e => `<option value="${e.id}">${esc(e.title)} · ${e.start_date}</option>`)
              .join('');
        }
      }
    } catch (err) {
      if (version !== requestVersion) return;
      loadError = err.message;
      paint();
    }
  }
  setInterval(async () => {
    if (document.hidden || !['courses', 'community'].includes(currentKind) || shell().open) return;
    try {
      const result = await api('events');
      all = result.events;
      today = result.today;
      sheetConnected = !!result.sheetsConnected;
      paint();
    } catch {}
  }, 60000);
  window.addEventListener('hashchange', () => {
    if (shell().open) shell().close();
  });
  return { section, registrationSection, mount };
})();
