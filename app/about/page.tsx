import Link from "next/link";
import { PageHero, SiteFooter, SiteHeader } from "../components/SiteChrome";

const beliefs = [
  ["01", "覺察", "從看見自己開始，不批判此刻的狀態，也不急著成為另一個人。"],
  ["02", "實踐", "讓理解回到日常，在每一段關係與選擇中持續練習。"],
  ["03", "同行", "學習不必獨自前進，在真誠的共學中互相支持與提醒。"],
  ["04", "服務", "把內在的改變化為善意，回應社會與身邊真實的需要。"],
];

export default function AboutPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="ABOUT HAODAO · 認識昊道"
        title="一條把理解化為實踐的路。"
        description="認識昊道文化的成立緣起、核心理念、願景與公益定位。"
        image="/images/calligraphy.jpg"
      />
      <section className="story-section section">
        <div className="section-label"><span>01</span><p>成立緣起</p></div>
        <div>
          <p className="eyebrow">OUR BEGINNING</p>
          <h2>從生命的提問開始，<br />在生活裡尋找答案。</h2>
          <p>
            昊道文化由一群願意持續學習、服務與分享的生命志工共同建立。
            我們關心的不只是知識，而是人如何在真實生活裡理解自己、
            鬆開慣性，並把智慧活出來。
          </p>
          <p>
            因此，我們透過課程、共學、文化內容與公益行動，創造能夠安心探索、
            真誠相遇及持續實踐的空間。
          </p>
        </div>
      </section>
      <section className="belief-section section-dark">
        <div className="section-heading light-heading">
          <div><p className="eyebrow light">CORE BELIEFS</p><h2>我們相信的四件事。</h2></div>
          <p>理念不是口號，而是每一次學習、陪伴與行動的共同起點。</p>
        </div>
        <div className="belief-grid">
          {beliefs.map(([number, title, text]) => (
            <article key={title}><span>{number}</span><h3>{title}</h3><p>{text}</p></article>
          ))}
        </div>
      </section>
      <section className="vision-section section">
        <div>
          <p className="eyebrow">VISION & IMPACT</p>
          <h2>讓每個人的清明，<br />成為社會溫柔的力量。</h2>
        </div>
        <div className="vision-copy">
          <h3>願景</h3>
          <p>讓覺察、理解與智慧成為人人都能親近並實踐的生活文化。</p>
          <h3>公益定位</h3>
          <p>以純公益精神推動生命教育、文化分享與社會關懷，讓資源走向真正需要的地方。</p>
          <h3>希望帶來的影響</h3>
          <p>當一個人更安定、更自由地選擇，他也能把理解與善意帶進家庭、關係與社會。</p>
        </div>
      </section>
      <section className="page-next">
        <p>認識之後，找到適合自己的開始。</p>
        <Link className="button warm" href="/learning">前往學習地圖 →</Link>
      </section>
      <SiteFooter />
    </main>
  );
}

