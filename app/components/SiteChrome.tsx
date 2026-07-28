"use client";

import Link from "next/link";
import { useState } from "react";
import { assetUrl } from "../lib/assets";

const fazhouUrl =
  "https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao";

const socialLinks = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/profile.php?id=100063957733524",
    ariaLabel: "昊道文化 Facebook 粉絲專頁",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/haodao_culture",
    ariaLabel: "昊道文化 Instagram",
  },
  {
    label: "Threads",
    href: "https://www.threads.net/@haodao_culture",
    ariaLabel: "昊道文化 Threads",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/@昊道文化",
    ariaLabel: "昊道文化 YouTube 頻道",
  },
];

export function Brand() {
  return (
    <>
      <span className="brand-mark">昊</span>
      <span>
        昊道文化
        <small>HAODAO CULTURE</small>
      </span>
    </>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="site-header">
      <Link className="brand" href="/" aria-label="昊道文化首頁" onClick={closeMenu}>
        <Brand />
      </Link>
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
        <Link href="/about" onClick={closeMenu}>認識昊道</Link>
        <div className="nav-group">
          <Link className="nav-label" href="/learning" onClick={closeMenu}>
            學習與參與 <span aria-hidden="true">⌄</span>
          </Link>
          <div className="submenu mega-menu">
            <Link href="/learning" onClick={closeMenu}>學習地圖</Link>
            <Link href="/events" onClick={closeMenu}>課程與活動</Link>
            <Link href="/events" onClick={closeMenu}>近期招生</Link>
            <Link href="/community" onClick={closeMenu}>共學與陪伴</Link>
            <Link href="/welfare" onClick={closeMenu}>公益與服務</Link>
          </div>
        </div>
        <div className="nav-group">
          <Link className="nav-label" href="/fazhou" onClick={closeMenu}>
            昊道法舟 <span aria-hidden="true">⌄</span>
          </Link>
          <div className="submenu">
            <Link href="/fazhou" onClick={closeMenu}>法舟簡介</Link>
            <a href={fazhouUrl} target="_blank" rel="noreferrer">書法・音樂・慧談 ↗</a>
          </div>
        </div>
        <Link className="search-trigger" href="/search" onClick={closeMenu}>
          搜尋 ⌕
        </Link>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer id="contact">
      <div className="footer-main">
        <div>
          <p className="eyebrow light">STAY CONNECTED</p>
          <h2>從一次相遇開始。</h2>
          <p>追蹤官方社群，取得近期課程、共學活動與文化內容。</p>
          <a
            className="button warm"
            href="https://www.instagram.com/haodao_culture"
            target="_blank"
            rel="noopener noreferrer"
          >
            前往官方 Instagram ↗
          </a>
        </div>
        <div className="footer-links">
          <div>
            <p>探索</p>
            <Link href="/about">認識昊道</Link>
            <Link href="/learning">學習地圖</Link>
            <Link href="/events">課程與活動</Link>
          </div>
          <div>
            <p>參與</p>
            <Link href="/community">共學與陪伴</Link>
            <Link href="/welfare">公益與服務</Link>
            <Link href="/fazhou">昊道法舟</Link>
          </div>
          <div>
            <p>社群</p>
            {socialLinks.map((link) => (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.ariaLabel}
                key={link.label}
              >
                {link.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© 2026 昊道文化 · MVP CONCEPT</span>
        <span>隱私權政策 · 此網站為架構與視覺展示</span>
      </div>
    </footer>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}) {
  return (
    <section className="inner-hero">
      <div
        className="inner-hero-image"
        style={{ backgroundImage: `url("${assetUrl(image)}")` }}
      />
      <div className="inner-hero-wash" />
      <div className="inner-hero-copy">
        <p className="eyebrow light">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
