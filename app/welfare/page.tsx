import Link from "next/link";
import { PageHero, SiteFooter, SiteHeader } from "../components/SiteChrome";
import { assetUrl } from "../lib/assets";

const services = [
  ["01", "志工服務", "讓每一份專長與時間，都能成為溫柔而具體的支持。", "/images/welfare-service.webp"],
  ["02", "文化推廣", "以課程、藝術與分享，讓覺察成為人人可親近的生活文化。", "/images/welfare-culture.webp"],
  ["03", "社會關懷", "走進需要陪伴的地方，讓理解與尊重成為關係的起點。", "/images/welfare-care.webp"],
];

export default function WelfarePage() {
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="PUBLIC WELFARE · 公益與服務" title="讓內在的改變，成為照亮他人的行動。" description="以志工服務、文化推廣與社會關懷，回應真實的社會需要。" image="/images/welfare-impact.webp" />
      <section className="welfare-intro section">
        <div className="section-label"><span>01</span><p>公益理念</p></div>
        <div><p className="eyebrow">WHY WE SERVE</p><h2>服務不是付出自己，<br />而是讓理解開始流動。</h2><p>我們相信，個人的成長終究會走向關係與社會。當內在更安定，便有能力看見他人的需要，並用適合的方式回應。</p></div>
      </section>
      <section className="service section">
        <div className="section-heading"><div><p className="eyebrow">SERVICE AREAS</p><h2>服務領域</h2></div><p>從每一個可以做到的小地方開始。</p></div>
        <div className="service-grid">
          {services.map(([number, title, text, image]) => <article key={title}><span>{number}</span><img src={assetUrl(image)} alt="" /><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>
      <section className="impact-story">
        <img src={assetUrl("/images/welfare-impact.webp")} alt="志工研習與公益活動分享現場" />
        <div><p className="eyebrow light">OUR ACTION</p><h2>公益行動紀錄</h2><p>從生命教育分享、文化活動到社區陪伴，每一次行動都留下可被延續的連結。</p><a className="button warm" href="#contact">了解如何參與</a></div>
      </section>
      <section className="page-next"><p>從學習開始，也可以走向服務。</p><Link className="button warm" href="/learning">查看學習地圖 →</Link></section>
      <SiteFooter />
    </main>
  );
}
