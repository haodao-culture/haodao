import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import { assetUrl } from "./lib/assets";

const previews = [
  {
    number: "01",
    eyebrow: "ABOUT HAODAO",
    title: "認識昊道",
    text: "從成立緣起、核心理念與公益定位，理解昊道文化希望帶來的影響。",
    href: "/about",
    image: "/images/about-hero.webp",
  },
  {
    number: "02",
    eyebrow: "LEARNING MAP",
    title: "學習地圖",
    text: "從共學會開始，找到此刻適合自己的學習入口與下一步。",
    href: "/learning",
    image: "/images/learning-hero.webp",
  },
  {
    number: "03",
    eyebrow: "COURSES & EVENTS",
    title: "課程與活動",
    text: "查看目前進行中的線上與線下活動、行事曆及歷史紀錄。",
    href: "/events",
    image: "/images/events-hero.webp",
  },
  {
    number: "04",
    eyebrow: "COMMUNITY",
    title: "共學與陪伴",
    text: "尋找各地共學點、近期共學活動，與同行的夥伴保持連結。",
    href: "/community",
    image: "/images/community-hero.webp",
  },
  {
    number: "05",
    eyebrow: "PUBLIC WELFARE",
    title: "公益與服務",
    text: "看見志工服務、文化推廣、社會關懷與正在發生的公益行動。",
    href: "/welfare",
    image: "/images/welfare-impact.webp",
  },
  {
    number: "06",
    eyebrow: "HAODAO FAZHOU",
    title: "昊道法舟",
    text: "在書法、音樂與心靈慧談之間，留一段安靜的時間與自己相遇。",
    href: "/fazhou",
    image: "/images/fazhou-calligraphy.webp",
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />
      <section className="home-art-hero">
        <img
          src={assetUrl("/home-hero.png")}
          alt="昊道文化，在覺察裡，走回生命的從容。山林中的晨光小徑。"
        />
        <div className="home-art-actions">
          <Link className="button primary" href="/learning">探索學習地圖</Link>
          <Link className="button art-outline" href="/events">查看課程與活動</Link>
        </div>
      </section>

      <section className="home-intro">
        <p className="eyebrow">HAODAO CULTURE</p>
        <div>
          <h2>一條把理解化為實踐，<br />把善意帶進生活的路。</h2>
          <p>
            昊道文化相信，每個人都擁有回到內在安定的能力。
            我們以平實、可實踐的學習方式，陪伴人們培養覺察、
            理解生命，並在共學與公益行動中彼此支持。
          </p>
        </div>
      </section>

      <section className="home-preview-list" aria-label="網站主要內容">
        {previews.map((item, index) => (
          <article className="home-preview-card" key={item.href}>
            <div className="home-preview-image">
              <img src={assetUrl(item.image)} alt="" />
            </div>
            <div className="home-preview-copy">
              <span>{item.number}</span>
              <p className="eyebrow">{item.eyebrow}</p>
              <h2>{item.title}</h2>
              <p>{item.text}</p>
              <Link href={item.href}>進入完整頁面 →</Link>
            </div>
            <span className="home-preview-order">{String(index + 1).padStart(2, "0")}</span>
          </article>
        ))}
      </section>

      <section className="home-final-cta">
        <p className="eyebrow light">BEGIN YOUR JOURNEY</p>
        <h2>每一步，都從此刻的你開始。</h2>
        <div>
          <Link className="button warm" href="/learning">探索核心學習路徑</Link>
          <Link className="button ghost" href="/events">查看課程與活動</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
