"use client";

import { useMemo, useState } from "react";

const courses = [
  {
    type: "靜心",
    mode: "實體",
    date: "08.16",
    title: "週末靜心練習",
    place: "台北共學點",
    image: "/images/quiet-room.jpg",
  },
  {
    type: "一階",
    mode: "實體",
    date: "08.23",
    title: "覺察，從生活開始",
    place: "台中共學點",
    image: "/images/classroom.jpg",
  },
  {
    type: "共學會",
    mode: "線上",
    date: "08.28",
    title: "每月線上共學夜",
    place: "Google Meet",
    image: "/images/group-sharing.jpg",
  },
  {
    type: "覺察覺知",
    mode: "實體",
    date: "09.06",
    title: "在關係中看見自己",
    place: "高雄共學點",
    image: "/images/teaching.jpg",
  },
];

const filters = ["全部", "一階", "靜心", "覺察覺知", "共學會"];

export default function Home() {
  const [filter, setFilter] = useState("全部");
  const [menuOpen, setMenuOpen] = useState(false);

  const visibleCourses = useMemo(
    () => courses.filter((course) => filter === "全部" || course.type === filter),
    [filter],
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
          <div className="nav-group">
            <a className="nav-label" href="#about" onClick={closeMenu}>
              認識昊道 <span aria-hidden="true">⌄</span>
            </a>
            <div className="submenu">
              <a href="#about" onClick={closeMenu}>成立緣起</a>
              <a href="#about" onClick={closeMenu}>核心理念</a>
              <a href="#about" onClick={closeMenu}>願景與公益定位</a>
            </div>
          </div>
          <div className="nav-group">
            <a className="nav-label" href="#learning" onClick={closeMenu}>
              學習地圖 <span aria-hidden="true">⌄</span>
            </a>
            <div className="submenu">
              <a href="#learning" onClick={closeMenu}>共學會</a>
              <a href="#learning" onClick={closeMenu}>覺察學習</a>
              <a href="#learning" onClick={closeMenu}>服務與陪伴</a>
            </div>
          </div>
          <div className="nav-group">
            <a className="nav-label" href="#courses" onClick={closeMenu}>
              課程與活動 <span aria-hidden="true">⌄</span>
            </a>
            <div className="submenu">
              <a href="#courses" onClick={closeMenu}>近期招生</a>
              <a href="#courses" onClick={closeMenu}>五類課程介紹</a>
              <a href="#courses" onClick={closeMenu}>課程行事曆</a>
              <a href="#courses" onClick={closeMenu}>歷史回顧</a>
            </div>
          </div>
          <div className="nav-group">
            <a className="nav-label" href="#community" onClick={closeMenu}>
              共學與陪伴 <span aria-hidden="true">⌄</span>
            </a>
            <div className="submenu">
              <a href="#community" onClick={closeMenu}>各地共學點</a>
              <a href="#community" onClick={closeMenu}>近期共學活動</a>
              <a href="#community" onClick={closeMenu}>加入共學</a>
            </div>
          </div>
          <div className="nav-group">
            <a className="nav-label" href="#service" onClick={closeMenu}>
              公益與服務 <span aria-hidden="true">⌄</span>
            </a>
            <div className="submenu">
              <a href="#service" onClick={closeMenu}>志工服務</a>
              <a href="#service" onClick={closeMenu}>文化推廣</a>
              <a href="#service" onClick={closeMenu}>社會關懷</a>
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
          <a className="nav-cta" href="#contact" onClick={closeMenu}>聯絡我們</a>
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
        <div className="section-heading">
          <div>
            <p className="eyebrow">UPCOMING PROGRAMS</p>
            <h2>近期招生</h2>
          </div>
          <p>選一個適合此刻自己的入口。所有內容皆為 MVP 展示資料。</p>
        </div>

        <div className="filter-bar" role="group" aria-label="篩選課程類型">
          {filters.map((item) => (
            <button
              type="button"
              className={filter === item ? "selected" : ""}
              aria-pressed={filter === item}
              onClick={() => setFilter(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="course-grid">
          {visibleCourses.map((course) => (
            <article className="course-card" key={course.title}>
              <div className="course-image">
                <img src={course.image} alt="" />
                <div className="course-tags">
                  <span>{course.type}</span>
                  <span>{course.mode}</span>
                </div>
              </div>
              <div className="course-info">
                <p className="course-date">{course.date}</p>
                <div>
                  <h3>{course.title}</h3>
                  <p>{course.place}</p>
                </div>
                <button type="button" aria-label={`查看${course.title}詳情`}>↗</button>
              </div>
            </article>
          ))}
        </div>
        <div className="section-action">
          <a className="button outline" href="#contact">查看全部場次</a>
        </div>
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
          <span>此網站為架構與視覺展示，內容非正式公告</span>
        </div>
      </footer>
    </main>
  );
}
