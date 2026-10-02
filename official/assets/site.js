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
    footer.innerHTML = `<div class="floating-social" aria-label="社群連結">${socialLinks("social-icon")}</div>
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
    toggle.addEventListener("click", () => {
      const open = mainNav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "關閉導覽" : "開啟導覽");
      toggle.textContent = open ? "×" : "☰";
      document.body.classList.toggle("menu-open", open);
    });
  }

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

  document.querySelectorAll("[data-registration-form]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const message = form.parentElement.querySelector(".success-message");
      const errorMessage = form.parentElement.querySelector(".form-error");
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
        await fetch(form.dataset.registrationEndpoint, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify({
            name: data.get("name"),
            gender: data.get("gender"),
            phone: data.get("phone"),
            region: data.get("region")
          })
        });
        form.reset();
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

  function formatEventDate(value) {
    const match = String(value || "").match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return value || "日期另行公告";
    return `${match[1]} 年 ${Number(match[2])} 月 ${Number(match[3])} 日`;
  }

  function eventCard(item, kind) {
    const title = item.title || item.name || "未命名活動";
    const label = kind === "courses" ? item.category : item.region;
    const image = safeUrl(item.image || (item.mediaType === "image" ? item.media : ""));
    const video = safeUrl(item.video || (item.mediaType === "video" ? item.media : ""));
    const link = safeUrl(item.link || item.registrationUrl);
    const media = image
      ? `<div class="event-media"><img src="${escapeHtml(image)}" alt="${escapeHtml(title)}" loading="lazy"></div>`
      : video
        ? `<div class="event-media"><video src="${escapeHtml(video)}" controls preload="metadata" aria-label="${escapeHtml(title)}"></video></div>`
        : `<div class="event-media event-media-placeholder" aria-hidden="true"><span>昊道文化</span></div>`;
    const details = [
      formatEventDate(item.date),
      item.time || "",
      item.place || item.location || ""
    ].filter(Boolean).map(escapeHtml).join(" · ");

    return `<article class="event-card">
      ${media}
      <div class="event-copy">
        ${label ? `<span class="tag">${escapeHtml(label)}</span>` : ""}
        <h3>${escapeHtml(title)}</h3>
        <p class="event-meta">${details}</p>
        ${item.description ? `<p class="event-description">${escapeHtml(item.description)}</p>` : ""}
        ${link ? `<a class="button-primary event-link" href="${escapeHtml(link)}" target="_blank" rel="noopener">查看詳情／報名</a>` : ""}
      </div>
    </article>`;
  }

  async function setupEventBoards() {
    if (!eventBoards.length) return;
    eventBoards.forEach(board => {
      const list = board.querySelector("[data-event-list]");
      if (list) list.innerHTML = '<div class="empty-state">活動資料載入中…</div>';
    });

    let eventData = { courses: [], community: [] };
    try {
      const response = await fetch("data/events.json", { cache: "no-store" });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      eventData = await response.json();
    } catch (error) {
      console.warn("活動資料載入失敗。", error);
    }

    const today = new Date();
    const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    eventBoards.forEach(board => {
      const kind = board.dataset.eventBoard;
      const history = board.dataset.history === "true";
      const list = board.querySelector("[data-event-list]");
      const filters = [...board.querySelectorAll("[data-filter]")];
      const items = Array.isArray(eventData[kind]) ? eventData[kind].filter(item => item && item.published !== false) : [];
      const emptyMessage = history ? "活動結束後，相關記錄將整理至此。" : "近期活動正在整理中，歡迎透過聯絡方式洽詢。";

      function renderEvents() {
        const activeFilter = filters.find(button => button.getAttribute("aria-selected") === "true")?.dataset.filter || "全部";
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
        if (list) list.innerHTML = filtered.length ? filtered.map(item => eventCard(item, kind)).join("") : `<div class="empty-state">${emptyMessage}</div>`;
      }

      filters.forEach(button => button.addEventListener("click", () => {
        filters.forEach(filter => filter.setAttribute("aria-selected", String(filter === button)));
        renderEvents();
      }));
      renderEvents();
    });
  }

  setupEventBoards();
})();
