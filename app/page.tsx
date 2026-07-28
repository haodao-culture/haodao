"use client";

import { useState } from "react";

type Version = "lobby" | "original" | "recommended";

const fazhouUrl =
  "https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao";

const originalSections = [
  {
    id: "about-original",
    number: "01",
    eyebrow: "ABOUT HAODAO",
    title: "認識昊道",
    description: "集中呈現昊道文化的完整介紹，讓訪客先理解我們是誰。",
    links: ["昊道文化介紹"],
  },
  {
    id: "learning-original",
    number: "02",
    eyebrow: "LEARNING MAP",
    title: "學習地圖",
    description: "以三個階段呈現學習路徑，每一站都有獨立說明與下一步入口。",
    links: ["第一步｜共學會", "第二步｜待確認", "第三步｜待確認"],
  },
  {
    id: "courses-original",
    number: "03",
    eyebrow: "COURSES & EVENTS",
    title: "課程與活動",
    description: "把課程介紹、近期招生、行事曆與歷史回顧集中在同一個主題。",
    links: ["五類課程介紹", "近期招生", "課程行事曆", "歷史回顧"],
  },
  {
    id: "community-original",
    number: "04",
    eyebrow: "COMMUNITY",
    title: "共學與陪伴",
    description: "介紹共學的價值，並提供各地共學點及近期共學活動資訊。",
    links: ["共學理念", "各地共學點", "近期共學活動", "加入共學"],
  },
  {
    id: "welfare-original",
    number: "05",
    eyebrow: "PUBLIC WELFARE",
    title: "公益與服務",
    description: "呈現志工服務、文化推廣、社會關懷與公益行動。",
    links: ["志工服務", "文化推廣", "社會關懷", "公益行動"],
  },
];

const recommendedSections = [
  {
    id: "about-recommended",
    number: "01",
    eyebrow: "KNOW HAODAO",
    title: "先認識昊道",
    description: "從成立緣起、核心理念、願景與公益定位，建立完整的品牌理解。",
    links: ["成立緣起", "核心理念", "願景", "社會影響"],
  },
  {
    id: "journey-recommended",
    number: "02",
    eyebrow: "FIND YOUR WAY",
    title: "找到學習起點",
    description: "先回答「我適合從哪裡開始」，再把每個階段連到明確的課程或活動。",
    links: ["共學會", "階段二", "階段三", "適合我的入口"],
  },
  {
    id: "programs-recommended",
    number: "03",
    eyebrow: "LEARN & JOIN",
    title: "選擇課程與場次",
    description: "清楚區分課程類型、實際招生場次與日期行事曆，避免資訊混在一起。",
    links: ["課程類型", "近期招生", "日期行事曆", "活動回顧"],
  },
  {
    id: "community-recommended",
    number: "04",
    eyebrow: "FIND COMPANIONS",
    title: "加入共學與陪伴",
    description: "依照使用需求，分成尋找固定共學點及尋找近期共學活動。",
    links: ["尋找共學點", "近期共學活動", "地區篩選", "聯絡主辦人"],
  },
  {
    id: "impact-recommended",
    number: "05",
    eyebrow: "CREATE IMPACT",
    title: "參與公益行動",
    description: "先說明公益理念，再用具體行動、紀錄與成果呈現帶來的影響。",
    links: ["公益理念", "服務領域", "行動紀錄", "如何參與"],
  },
];

function Brand() {
  return (
    <span className="brand">
      <span className="brand-mark">昊</span>
      <span className="brand-name">
        昊道文化
        <small>HAODAO CULTURE</small>
      </span>
    </span>
  );
}

