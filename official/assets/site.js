(function () {
  const page = document.body.dataset.page || "";

  const nav = [
    { id: "about", label: "關於昊道", href: "about.html" },
    { id: "learning", label: "學習地圖", href: "learning-map.html" },
    {
      id: "courses", label: "課程與活動", href: "courses.html", children: [
        ["「課程與活動」介紹", "courses.html#introduction"],
        ["常態課程與活動", "courses.html#regular"],
        ["近期報名中課程與活動", "courses.html#upcoming"],
        ["近年課程與活動歷史回顧", "courses.html#history"]
      ]
    },
    {
      id: "community", label: "各地共學與陪伴", href: "community.html", children: [
        ["「各地共學與陪伴」介紹", "community.html#introduction"],
        ["近期共修活動", "community.html#upcoming"],
        ["近年共學活動歷史回顧", "community.html#history"]
      ]
    },
    { id: "retreat", label: "修煉營", href: "retreat.html" },
    { id: "volunteers", label: "關於昊道志工", href: "volunteers.html" },
    { id: "fazhou", label: "昊道法舟數位館", href: "fazhou.html" }
  ];

  const social = [
    ["LINE 官方帳號", "https://lin.ee/VJrd0i3", "line.png"],
    ["Facebook", "https://www.facebook.com/profile.php?id=100063957733524", "facebook.png"],
    ["Instagram", "https://www.instagram.com/haodao_culture", "instagram.png"],
    ["Threads", "https://www.threads.com/@haodao_culture", "threads.png"]
  ];

  function navItem(item) {
    if (!item.children) {
      return `<li><a class="nav-link" ${page === item.id ? 'aria-current="page"' : ""} href="${item.href}">${item.label}</a></li>`;
    }
    return `<li class="nav-group">
      <button type="button" aria-expanded="false">${item.label}<span class="chevron">▼</span></button>
      <div class="mega-menu">${item.children.map(([label, href]) => `<a href="${href}">${label}</a>`).join("")}</div>
    </li>`;
  }

  function socialLinks(cls) {
    return social.map(([label, href, image]) => `<a class="${cls}" href="${href}" target="_blank" rel="noopener" aria-label="${label}"><img src="assets/images/${image}" alt=""></a>`).join("");
  }

  const header = document.querySelector("[data-site-header]");
  if (header) {
    header.innerHTML = `<a class="skip-link" href="#main">跳至主要內容</a>
      <header class="site-header">
        <div class="nav-shell">
          <a class="brand" href="index.html" aria-label="昊道文化首頁"><img src="assets/images/logo.png" alt="昊道文化 Haodao Culture"></a>
          <button class="nav-toggle" type="button" aria-label="開啟導覽" aria-expanded="false">☰</button>
          <nav class="main-nav" aria-label="主要導覽"><ul class="nav-list">${nav.map(navItem).join("")}</ul></nav>
          <button class="search-trigger" type="button" aria-label="開啟全站搜尋">⌕</button>
        </div>
      </header>`;
  }

  const footer = document.querySelector("[data-site-footer]");
  if (footer) {
    footer.innerHTML = `<div class="floating-social" aria-label="快速連結"><button class="social-icon scroll-top-button" type="button" data-scroll-top aria-label="到畫面最上方" title="到畫面最上方"><span aria-hidden="true">↑</span></button>${socialLinks("social-icon")}</div>
      <footer class="site-footer" id="contact">
        <div class="footer-main">
          <div class="footer-brand"><img src="assets/images/logo.png" alt="昊道文化"><p>讓生命，在學習、修煉與實踐中持續成長。</p></div>
          <div><h2 class="footer-title">主要頁面</h2><div class="footer-links">
            <a href="about.html">關於昊道</a><a href="learning-map.html">學習地圖</a>
            <a href="courses.html">課程與活動</a><a href="community.html">各地共學與陪伴</a>
            <a href="retreat.html">修煉營</a><a href="fazhou.html">昊道法舟數位館</a>
            <a href="volunteers.html">關於昊道志工</a><a href="#contact">聯絡我們</a>
          </div></div>
          <div><h2 class="footer-title">聯絡我們</h2><div class="footer-social">${socialLinks("social-icon")}</div></div>
        </div>
        <div class="footer-bottom"><span>© <span data-year></span> 昊道文化 Haodao Culture</span><div class="footer-legal"><a href="privacy.html">隱私權政策</a><a href="copyright.html">版權聲明</a></div></div>
      </footer>`;
  }

  document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

  const toggle = document.querySelector(".nav-toggle");
  const mainNav = document.querySelector(".main-nav");
  if (toggle && mainNav) {
    const setNavigationOpen = open => {
      mainNav.classList.toggle("is-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "關閉導覽" : "開啟導覽");
      toggle.textContent = open ? "×" : "☰";
      document.body.classList.toggle("menu-open", open);
    };
    toggle.addEventListener("click", () => setNavigationOpen(!mainNav.classList.contains("is-open")));
    mainNav.querySelectorAll("a").forEach(link => link.addEventListener("click", () => setNavigationOpen(false)));
    window.addEventListener("keydown", event => {
      if (event.key === "Escape" && mainNav.classList.contains("is-open")) {
        setNavigationOpen(false);
        toggle.focus();
      }
    });
    const desktopNavigation = window.matchMedia("(min-width: 901px)");
    desktopNavigation.addEventListener?.("change", event => {
      if (event.matches) setNavigationOpen(false);
    });
  }

  document.querySelector("[data-scroll-top]")?.addEventListener("click", () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  document.querySelectorAll(".nav-group > button").forEach(button => {
    button.addEventListener("click", () => {
      const group = button.closest(".nav-group");
      const open = group.classList.toggle("is-open");
      button.setAttribute("aria-expanded", String(open));
    });
  });

  const searchItems = [
    ["首頁", "讓生命，在學習、修煉與實踐中持續成長。", "index.html"],
    ["關於昊道", "聖賢智慧、心智教育、生命學習與愿行實踐", "about.html"],
    ["學習地圖", "各地共學、課程活動、修煉營與志工服務", "learning-map.html"],
    ["課程與活動", "一階、二階、進階、靜心與覺察覺知課程", "courses.html"],
    ["各地共學與陪伴", "北區、中區、嘉南區與高屏區共學據點", "community.html"],
    ["修煉營", "覺察修煉營、靜心修煉營、心智取代法修煉", "retreat.html"],
    ["關於昊道志工", "單純無求、無私奉獻、樂愿同行", "volunteers.html"],
    ["昊道法舟數位館", "書法、心靈慧談、理法、音樂與書院法舟", "fazhou.html"]
  ];

  const searchDialog = document.createElement("dialog");
  searchDialog.className = "search-dialog";
  searchDialog.innerHTML = `<div class="dialog-inner"><div class="dialog-head"><h2>全站搜尋</h2><button class="icon-button" type="button" data-close aria-label="關閉搜尋">×</button></div><label class="field"><span class="visually-hidden">輸入關鍵字</span><input class="search-input" type="search" placeholder="搜尋頁面、課程或主題…" autocomplete="off"></label><div class="search-results"></div></div>`;
  document.body.appendChild(searchDialog);
  const searchInput = searchDialog.querySelector(".search-input");
  const results = searchDialog.querySelector(".search-results");

  function renderSearch(query) {
    const q = query.trim().toLowerCase();
    const matches = q ? searchItems.filter(item => `${item[0]} ${item[1]}`.toLowerCase().includes(q)) : searchItems;
    results.innerHTML = matches.length ? matches.map(item => `<a class="search-result" href="${item[2]}"><strong>${item[0]}</strong><small>${item[1]}</small></a>`).join("") : '<div class="empty-state">找不到相符內容，請換個關鍵字試試。</div>';
  }
  renderSearch("");
  searchInput.addEventListener("input", e => renderSearch(e.target.value));
  document.querySelector(".search-trigger")?.addEventListener("click", () => { searchDialog.showModal(); setTimeout(() => searchInput.focus(), 50); });
  searchDialog.querySelector("[data-close]").addEventListener("click", () => searchDialog.close());

  function escapeHtml(value) {
    const characters = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
    return String(value ?? "").replace(/[&<>"']/g, character => characters[character]);
  }

  function safeUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(String(value), document.baseURI);
      const allowed = url.protocol === "https:" || url.protocol === "http:" || (url.protocol === "file:" && location.protocol === "file:");
      return allowed ? url.href : "";
    } catch (error) {
      return "";
    }
  }

  function safeImageUrl(value) {
    const candidate = String(value || "");
    if (/^data:image\/(?:jpe?g|png|webp|gif);base64,[a-z0-9+/=]+$/i.test(candidate)) return candidate;
    return safeUrl(candidate);
  }

  function requestId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }

  const eventApiEndpoint = document.querySelector("[data-registration-endpoint]")?.dataset.registrationEndpoint
    || "https://script.google.com/macros/s/AKfycbxhEVLKxQa5d0IWLC5kyk73n9qfEimuDh3Ar2kqMcUxRc5iygE9KB_I5neDJNebbAJ0rw/exec";

  async function requestEventApi(payload, timeoutMs = 12000) {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(eventApiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`伺服器回應錯誤（${response.status}）`);
      const result = await response.json();
      if (result?.ok === false || result?.success === false) {
        throw new Error(result.message || result.error || "操作失敗，請稍後再試。");
      }
      return result;
    } finally {
      window.clearTimeout(timeout);
    }
  }

  document.querySelectorAll("[data-registration-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const message = form.parentElement.querySelector(".success-message");
      const errorMessage = form.parentElement.querySelector(".form-error");
      const selection = form.querySelector("[data-registration-selection]");
      const button = form.querySelector('[type="submit"]');
      const buttonLabel = button?.textContent || "填寫報名、送出";
      const data = new FormData(form);

      message?.classList.remove("show");
      errorMessage?.classList.remove("show");
      if (button) {
        button.disabled = true;
        button.textContent = "送出中…";
      }

      try {
        const result = await requestEventApi({
          action: "register",
          name: data.get("name"),
          gender: data.get("gender"),
          phone: data.get("phone"),
          region: data.get("region"),
          eventId: data.get("eventId"),
          eventTitle: data.get("eventTitle"),
          eventRegion: data.get("eventRegion"),
          requestId: requestId()
        });
        form.reset();
        if (selection) selection.hidden = true;
        if (message) message.textContent = result?.message || "收到您的報名，將有志工與您聯繫。";
        message?.classList.add("show");
      } catch (error) {
        errorMessage?.classList.add("show");
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = buttonLabel;
        }
      }
    });
  });

  const eventBoards = [...document.querySelectorAll("[data-event-board]")];
  let eventData = { courses: [], community: [] };

  function formatEventDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value || "日期另行公告";
    return `${match[1]} 年 ${Number(match[2])} 月 ${Number(match[3])} 日`;
  }

  function formatEventDateRange(startValue, endValue) {
    const start = String(startValue || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    const end = String(endValue || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!start || !end || String(endValue) <= String(startValue)) return formatEventDate(startValue);
    const startText = `${start[1]}/${start[2]}/${start[3]}`;
    const endText = start[1] === end[1]
      ? `${end[2]}/${end[3]}`
      : `${end[1]}/${end[2]}/${end[3]}`;
    return `${startText}~${endText}`;
  }

  function formatEventTimeRange(startValue, endValue) {
    const start = String(startValue || "").trim();
    const end = String(endValue || "").trim();
    if (start && end) return `${start}~${end}`;
    if (start) return `${start} 起`;
    if (end) return `至 ${end}`;
    return "";
  }

  function eventCard(item, kind, history) {
    const title = item.title || item.name || "未命名活動";
    const label = kind === "courses" ? item.category : item.region;
    const image = safeImageUrl(item.image || (item.mediaType === "image" ? item.media : ""));
    const video = safeUrl(item.video || (item.mediaType === "video" ? item.media : ""));
    const link = safeUrl(item.link || item.registrationUrl);
    const media = image
      ? `<div class="event-media"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy"></div>`
      : video
        ? `<div class="event-media"><video src="${escapeHtml(video)}" controls preload="metadata" aria-label="${escapeHtml(title)}"></video></div>`
        : `<div class="event-media event-media-placeholder" aria-hidden="true"><span>昊道文化</span></div>`;
    const details = [
      formatEventDateRange(item.date, item.endDate),
      formatEventTimeRange(item.time, item.endTime),
      item.place || item.location || ""
    ].filter(Boolean).map(escapeHtml).join(" · ");

    return `<article class="event-card">
      ${media}
      <div class="event-copy">
        ${label ? `<span class="tag">${escapeHtml(label)}</span>` : ""}
        <h3>${escapeHtml(title)}</h3>
        <p class="event-meta">${details}</p>
        ${item.description ? `<p class="event-description">${escapeHtml(item.description)}</p>` : ""}
        ${kind === "community" && !history ? `<button class="button-primary event-link" type="button" data-register-event data-event-id="${escapeHtml(item.id || "")}" data-event-title="${escapeHtml(title)}" data-event-region="${escapeHtml(item.region || "")}">填寫報名</button>` : ""}
        ${kind === "courses" && link ? `<a class="button-primary event-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">查看詳情／報名</a>` : ""}
      </div>
    </article>`;
  }

  function extractEvents(result) {
    const candidate = result?.events || result?.data?.events || result?.data || result;
    if (!candidate || !Array.isArray(candidate.courses) || !Array.isArray(candidate.community)) return null;
    return { courses: candidate.courses, community: candidate.community };
  }

  async function loadEventData() {
    try {
      const remote = extractEvents(await requestEventApi({ action: "events", requestId: requestId() }));
      if (!remote) throw new Error("活動資料格式不正確。");
      eventData = remote;
      return;
    } catch (apiError) {
      console.warn("線上活動資料暫時無法載入，改用網站備份資料。", apiError);
    }

    try {
      const response = await fetch("data/events.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const fallback = extractEvents(await response.json());
      if (fallback) eventData = fallback;
    } catch (fallbackError) {
      console.warn("活動備份資料載入失敗。", fallbackError);
    }
  }

  function renderEventBoard(board) {
    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const kind = board.dataset.eventBoard;
    const history = board.dataset.history === "true";
    const list = board.querySelector("[data-event-list]");
    const filters = [...board.querySelectorAll("[data-filter]")];
    const items = Array.isArray(eventData[kind]) ? eventData[kind].filter(item => item && item.published !== false) : [];
    const activeFilter = filters.find(button => button.getAttribute("aria-selected") === "true")?.dataset.filter || "全部";
    const emptyMessage = history ? "活動結束後，相關記錄將整理至此。" : "近期活動正在整理中，歡迎透過聯絡方式洽詢。";
    const filtered = items
      .filter(item => {
        const endDate = String(item.endDate || item.date || "");
        const isPast = Boolean(endDate && endDate < todayKey);
        const label = kind === "courses" ? item.category : item.region;
        return isPast === history && (activeFilter === "全部" || label === activeFilter);
      })
      .sort((a, b) => {
        const left = String(a.date || "9999-12-31");
        const right = String(b.date || "9999-12-31");
        return history ? right.localeCompare(left) : left.localeCompare(right);
      });
    if (list) list.innerHTML = filtered.length ? filtered.map(item => eventCard(item, kind, history)).join("") : `<div class="empty-state">${emptyMessage}</div>`;
  }

  function renderAllEventBoards() {
    eventBoards.forEach(renderEventBoard);
  }

  function setupEventBoardInteractions() {
    eventBoards.forEach(board => {
      const filters = [...board.querySelectorAll("[data-filter]")];
      filters.forEach(button => button.addEventListener("click", () => {
        filters.forEach(filter => filter.setAttribute("aria-selected", String(filter === button)));
        renderEventBoard(board);
      }));

      board.querySelector("[data-event-list]")?.addEventListener("click", event => {
        const trigger = event.target.closest("[data-register-event]");
        if (!trigger) return;
        const form = document.querySelector("[data-registration-form]");
        if (!form) return;
        form.elements.eventId.value = trigger.dataset.eventId || "";
        form.elements.eventTitle.value = trigger.dataset.eventTitle || "";
        form.elements.eventRegion.value = trigger.dataset.eventRegion || "";
        const selection = form.querySelector("[data-registration-selection]");
        if (selection) {
          selection.textContent = `您正在報名：${trigger.dataset.eventTitle || "共修活動"}${trigger.dataset.eventRegion ? `（${trigger.dataset.eventRegion}）` : ""}`;
          selection.hidden = false;
        }
        form.scrollIntoView({ behavior: "smooth", block: "center" });
        window.setTimeout(() => form.elements.name?.focus({ preventScroll: true }), 500);
      });
    });
  }

  async function imageToDataUrl(file) {
    if (!file?.type.startsWith("image/")) throw new Error("請選擇 JPG、PNG 或 WebP 圖片。");
    const sourceUrl = URL.createObjectURL(file);
    const image = new Image();
    try {
      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error("圖片無法讀取，請改用另一張圖片。"));
        image.src = sourceUrl;
      });

      let maxDimension = 1800;
      let quality = .88;
      let blob = null;
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * scale));
        const height = Math.max(1, Math.round(image.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext("2d", { alpha: false });
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", quality));
        if (blob && blob.size <= 1.5 * 1024 * 1024) break;
        if (quality > .62) quality -= .08;
        else maxDimension = Math.round(maxDimension * .82);
      }
      if (!blob || blob.size > 1.5 * 1024 * 1024) throw new Error("圖片壓縮後仍超過 1.5MB，請改用較小的圖片。");
      return await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error("圖片處理失敗，請再試一次。"));
        reader.readAsDataURL(blob);
      });
    } finally {
      URL.revokeObjectURL(sourceUrl);
    }
  }

  function createAdminDialog() {
    if (!document.querySelector("[data-admin-open]")) return null;
    const dialog = document.createElement("dialog");
    dialog.className = "admin-dialog";
    dialog.setAttribute("aria-labelledby", "admin-dialog-title");
    dialog.innerHTML = `<div class="dialog-inner">
      <div class="dialog-head">
        <h2 id="admin-dialog-title">管理者編輯</h2>
        <button class="icon-button" type="button" data-admin-close aria-label="關閉管理者編輯">×</button>
      </div>
      <section class="admin-login-panel" data-admin-login>
        <p>請輸入管理者密碼後進入活動管理頁面。</p>
        <form class="admin-login-form" data-admin-login-form>
          <div class="field"><label for="admin-password">管理者密碼</label><input id="admin-password" name="password" type="password" autocomplete="current-password" required></div>
          <button class="button-primary" type="submit">登入</button>
        </form>
        <p class="admin-status" data-login-status role="status" aria-live="polite" hidden></p>
      </section>
      <section class="admin-manager" data-admin-manager hidden>
        <div class="admin-manager-bar">
          <div class="field admin-existing"><label for="admin-existing">選擇要編輯的活動</label><select id="admin-existing" data-admin-existing><option value="">新增活動</option></select></div>
          <button class="button-secondary" type="button" data-admin-new>新增</button>
          <button class="text-button" type="button" data-admin-logout>登出</button>
        </div>
        <form class="registration-form admin-event-form" data-admin-event-form>
          <input name="id" type="hidden">
          <div class="field full"><label for="admin-title" data-admin-name-label>活動名稱</label><input id="admin-title" name="title" required></div>
          <div class="field full"><span class="field-label" data-admin-image-label>活動海報</span><label class="admin-dropzone" for="admin-image" data-admin-dropzone><input class="visually-hidden" id="admin-image" name="imageFile" type="file" accept="image/jpeg,image/png,image/webp"><strong>點選上傳，或將海報拖曳到這裡</strong><span data-admin-upload-name>支援 JPG、PNG、WebP</span><small>上傳時會自動縮放、移除照片定位資訊，檔案上限 1.5MB。</small></label></div>
          <div class="admin-image-preview field full" data-admin-image-preview hidden><img alt="活動海報預覽"><button class="button-secondary" type="button" data-admin-remove-image>移除圖片</button></div>
          <div class="field full"><label for="admin-description">活動內容簡介</label><textarea id="admin-description" name="description" required></textarea></div>
          <div class="field"><label for="admin-duration">活動天數</label><select id="admin-duration" name="duration"><option value="single">一天</option><option value="multiple">超過一天</option></select></div>
          <div class="field"><label for="admin-date" data-admin-start-date-label>日期</label><input id="admin-date" name="date" type="date" required></div>
          <div class="field" data-admin-end-date hidden><label for="admin-end-date">結束日期</label><input id="admin-end-date" name="endDate" type="date"></div>
          <div class="field"><label for="admin-time">開始時間（選填）</label><input id="admin-time" name="time" type="time" aria-describedby="admin-start-time-hint"><small id="admin-start-time-hint">時間未定可留空。</small></div>
          <div class="field"><label for="admin-end-time">結束時間（選填）</label><input id="admin-end-time" name="endTime" type="time" aria-describedby="admin-end-time-hint"><small id="admin-end-time-hint">可留空；單日活動的結束時間需晚於開始時間。</small></div>
          <div class="field admin-course-field"><label for="admin-place">地點</label><input id="admin-place" name="place"></div>
          <div class="field admin-course-field"><label for="admin-category">標籤</label><select id="admin-category" name="category"><option>線下</option><option>線上</option></select></div>
          <div class="field full admin-course-field"><label for="admin-link">報名連結</label><input id="admin-link" name="link" type="url" inputmode="url" placeholder="https://"></div>
          <div class="field full admin-community-field"><label for="admin-region">所在地區</label><select id="admin-region" name="region"><option>北區</option><option>中區</option><option>嘉南區</option><option>高屏區</option></select></div>
          <div class="admin-actions field full"><button class="button-primary" type="submit" data-admin-save>儲存活動</button><button class="button-danger" type="button" data-admin-delete hidden>刪除活動</button></div>
        </form>
        <p class="admin-status" data-admin-status role="status" aria-live="polite" hidden></p>
      </section>
    </div>`;
    document.body.appendChild(dialog);
    return dialog;
  }

  function setupAdminEditor() {
    const dialog = createAdminDialog();
    if (!dialog) return;

    const tokenKey = "haodao-admin-token";
    const loginPanel = dialog.querySelector("[data-admin-login]");
    const manager = dialog.querySelector("[data-admin-manager]");
    const loginForm = dialog.querySelector("[data-admin-login-form]");
    const eventForm = dialog.querySelector("[data-admin-event-form]");
    const existingSelect = dialog.querySelector("[data-admin-existing]");
    const preview = dialog.querySelector("[data-admin-image-preview]");
    const previewImage = preview.querySelector("img");
    const dropzone = dialog.querySelector("[data-admin-dropzone]");
    const uploadName = dialog.querySelector("[data-admin-upload-name]");
    const endDateField = dialog.querySelector("[data-admin-end-date]");
    const startDateLabel = dialog.querySelector("[data-admin-start-date-label]");
    const deleteButton = dialog.querySelector("[data-admin-delete]");
    const saveButton = dialog.querySelector("[data-admin-save]");
    const loginStatus = dialog.querySelector("[data-login-status]");
    const adminStatus = dialog.querySelector("[data-admin-status]");
    let currentKind = "courses";
    let pendingImageData = null;
    let isPreparingImage = false;
    let isSavingEvent = false;
    let imagePreparationSerial = 0;

    function syncSaveButton() {
      saveButton.disabled = isPreparingImage || isSavingEvent;
    }

    function cancelImagePreparation() {
      imagePreparationSerial += 1;
      isPreparingImage = false;
      dropzone.removeAttribute("aria-busy");
      syncSaveButton();
    }

    function syncDurationFields() {
      const multipleDays = eventForm.elements.duration.value === "multiple";
      const startDate = String(eventForm.elements.date.value || "");
      const startMatch = startDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
      const minimumEndDate = startMatch
        ? new Date(Date.UTC(Number(startMatch[1]), Number(startMatch[2]) - 1, Number(startMatch[3]) + 1)).toISOString().slice(0, 10)
        : "";
      endDateField.hidden = !multipleDays;
      eventForm.elements.endDate.required = multipleDays;
      eventForm.elements.endDate.min = minimumEndDate;
      startDateLabel.textContent = multipleDays ? "開始日期" : "日期";
      if (!multipleDays) eventForm.elements.endDate.value = "";
      syncTimeValidity();
    }

    function syncTimeValidity() {
      const startTime = eventForm.elements.time.value;
      const endTime = eventForm.elements.endTime.value;
      const invalidRange = eventForm.elements.duration.value === "single" && startTime && endTime && endTime <= startTime;
      eventForm.elements.endTime.setCustomValidity(invalidRange ? "單日活動的結束時間必須晚於開始時間。" : "");
    }

    function setStatus(element, message, state = "") {
      element.textContent = message;
      element.dataset.state = state;
      element.hidden = !message;
    }

    function currentItems() {
      return Array.isArray(eventData[currentKind]) ? eventData[currentKind] : [];
    }

    function findEvent(id) {
      return currentItems().find(item => String(item.id) === String(id));
    }

    function setPreview(url) {
      const safe = safeImageUrl(url);
      preview.hidden = !safe;
      previewImage.src = safe || "";
    }

    function refreshExistingOptions(selectedId = "") {
      existingSelect.replaceChildren();
      const first = document.createElement("option");
      first.value = "";
      first.textContent = "新增活動";
      existingSelect.appendChild(first);
      currentItems()
        .slice()
        .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")))
        .forEach(item => {
          const option = document.createElement("option");
          option.value = String(item.id || "");
          option.textContent = `${item.date || "日期未定"}｜${item.title || item.name || "未命名活動"}`;
          existingSelect.appendChild(option);
        });
      existingSelect.value = String(selectedId || "");
    }

    function fillEditor(id = "") {
      const item = id ? findEvent(id) : null;
      cancelImagePreparation();
      eventForm.reset();
      pendingImageData = null;
      uploadName.textContent = "支援 JPG、PNG、WebP";
      eventForm.elements.id.value = item?.id || "";
      eventForm.elements.title.value = item?.title || item?.name || "";
      eventForm.elements.description.value = item?.description || "";
      eventForm.elements.date.value = String(item?.date || "").slice(0, 10);
      eventForm.elements.endDate.value = String(item?.endDate || "").slice(0, 10);
      eventForm.elements.duration.value = item?.endDate && item.endDate > item.date ? "multiple" : "single";
      eventForm.elements.time.value = item?.time || "";
      eventForm.elements.endTime.value = item?.endTime || "";
      eventForm.elements.place.value = item?.place || item?.location || "";
      eventForm.elements.category.value = item?.category || "線下";
      eventForm.elements.link.value = item?.link || item?.registrationUrl || "";
      eventForm.elements.region.value = item?.region || "北區";
      syncDurationFields();
      setPreview(item?.image || "");
      deleteButton.hidden = !item;
      setStatus(adminStatus, "");
    }

    function showLogin(message = "") {
      loginPanel.hidden = false;
      manager.hidden = true;
      loginForm.reset();
      setStatus(loginStatus, message, message ? "error" : "");
      window.setTimeout(() => loginForm.elements.password.focus(), 50);
    }

    function showManager(kind) {
      currentKind = kind;
      loginPanel.hidden = true;
      manager.hidden = false;
      dialog.querySelector("#admin-dialog-title").textContent = kind === "courses" ? "課程與活動管理" : "共修活動管理";
      dialog.querySelector("[data-admin-name-label]").textContent = kind === "courses" ? "課程／活動名稱" : "活動名稱";
      dialog.querySelector("[data-admin-image-label]").textContent = kind === "courses" ? "課程海報圖文" : "活動海報";
      dialog.querySelectorAll(".admin-course-field").forEach(field => { field.hidden = kind !== "courses"; });
      dialog.querySelectorAll(".admin-community-field").forEach(field => { field.hidden = kind !== "community"; });
      eventForm.elements.place.required = kind === "courses";
      eventForm.elements.category.required = kind === "courses";
      eventForm.elements.region.required = kind === "community";
      refreshExistingOptions();
      fillEditor();
      window.setTimeout(() => existingSelect.focus(), 50);
    }

    document.querySelectorAll("[data-admin-open]").forEach(button => {
      button.addEventListener("click", () => {
        currentKind = button.dataset.adminOpen === "community" ? "community" : "courses";
        if (!dialog.open) dialog.showModal();
        if (sessionStorage.getItem(tokenKey)) showManager(currentKind);
        else showLogin();
      });
    });

    dialog.querySelector("[data-admin-close]").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });

    loginForm.addEventListener("submit", async event => {
      event.preventDefault();
      const button = loginForm.querySelector('[type="submit"]');
      button.disabled = true;
      setStatus(loginStatus, "登入中…");
      try {
        const result = await requestEventApi({ action: "adminLogin", password: loginForm.elements.password.value, requestId: requestId() });
        const token = result?.token || result?.data?.token;
        if (!token) throw new Error("登入回應缺少管理權限，請稍後再試。");
        sessionStorage.setItem(tokenKey, token);
        showManager(currentKind);
      } catch (error) {
        setStatus(loginStatus, error.message || "密碼錯誤或暫時無法登入。", "error");
        loginForm.elements.password.select();
      } finally {
        button.disabled = false;
      }
    });

    dialog.querySelector("[data-admin-logout]").addEventListener("click", () => {
      sessionStorage.removeItem(tokenKey);
      showLogin("已安全登出。");
    });

    dialog.querySelector("[data-admin-new]").addEventListener("click", () => {
      existingSelect.value = "";
      fillEditor();
      eventForm.elements.title.focus();
    });

    existingSelect.addEventListener("change", () => fillEditor(existingSelect.value));
    eventForm.elements.duration.addEventListener("change", syncDurationFields);
    eventForm.elements.date.addEventListener("change", syncDurationFields);
    eventForm.elements.time.addEventListener("input", syncTimeValidity);
    eventForm.elements.endTime.addEventListener("input", syncTimeValidity);

    async function prepareImage(file) {
      if (!file) return;
      const preparationId = ++imagePreparationSerial;
      const previousUploadName = uploadName.textContent;
      isPreparingImage = true;
      dropzone.setAttribute("aria-busy", "true");
      syncSaveButton();
      setStatus(adminStatus, "圖片處理中…");
      try {
        const imageData = await imageToDataUrl(file);
        if (preparationId !== imagePreparationSerial) return;
        pendingImageData = imageData;
        setPreview(pendingImageData);
        uploadName.textContent = `已選擇：${file.name}`;
        setStatus(adminStatus, "圖片已完成縮放並移除定位資訊。", "success");
      } catch (error) {
        if (preparationId !== imagePreparationSerial) return;
        eventForm.elements.imageFile.value = "";
        uploadName.textContent = previousUploadName;
        setStatus(adminStatus, error.message || "圖片處理失敗。", "error");
      } finally {
        if (preparationId === imagePreparationSerial) {
          isPreparingImage = false;
          dropzone.removeAttribute("aria-busy");
          syncSaveButton();
        }
      }
    }

    eventForm.elements.imageFile.addEventListener("change", event => {
      prepareImage(event.target.files?.[0]);
    });

    ["dragenter", "dragover"].forEach(eventName => dropzone.addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();
      dropzone.classList.add("is-dragging");
    }));
    ["dragleave", "drop"].forEach(eventName => dropzone.addEventListener(eventName, event => {
      event.preventDefault();
      event.stopPropagation();
      dropzone.classList.remove("is-dragging");
    }));
    dropzone.addEventListener("drop", event => prepareImage(event.dataTransfer?.files?.[0]));

    dialog.querySelector("[data-admin-remove-image]").addEventListener("click", () => {
      cancelImagePreparation();
      pendingImageData = "";
      eventForm.elements.imageFile.value = "";
      uploadName.textContent = "圖片將在儲存後移除";
      setPreview("");
    });

    eventForm.addEventListener("submit", async event => {
      event.preventDefault();
      syncTimeValidity();
      if (!eventForm.reportValidity()) return;
      if (isPreparingImage) {
        setStatus(adminStatus, "圖片仍在處理中，請稍候完成後再儲存。", "error");
        return;
      }
      const token = sessionStorage.getItem(tokenKey);
      if (!token) return showLogin("登入已失效，請重新登入。");
      const id = eventForm.elements.id.value;
      const record = {
        id: id || "",
        type: currentKind,
        title: eventForm.elements.title.value.trim(),
        description: eventForm.elements.description.value.trim(),
        date: eventForm.elements.date.value,
        endDate: eventForm.elements.duration.value === "multiple" ? eventForm.elements.endDate.value : "",
        time: eventForm.elements.time.value,
        endTime: eventForm.elements.endTime.value,
        published: true
      };
      if (pendingImageData) record.imageData = pendingImageData;
      if (pendingImageData === "") record.removeImage = true;
      if (currentKind === "courses") {
        record.place = eventForm.elements.place.value.trim();
        record.category = eventForm.elements.category.value;
        record.link = eventForm.elements.link.value.trim();
        delete record.region;
      } else {
        record.region = eventForm.elements.region.value;
        delete record.place;
        delete record.category;
        delete record.link;
      }

      isSavingEvent = true;
      syncSaveButton();
      setStatus(adminStatus, "儲存中…");
      try {
        const result = await requestEventApi({
          action: "saveEvent",
          token,
          event: record,
          requestId: requestId()
        }, 45000);
        const remote = extractEvents(result);
        if (remote) eventData = remote;
        else {
          const saved = result?.event || result?.data?.event || record;
          const remaining = currentItems().filter(item => String(item.id) !== String(saved.id || id));
          eventData[currentKind] = [...remaining, saved];
        }
        const saved = result?.event || result?.data?.event || record;
        const savedId = saved.id || id;
        renderAllEventBoards();
        refreshExistingOptions(savedId);
        fillEditor(savedId);
        setStatus(adminStatus, "活動已儲存並更新至網站。", "success");
      } catch (error) {
        const message = error.message || "活動儲存失敗，請稍後再試。";
        if (/登入|權限|token|unauthor/i.test(message)) {
          sessionStorage.removeItem(tokenKey);
          showLogin("登入已失效，請重新登入。");
        } else setStatus(adminStatus, message, "error");
      } finally {
        isSavingEvent = false;
        syncSaveButton();
      }
    });

    deleteButton.addEventListener("click", async () => {
      const id = eventForm.elements.id.value;
      const item = findEvent(id);
      if (!id || !item) return;
      if (!window.confirm(`確定要刪除「${item.title || item.name || "此活動"}」嗎？此動作無法復原。`)) return;
      const token = sessionStorage.getItem(tokenKey);
      if (!token) return showLogin("登入已失效，請重新登入。");
      deleteButton.disabled = true;
      setStatus(adminStatus, "刪除中…");
      try {
        const result = await requestEventApi({ action: "deleteEvent", token, kind: currentKind, id, requestId: requestId() });
        const remote = extractEvents(result);
        if (remote) eventData = remote;
        else eventData[currentKind] = currentItems().filter(record => String(record.id) !== String(id));
        renderAllEventBoards();
        refreshExistingOptions();
        fillEditor();
        setStatus(adminStatus, "活動已刪除。", "success");
      } catch (error) {
        const message = error.message || "活動刪除失敗，請稍後再試。";
        if (/登入|權限|token|unauthor/i.test(message)) {
          sessionStorage.removeItem(tokenKey);
          showLogin("登入已失效，請重新登入。");
        } else setStatus(adminStatus, message, "error");
      } finally {
        deleteButton.disabled = false;
      }
    });
  }

  async function setupEventBoards() {
    if (!eventBoards.length) return;
    eventBoards.forEach(board => {
      const list = board.querySelector("[data-event-list]");
      if (list) list.innerHTML = '<div class="empty-state">活動資料載入中…</div>';
    });
    setupEventBoardInteractions();
    setupAdminEditor();
    await loadEventData();
    renderAllEventBoards();
  }

  setupEventBoards();
})();
