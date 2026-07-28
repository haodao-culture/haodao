import Link from "next/link";
import { PageHero, SiteFooter, SiteHeader } from "../components/SiteChrome";
import { assetUrl } from "../lib/assets";

const points = [
  ["taipei", "台北共學點", "台北市", "每月第二、四週", "/images/community-taipei.webp"],
  ["taichung", "台中共學點", "台中市", "每月第一、三週", "/images/community-taichung.webp"],
  ["kaohsiung", "高雄共學點", "高雄市", "每月第二週", "/images/community-kaohsiung.webp"],
];

export default function CommunityPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="COMMUNITY & COMPANIONSHIP · 共學與陪伴"
        title="學習，不必獨自前行。"
        description="在固定相聚與真誠分享中，讓每次練習不只停留在課堂。"
        image="/images/community-hero.webp"
      />
      <section className="community-purpose section">
        <div className="section-label"><span>01</span><p>共學的用意</p></div>
        <div>
          <p className="eyebrow">WHY COMMUNITY</p>
          <h2>有一個地方，可以反覆回來。</h2>
          <p>
            共學點是生活裡持續練習、分享與陪伴的所在。
            有人傾聽、有人同行，讓理解能在真實的關係中慢慢生根。
          </p>
        </div>
      </section>
      <section className="locations-section section">
        <div className="section-heading">
          <div><p className="eyebrow">LOCAL COMMUNITY</p><h2>各地共學點</h2></div>
          <p>點擊共學點，查看時間、地點、聯絡方式與加入方法。</p>
        </div>
        <div className="point-grid">
          {points.map(([slug, name, region, time, image]) => (
            <article key={slug}>
              <img src={assetUrl(image)} alt={`${name}的自然意象`} />
              <div><span>{region}</span><h3>{name}</h3><p>{time}</p>
                <Link href={`/community/${slug}`}>查看共學點詳情 →</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="activities-section section-dark" id="activities">
        <div className="section-heading light-heading">
          <div><p className="eyebrow light">UPCOMING COMMUNITY EVENTS</p><h2>近期共學活動</h2></div>
          <p>部分活動為線上進行，不受所在地區限制。</p>
        </div>
        <div className="community-activity-card">
          <img src={assetUrl("/images/community-activity.webp")} alt="象徵共學陪伴的自然景色" />
          <div><span>線上 · 台北共學點</span><h3>每月線上共學夜</h3>
            <p>08.28 · 週五 19:30 · Google Meet</p>
            <Link href="/events">查看活動與報名方式 →</Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
