"use client";

import Link from "next/link";
import { useState } from "react";
import { PageHero, SiteFooter, SiteHeader } from "../components/SiteChrome";

const items = [
  ["認識昊道", "/about", "認識昊道", "成立緣起、核心理念、願景與公益定位"],
  ["學習地圖", "/learning", "學習路徑", "共學會、覺察學習、服務與陪伴"],
  ["共學會", "/learning/community", "學習路徑", "第一階段的詳細介紹、適合對象與參與方式"],
  ["課程與活動", "/events", "課程／活動", "進行中、行事曆與歷史活動"],
  ["共學與陪伴", "/community", "共學點", "各地共學點與近期共學活動"],
  ["台北共學點", "/community/taipei", "共學點", "台北地區共學時間與聯絡方式"],
  ["台中共學點", "/community/taichung", "共學點", "台中地區共學時間與聯絡方式"],
  ["高雄共學點", "/community/kaohsiung", "共學點", "高雄地區共學時間與聯絡方式"],
  ["公益與服務", "/welfare", "公益與服務", "志工服務、文化推廣、社會關懷與公益行動"],
  ["昊道法舟", "/fazhou", "文化內容", "書法、音樂與心靈慧談"],
];

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const results = items.filter((item) => item.join(" ").toLowerCase().includes(query.trim().toLowerCase()));
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="SITE SEARCH · 全站搜尋" title="找到你正在尋找的內容。" description="搜尋學習路徑、課程、活動、共學點、公益與文化內容。" image="/images/learning-hero.webp" />
      <section className="search-page section">
        <label htmlFor="site-search">輸入關鍵字</label>
        <input id="site-search" autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="例如：共學、活動、公益" />
        <div className="search-page-results">
          {results.length ? results.map(([title, href, category, description]) => (
            <Link href={href} key={href}><span><small>{category}</small><strong>{title}</strong><p>{description}</p></span><span>→</span></Link>
          )) : <div className="search-empty"><h2>沒有找到符合的內容</h2><p>可以試試「學習地圖」、「課程與活動」或「共學點」。</p><Link href="/">返回首頁 →</Link></div>}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
