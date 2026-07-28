"use client";

import { useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  date: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  audience: string;
  description: string;
  registrationUrl: string;
  format: string;
  image: string;
};

const sheetCsvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRN3Y4zJ-ReF0qFUbd8BPwdlwbWNZBA2RYL2XX3rWi51OeQtK2R4DOO8bwic1PH-WKJQyoVLudn0w2V/pub?gid=1291996599&single=true&output=csv";

const eventFilters = ["全部", "線上", "線下"];

function csvToRows(text: string) {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (inQuotes) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += character;
      }
    } else if (character === '"') {
      inQuotes = true;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (character !== "\r") {
      field += character;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function normalizeDate(value: string) {
  const match = String(value || "").match(/(\d{4})[/.–-](\d{1,2})[/.–-](\d{1,2})/);
  if (!match) return value || "";
  return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
}

function normalizeTime(value: string) {
  const text = String(value || "").trim();
  const match = text.match(/^(上午|下午)?\s*(\d{1,2}):(\d{2})/);
  if (!match) return text;
  let hour = Number(match[2]);
  if (match[1] === "下午" && hour < 12) hour += 12;
  if (match[1] === "上午" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${match[3]}`;
}

function normalizeImage(value: string) {
  const match =
    value.match(/drive\.google\.com\/file\/d\/([^/]+)/) ||
    value.match(/drive\.google\.com\/open\?id=([^&]+)/);
  return match ? `https://lh3.googleusercontent.com/d/${match[1]}` : value;
}

function parseEvents(text: string): EventItem[] {
  const rows = csvToRows(text);
  const headers = rows[0] || [];
  const pick = (record: Record<string, string>, aliases: string[]) =>
    aliases.map((alias) => record[alias]).find(Boolean) || "";

  return rows
    .slice(1)
    .filter((row) => row.some((value) => value.trim()))
    .map((row, index) => {
      const record: Record<string, string> = {};
      headers.forEach((header, headerIndex) => {
        record[header.trim()] = (row[headerIndex] || "").trim();
      });

      const timestamp = pick(record, ["id", "時間戳記", "提交時間"]);
      return {
        id: timestamp || `event-${index}`,
        title: pick(record, ["title", "主題", "活動主題"]),
        date: normalizeDate(pick(record, ["date", "日期 (開始)", "日期", "開始日期"])),
        endDate: normalizeDate(pick(record, ["endDate", "日期 (結束)", "結束日期"])),
        startTime: normalizeTime(pick(record, ["startTime", "時間 (開始)", "開始時間"])),
        endTime: normalizeTime(pick(record, ["endTime", "時間 (結束)", "結束時間"])),
        location: pick(record, ["location", "活動地點", "地點"]),
        audience: pick(record, [
          "audience",
          "開放報名對象範圍（可多選、但儘量單一）",
          "開放報名對象",
          "對象",
        ]),
        description: pick(record, ["description", "活動簡要說明 (引文)", "活動簡要", "簡介"]),
        registrationUrl: pick(record, [
          "registrationUrl",
          "報名網址 / 報名接龍群組",
          "報名網址",
          "報名連結",
        ]),
        format: pick(record, ["format", "活動形式", "形式"]),
        image: normalizeImage(pick(record, ["image", "上傳活動海報", "活動海報", "海報"])),
      };
    })
    .filter((event) => event.title && event.date);
}

function isPastEvent(event: EventItem) {
  const endDate = event.endDate || event.date;
  return new Date(`${endDate}T23:59:59`) < new Date();
}

function formatEventDate(start: string, end: string) {
  const format = (value: string) => {
    const date = new Date(`${value}T00:00:00`);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "short",
    }).format(date);
  };
  return end && end !== start ? `${format(start)}－${format(end)}` : format(start);
}

const communityPoints = [
  ["台北共學點", "台北市", "每月第二、四週"],
  ["台中共學點", "台中市", "每月第一、三週"],
  ["高雄共學點", "高雄市", "每月第二週"],
];

const searchItems = [
  ["認識昊道", "#about", "成立緣起、核心理念與願景"],
  ["學習地圖", "#learning", "共學會、覺察學習、服務與陪伴"],
  ["課程與活動", "#events", "進行中、行事曆與歷史活動"],
  ["線上活動", "#events", "目前開放報名的線上課程與活動"],
  ["線下活動", "#events", "目前開放報名的實體課程與活動"],
  ["共學與陪伴", "#community", "各地共學點與近期活動"],
  ["公益與服務", "#service", "志工服務、文化推廣與社會關懷"],
  ["昊道法舟", "#fazhou", "書法、音樂與心靈慧談"],
];

export default function Home() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [eventFilter, setEventFilter] = useState("全部");
  const [eventView, setEventView] = useState<"current" | "calendar" | "past">("current");
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(sheetCsvUrl, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("活動資料載入失敗");
        return response.text();
      })
      .then((text) => {
        setEvents(parseEvents(text));
        setEventsError(false);
      })
      .catch((error) => {
        if (error.name !== "AbortError") setEventsError(true);
      })
      .finally(() => setEventsLoading(false));
    return () => controller.abort();
  }, []);

  const visibleEvents = useMemo(() => {
    const filteredByTime = events.filter((event) =>
      eventView === "past" ? isPastEvent(event) : !isPastEvent(event),
    );
    return filteredByTime
      .filter((event) => {
        if (eventFilter === "全部" || eventView === "calendar") return true;
        const searchable = `${event.format} ${event.location}`;
        if (eventFilter === "線上") return /線上|meet|zoom/i.test(searchable);
        return !/線上|meet|zoom/i.test(searchable);
      })
      .sort((a, b) =>
        eventView === "past"
          ? b.date.localeCompare(a.date)
          : a.date.localeCompare(b.date),
      );
  }, [events, eventFilter, eventView]);

  const calendarGroups = useMemo(() => {
    return visibleEvents.reduce<Record<string, EventItem[]>>((groups, event) => {
      const key = event.date.slice(0, 7);
      groups[key] = [...(groups[key] || []), event];
      return groups;
    }, {});
  }, [visibleEvents]);

  const visibleSearchItems = searchItems.filter((item) =>
    item.join(" ").toLowerCase().includes(query.trim().toLowerCase()),
  );

  const closeMenu = () => setMenuOpen(false);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="昊道文化首頁" onClick={closeMenu}>
          <span className="brand-mark">昊</span>
          <span>
            昊道文化
            <small>HAODAO CULTURE</small>
          </span>
        </a>
        <button
          className="menu-button"
          type="button"
          aria-label="開啟選單"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="主要導覽">
          <a href="#about" onClick={closeMenu}>認識昊道</a>
          <div className="nav-group">
            <a className="nav-label" href="#courses" onClick={closeMenu}>
              學習與參與 <span aria-hidden="true">⌄</span>
            </a>
            <div className="submenu mega-menu">
              <a href="#learning" onClick={closeMenu}>學習地圖</a>
              <a href="#events" onClick={closeMenu}>課程與活動</a>
              <a href="#events" onClick={closeMenu}>近期招生</a>
              <a href="#events" onClick={closeMenu}>課程行事曆</a>
              <a href="#community" onClick={closeMenu}>共學與陪伴</a>
              <a href="#service" onClick={closeMenu}>公益與服務</a>
            </div>
          </div>
          <div className="nav-group">
            <a
              className="nav-label"
              href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao"
              target="_blank"
              rel="noreferrer"
            >
              昊道法舟 <span aria-hidden="true">⌄</span>
            </a>
            <div className="submenu">
              <a href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao" target="_blank" rel="noreferrer">書法</a>
              <a href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao" target="_blank" rel="noreferrer">音樂</a>
              <a href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao" target="_blank" rel="noreferrer">心靈慧談 ↗</a>
            </div>
          </div>
          <button
            className="search-trigger"
            type="button"
            onClick={() => {
              closeMenu();
              setSearchOpen(true);
            }}
            aria-label="開啟全站搜尋"
          >
            搜尋 ⌕
          </button>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-wash" />
        <div className="hero-content">
          <p className="eyebrow light">HAODAO CULTURE · 昊道文化</p>
          <h1>在覺察裡，<br />走回生命的從容。</h1>
          <p className="hero-copy">
            透過學習、共修與服務，陪伴每個人看見自己，
            把內在的安定帶回日常，也帶進與人的關係裡。
          </p>
          <div className="hero-actions">
            <a className="button primary" href="#learning">找到我的學習起點</a>
            <a className="button ghost" href="#courses">查看近期招生</a>
          </div>
        </div>
        <a className="scroll-cue" href="#about" aria-label="向下了解昊道">
          <span>SCROLL</span>
          <i />
        </a>
      </section>

      <section className="intro section" id="about">
        <div className="section-label">
          <span>01</span>
          <p>認識昊道</p>
        </div>
        <div className="intro-copy">
          <p className="eyebrow">ABOUT HAODAO</p>
          <h2>一條把理解化為實踐，<br />把善意帶進生活的路。</h2>
          <p>
            昊道文化相信，每個人都擁有回到內在安定的能力。
            我們以平實、可實踐的學習方式，陪伴人們培養覺察、
            理解生命，並在共學與公益行動中彼此支持。
          </p>
          <a className="text-link" href="#learning">了解我們的理念 <span>→</span></a>
        </div>
        <figure className="intro-figure">
          <img src="/images/calligraphy.jpg" alt="昊道文化書法與靜心活動現場" />
          <figcaption>以文化為舟，以覺察為路。</figcaption>
        </figure>
      </section>

      <section className="learning section-dark" id="learning">
        <div className="section-heading light-heading">
          <div>
            <p className="eyebrow light">LEARNING JOURNEY</p>
            <h2>每一步，都從此刻的你開始。</h2>
          </div>
          <p>不需要預先成為更好的人。從一次共學、一段練習開始，讓理解慢慢長成自己的力量。</p>
        </div>

        <div className="path">
          <article className="path-card active">
            <span className="path-number">01</span>
            <div>
              <p className="path-kicker">入門 · 相遇</p>
              <h3>共學會</h3>
              <p>在安全、真誠的空間裡，透過分享與練習，開始看見自己的內在。</p>
              <a href="#community">了解共學會 →</a>
            </div>
          </article>
          <article className="path-card">
            <span className="path-number">02</span>
            <div>
              <p className="path-kicker">深化 · 練習</p>
              <h3>覺察學習</h3>
              <p>透過階段課程，學習辨認情緒、信念與關係中的慣性反應。</p>
              <a href="#courses">探索階段課程 →</a>
            </div>
          </article>
          <article className="path-card">
            <span className="path-number">03</span>
            <div>
              <p className="path-kicker">實踐 · 同行</p>
              <h3>服務與陪伴</h3>
              <p>把學習帶入生活，透過共修與志願服務，讓善意持續流動。</p>
              <a href="#service">看見公益行動 →</a>
            </div>
          </article>
        </div>
      </section>

      <section className="courses section" id="courses">
        <div className="section-heading" id="events">
          <div>
            <p className="eyebrow">COURSES & EVENTS</p>
            <h2>活動與課程</h2>
          </div>
          <p>
            延續原官網的活動頁使用方式，資料直接讀取同一份公開活動後台。
          </p>
        </div>

        <div className="events-source-note">
          <span className={eventsError ? "source-dot error" : "source-dot"} />
          <span>
            {eventsLoading
              ? "正在同步活動資料…"
              : eventsError
                ? "目前無法同步活動資料，請稍後再試"
                : `已同步活動後台 · 共 ${events.length} 筆`}
          </span>
        </div>

        <nav className="events-tabs" aria-label="活動分頁">
          {[
            ["current", "進行中"],
            ["calendar", "行事曆"],
            ["past", "歷史活動"],
          ].map(([value, label]) => (
            <button
              type="button"
              className={eventView === value ? "active" : ""}
              aria-pressed={eventView === value}
              onClick={() => setEventView(value as typeof eventView)}
              key={value}
            >
              {label}
            </button>
          ))}
        </nav>

        {eventView !== "calendar" && (
          <div className="event-format-filter" role="group" aria-label="篩選活動形式">
            {eventFilters.map((item) => (
              <button
                type="button"
                className={eventFilter === item ? "active" : ""}
                aria-pressed={eventFilter === item}
                onClick={() => setEventFilter(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
        )}

        {eventsLoading ? (
          <p className="events-status">活動資訊載入中⋯</p>
        ) : eventsError ? (
          <div className="events-status">
            <p>活動資訊暫時無法載入。</p>
            <a href="https://www.haodao.org/events/" target="_blank" rel="noreferrer">
              前往原官網活動頁 →
            </a>
          </div>
        ) : eventView === "calendar" ? (
          <div className="live-calendar">
            {Object.entries(calendarGroups).length ? (
              Object.entries(calendarGroups).map(([month, monthEvents]) => (
                <section key={month}>
                  <h3>{month.replace("-", " 年 ")} 月</h3>
                  <div>
                    {monthEvents.map((event) => (
                      <a
                        href={/^https?:\/\//.test(event.registrationUrl) ? event.registrationUrl : "#contact"}
                        target={/^https?:\/\//.test(event.registrationUrl) ? "_blank" : undefined}
                        rel="noreferrer"
                        key={event.id}
                      >
                        <time>{event.date.slice(8, 10)}</time>
                        <span>
                          <strong>{event.title}</strong>
                          <small>{event.format || event.location}</small>
                        </span>
                      </a>
                    ))}
                  </div>
                </section>
              ))
            ) : (
              <p className="events-status">目前行事曆中沒有活動。</p>
            )}
          </div>
        ) : visibleEvents.length ? (
          <div className="live-events-list">
            {visibleEvents.map((event) => {
              const isOnline = /線上|meet|zoom/i.test(`${event.format} ${event.location}`);
              const registrationIsLink = /^https?:\/\//.test(event.registrationUrl);
              return (
                <article className="live-event-card" key={event.id}>
                  {event.image && (
                    <div className="live-event-image">
                      <img src={event.image} alt={`${event.title}活動海報`} loading="lazy" />
                    </div>
                  )}
                  <div className="live-event-body">
                    <div className="live-event-heading">
                      <span>{isOnline ? "線上" : "線下"}</span>
                      <h3>{event.title}</h3>
                    </div>
                    <div className="live-event-meta">
                      <p>{formatEventDate(event.date, event.endDate)}</p>
                      {(event.startTime || event.endTime) && (
                        <p>{event.startTime}{event.endTime ? `－${event.endTime}` : ""}</p>
                      )}
                      {event.location && <p>{event.location}</p>}
                    </div>
                    {event.audience && <p className="live-event-audience">對象：{event.audience}</p>}
                    {event.description && <p className="live-event-description">{event.description}</p>}
                    {event.registrationUrl ? (
                      registrationIsLink ? (
                        <a
                          className="live-event-cta"
                          href={event.registrationUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {eventView === "past" ? "查看活動資訊" : "立即報名"} ↗
                        </a>
                      ) : (
                        <p className="live-event-registration">報名方式：{event.registrationUrl}</p>
                      )
                    ) : (
                      <span className="live-event-disabled">
                        {eventView === "past" ? "活動已結束" : "報名連結準備中"}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <p className="events-status">
            {eventView === "past" ? "目前沒有符合條件的歷史活動。" : "目前沒有符合條件的進行中活動。"}
          </p>
        )}
      </section>

      <section className="community" id="community">
        <div className="community-photo">
          <img src="/images/group-sharing.jpg" alt="共學夥伴圍坐分享" />
        </div>
        <div className="community-copy">
          <p className="eyebrow light">COMMUNITY & COMPANIONSHIP</p>
          <h2>學習不必獨自前行。</h2>
          <p>
            共學點是生活裡可以反覆回來的地方。有人傾聽、有人同行，
            讓每次練習都不只停留在課堂。
          </p>
          <div className="community-stats">
            <div><strong>8</strong><span>個共學城市</span></div>
            <div><strong>24+</strong><span>每月共學場次</span></div>
          </div>
          <a className="button warm" href="#contact">尋找離我最近的共學點</a>
        </div>
      </section>

      <section className="community-details section" id="community-points">
        <div className="section-heading">
          <div>
            <p className="eyebrow">LOCAL COMMUNITY</p>
            <h2>各地共學點</h2>
          </div>
          <p>找到離自己最近的共學夥伴，在固定的相聚中持續練習。</p>
        </div>
        <div className="point-grid">
          {communityPoints.map(([name, region, schedule], index) => (
            <article key={name}>
              <img
                src={["/images/group-sharing.jpg", "/images/quiet-room.jpg", "/images/garden-meditation.jpg"][index]}
                alt={`${name}活動空間`}
              />
              <div>
                <span>{region}</span>
                <h3>{name}</h3>
                <p>{schedule}</p>
                <a href="#contact">查看共學點資訊 →</a>
              </div>
            </article>
          ))}
        </div>

        <div className="community-event">
          <div>
            <p className="eyebrow light">近期共學活動 · UPCOMING COMMUNITY EVENT</p>
            <h2>每月線上共學夜</h2>
            <p>08.28 · 週五 19:30 · Google Meet</p>
          </div>
          <a className="button warm" href="#contact">查看活動與報名方式</a>
        </div>
      </section>

      <section className="service section" id="service">
        <div className="service-heading">
          <p className="eyebrow">PUBLIC WELFARE</p>
          <h2>讓內在的改變，<br />成為照亮他人的行動。</h2>
        </div>
        <div className="service-grid">
          <article>
            <span>01</span>
            <img src="/images/wildflowers.jpg" alt="自然中的野花" />
            <h3>志工服務</h3>
            <p>讓每一份專長與時間，都能成為溫柔而具體的支持。</p>
          </article>
          <article>
            <span>02</span>
            <img src="/images/garden-meditation.jpg" alt="戶外靜心活動" />
            <h3>文化推廣</h3>
            <p>以課程、藝術與分享，讓覺察成為人人可親近的生活文化。</p>
          </article>
          <article>
            <span>03</span>
            <img src="/images/teaching.jpg" alt="帶領者與學員交流" />
            <h3>社會關懷</h3>
            <p>走進需要陪伴的地方，讓理解與尊重成為關係的起點。</p>
          </article>
        </div>
      </section>

      <section className="fazhou" id="fazhou">
        <div className="fazhou-art" aria-hidden="true">
          <span>法</span>
          <span>舟</span>
        </div>
        <div className="fazhou-copy">
          <p className="eyebrow light">HAODAO FAZHOU</p>
          <h2>以文化為舟，<br />渡向心中的清明。</h2>
          <p>
            昊道法舟收藏書法、音樂與心靈慧談。
            在一筆一畫、一音一念之間，留一段安靜的時間與自己相遇。
          </p>
          <a
            className="button warm"
            href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao"
            target="_blank"
            rel="noreferrer"
          >
            前往昊道法舟 <span aria-hidden="true">↗</span>
          </a>
          <small>將在新分頁開啟法舟網站</small>
        </div>
      </section>

      <section className="quote-section">
        <p>「真正的學習，是在每一個當下，<br />更清楚地看見，也更自由地選擇。」</p>
        <span>昊道文化 · 心靈慧談</span>
      </section>

      <footer id="contact">
        <div className="footer-main">
          <div>
            <p className="eyebrow light">STAY CONNECTED</p>
            <h2>從一次相遇開始。</h2>
            <p>加入官方 LINE，取得近期課程、共學活動與文化內容。</p>
            <a className="button warm" href="#top">加入官方 LINE（展示）</a>
          </div>
          <div className="footer-links">
            <div>
              <p>探索</p>
              <a href="#about">認識昊道</a>
              <a href="#learning">學習地圖</a>
              <a href="#courses">課程與活動</a>
              <a href="#events">課程行事曆</a>
            </div>
            <div>
              <p>參與</p>
              <a href="#community">共學與陪伴</a>
              <a href="#service">公益與服務</a>
              <a
                href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao"
                target="_blank"
                rel="noreferrer"
              >
                昊道法舟 ↗
              </a>
            </div>
            <div>
              <p>社群</p>
              <a href="#top">LINE</a>
              <a href="#top">Facebook</a>
              <a href="#top">Instagram</a>
              <a href="#top">Threads</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 昊道文化 · MVP CONCEPT</span>
          <span id="privacy">隱私權政策 · 此網站為架構與視覺展示</span>
        </div>
      </footer>

      {searchOpen && (
        <div className="search-overlay" role="dialog" aria-modal="true" aria-label="全站搜尋">
          <button
            className="search-close"
            type="button"
            onClick={() => setSearchOpen(false)}
            aria-label="關閉搜尋"
          >
            關閉 ×
          </button>
          <div className="search-panel">
            <p className="eyebrow light">SITE SEARCH</p>
            <h2>想找什麼？</h2>
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="輸入關鍵字，例如：共學、靜心、公益"
              aria-label="搜尋關鍵字"
            />
            <div className="search-results">
              {visibleSearchItems.length > 0 ? (
                visibleSearchItems.map(([title, href, description]) => (
                  <a
                    href={href}
                    key={title}
                    onClick={() => setSearchOpen(false)}
                  >
                    <span><strong>{title}</strong><small>{description}</small></span>
                    <span>→</span>
                  </a>
                ))
              ) : (
                <p>沒有找到符合的內容，試試「學習地圖」、「近期招生」或「共學」。</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