function Lobby({ enter }: { enter: (version: Version) => void }) {
  return (
    <main className="lobby">
      <div className="lobby-photo" aria-hidden="true" />
      <div className="lobby-shade" aria-hidden="true" />
      <header className="lobby-header">
        <Brand />
        <span className="prototype-label">網站架構對焦展示</span>
      </header>

      <section className="lobby-content">
        <p className="eyebrow light">TWO WAYS TO EXPERIENCE HAODAO</p>
        <h1>
          同一份內容，
          <br />
          兩種抵達的方式。
        </h1>
        <p className="lobby-intro">
          選擇一個版本進入，實際感受兩種網站架構的導覽邏輯與內容關係。
          您可以隨時回到這一頁切換比較。
        </p>

        <div className="version-cards">
          <button className="version-card original-card" onClick={() => enter("original")}>
            <span className="version-index">A</span>
            <span className="version-copy">
              <small>ORIGINAL STRUCTURE</small>
              <strong>原始架構設計</strong>
              <span>忠實呈現 Notion 分層，以內容主題及頁面類型進行分類。</span>
            </span>
            <span className="enter-arrow" aria-hidden="true">進入體驗 ↗</span>
          </button>

          <button
            className="version-card recommended-card"
            onClick={() => enter("recommended")}
          >
            <span className="recommended-tag">建議</span>
            <span className="version-index">B</span>
            <span className="version-copy">
              <small>RECOMMENDED STRUCTURE</small>
              <strong>使用者路徑架構</strong>
              <span>依照訪客下一步重新組織，讓學習、報名與參與路徑更明確。</span>
            </span>
            <span className="enter-arrow" aria-hidden="true">進入體驗 ↗</span>
          </button>
        </div>
      </section>

      <footer className="lobby-footer">
        <span>HAODAO CULTURE · ARCHITECTURE PROTOTYPE</span>
        <span>兩個版本均為架構對焦用展示</span>
      </footer>
    </main>
  );
}

function SiteHeader({
  version,
  setVersion,
}: {
  version: Exclude<Version, "lobby">;
  setVersion: (version: Version) => void;
}) {
  const original = version === "original";
  const nav = original
    ? [
        ["認識昊道", "#about-original"],
        ["學習地圖", "#learning-original"],
        ["課程與活動", "#courses-original"],
        ["共學與陪伴", "#community-original"],
        ["公益與服務", "#welfare-original"],
      ]
    : [
        ["認識昊道", "#about-recommended"],
        ["學習與參與", "#journey-recommended"],
        ["近期招生", "#programs-recommended"],
        ["共學與陪伴", "#community-recommended"],
        ["公益與服務", "#impact-recommended"],
      ];

  return (
    <header className="demo-header">
      <button className="brand-button" onClick={() => setVersion("lobby")} aria-label="回到版本選擇">
        <Brand />
      </button>
      <nav className="demo-nav" aria-label={`${original ? "原始" : "建議"}架構主選單`}>
        {nav.map(([label, href]) => (
          <a key={label} href={href}>
            {label}
          </a>
        ))}
        <a href={fazhouUrl} target="_blank" rel="noreferrer">
          昊道法舟 ↗
        </a>
      </nav>
      <div className="version-switch" aria-label="切換架構版本">
        <button
          className={original ? "active" : ""}
          onClick={() => setVersion("original")}
          aria-pressed={original}
        >
          原始版
        </button>
        <button
          className={!original ? "active" : ""}
          onClick={() => setVersion("recommended")}
          aria-pressed={!original}
        >
          建議版
        </button>
      </div>
    </header>
  );
}

