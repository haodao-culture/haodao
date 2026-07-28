import Link from "next/link";
import { PageHero, SiteFooter, SiteHeader } from "../../components/SiteChrome";

const locations: Record<string, { name: string; region: string; time: string; image: string; intro: string }> = {
  taipei: { name: "台北共學點", region: "台北市", time: "每月第二、四週", image: "/images/group-sharing.jpg", intro: "在城市裡留一個可以安心分享、持續練習的空間。" },
  taichung: { name: "台中共學點", region: "台中市", time: "每月第一、三週", image: "/images/quiet-room.jpg", intro: "以穩定的相聚，陪伴彼此把覺察帶回日常。" },
  kaohsiung: { name: "高雄共學點", region: "高雄市", time: "每月第二週", image: "/images/garden-meditation.jpg", intro: "在南方溫暖的同行裡，分享生活，也聆聽自己。" },
};

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = locations[slug] || locations.taipei;
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow={`LOCAL COMMUNITY · ${location.region}`} title={location.name} description={location.intro} image={location.image} />
      <section className="detail-layout section">
        <aside><p className="eyebrow">MEETING INFO</p><p>{location.region}</p></aside>
        <div>
          <h2>共學點介紹</h2><p>{location.intro}共學內容會依當月主題安排，第一次參加也很適合。</p>
          <div className="detail-facts">
            <article><h3>共學時間</h3><p>{location.time}，實際日期請以聯絡通知為準。</p></article>
            <article><h3>地點與地圖</h3><p>{location.region}，報名後由主辦人提供完整地址與交通方式。</p></article>
            <article><h3>聯絡方式</h3><p>請先透過昊道文化官方社群取得最新共學資訊與聯絡方式。</p></article>
          </div>
          <div className="inline-actions"><a className="button primary" href="https://www.facebook.com/profile.php?id=100063957733524" target="_blank" rel="noopener noreferrer">前往官方 Facebook ↗</a><a className="button outline" href="https://www.instagram.com/haodao_culture" target="_blank" rel="noopener noreferrer">前往官方 Instagram ↗</a></div>
        </div>
      </section>
      <section className="page-next"><p>返回查看其他地區與近期活動。</p><Link className="button warm" href="/community">返回共學與陪伴 →</Link></section>
      <SiteFooter />
    </main>
  );
}