function SectionGrid({
  version,
}: {
  version: Exclude<Version, "lobby">;
}) {
  const sections = version === "original" ? originalSections : recommendedSections;
  return (
    <section className="architecture-section">
      <div className="architecture-heading">
        <p className="eyebrow">
          {version === "original" ? "CONTENT-LED ARCHITECTURE" : "JOURNEY-LED ARCHITECTURE"}
        </p>
        <h2>
          {version === "original" ? "依照內容主題，逐層展開。" : "依照使用者意圖，引導下一步。"}
        </h2>
        <p>
          {version === "original"
            ? "每個主題各自形成完整頁面，再從頁面深入詳情、活動與功能。"
            : "每一個頁面都回答一個問題，並提供明確、可預期的下一個行動。"}
        </p>
      </div>

      <div className="architecture-grid">
        {sections.map((section) => (
          <article className="architecture-card" id={section.id} key={section.id}>
            <div className="architecture-number">{section.number}</div>
            <p className="eyebrow">{section.eyebrow}</p>
            <h3>{section.title}</h3>
            <p>{section.description}</p>
            <ul>
              {section.links.map((link) => (
                <li key={link}>
                  <span>{link}</span>
                  <span aria-hidden="true">→</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function VersionSite({
  version,
  setVersion,
}: {
  version: Exclude<Version, "lobby">;
  setVersion: (version: Version) => void;
}) {
  const original = version === "original";
  return (
    <main className={`demo-site ${version}`}>
      <SiteHeader version={version} setVersion={setVersion} />

      <section className="demo-hero" id="top">
        <div className="demo-hero-image" aria-hidden="true" />
        <div className="demo-hero-shade" aria-hidden="true" />
        <div className="demo-hero-copy">
          <div className="version-pill">
            {original ? "VERSION A · 原始架構設計" : "VERSION B · 建議架構"}
          </div>
          <p className="eyebrow light">HAODAO CULTURE</p>
          <h1>
            {original ? (
              <>
                在覺察裡，
                <br />
                走回生命的從容。
              </>
            ) : (
              <>
                從此刻出發，
                <br />
                找到適合你的路。
              </>
            )}
          </h1>
          <p>
            {original
              ? "透過學習、共修與服務，陪伴每個人看見自己，把內在的安定帶回日常。"
              : "不必先理解所有內容。告訴我們你想認識、學習、參與或同行，我們帶你找到下一步。"}
          </p>
          <div className="demo-actions">
            <a className="primary-action" href={original ? "#learning-original" : "#journey-recommended"}>
              {original ? "探索學習地圖" : "找到我的學習起點"}
            </a>
            <a className="secondary-action" href={original ? "#courses-original" : "#programs-recommended"}>
              查看近期招生
            </a>
          </div>
        </div>
        <div className="hero-note">
          <span>{original ? "內容分類導向" : "使用者任務導向"}</span>
          <p>
            {original
              ? "先選主題，再閱讀完整內容。"
              : "先選目的，再抵達需要的內容。"}
          </p>
        </div>
      </section>

      {!original && (
        <section className="intent-strip" aria-label="初次來訪者入口">
          <p>今天來到昊道，你想要——</p>
          <div>
            <a href="#about-recommended">先認識昊道 <span>01</span></a>
            <a href="#journey-recommended">找到學習起點 <span>02</span></a>
            <a href="#programs-recommended">直接找課程活動 <span>03</span></a>
          </div>
        </section>
      )}

      <SectionGrid version={version} />

      <section className="fazhou-panel">
        <div>
          <p className="eyebrow light">HAODAO FAZHOU</p>
          <h2>以文化為舟，承載書法、音樂與心靈慧談。</h2>
        </div>
        <a href={fazhouUrl} target="_blank" rel="noreferrer">
          前往昊道法舟 <span>↗</span>
        </a>
      </section>

      <section className="comparison-note">
        <p className="eyebrow">COMPARE THE TWO</p>
        <h2>{original ? "想看看另一種走法嗎？" : "回頭比較原始分類方式。"}</h2>
        <p>
          {original
            ? "建議版保留相同內容，但把導覽改成依照訪客的目的與下一步組織。"
            : "原始版忠實呈現 Notion 的分層邏輯，適合檢查內容是否齊全。"}
        </p>
        <button onClick={() => setVersion(original ? "recommended" : "original")}>
          切換至{original ? "建議架構" : "原始架構"} →
        </button>
      </section>

      <footer className="demo-footer">
        <Brand />
        <div>
          <a href="#top">回到頁首</a>
          <a href={fazhouUrl} target="_blank" rel="noreferrer">昊道法舟</a>
          <button onClick={() => setVersion("lobby")}>版本選擇</button>
        </div>
        <p>© 2026 昊道文化 · 架構對焦展示</p>
      </footer>
    </main>
  );
}

export default function Home() {
  const [version, setVersion] = useState<Version>("lobby");

  if (version === "lobby") {
    return <Lobby enter={setVersion} />;
  }

  return <VersionSite version={version} setVersion={setVersion} />;
}
