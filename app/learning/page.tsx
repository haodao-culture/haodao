import Link from "next/link";
import { PageHero, SiteFooter, SiteHeader } from "../components/SiteChrome";

const stages = [
  {
    number: "01",
    kicker: "入門 · 相遇",
    title: "共學會",
    description: "在安全、真誠的空間裡，透過分享與練習，開始看見自己的內在。",
    gain: "建立覺察的起點，知道自己並不孤單。",
    href: "/learning/community",
    cta: "了解共學會",
  },
  {
    number: "02",
    kicker: "深化 · 練習",
    title: "覺察學習",
    description: "透過階段課程，辨認情緒、信念與關係中的慣性反應。",
    gain: "把理解轉為可以反覆練習的方法。",
    href: "/events",
    cta: "查看對應課程",
  },
  {
    number: "03",
    kicker: "實踐 · 同行",
    title: "服務與陪伴",
    description: "把學習帶入生活，透過共修與志願服務，讓善意持續流動。",
    gain: "在付出與同行中，讓所學成為生命的一部分。",
    href: "/welfare",
    cta: "看見公益行動",
  },
];

export default function LearningPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="LEARNING MAP · 學習地圖"
        title="每一步，都從此刻的你開始。"
        description="不需要預先成為更好的人。找到現在的位置，再選擇適合自己的下一步。"
        image="/images/learning-hero.webp"
      />
      <section className="learning-intro section">
        <div className="section-label"><span>01</span><p>如何使用學習地圖</p></div>
        <div>
          <p className="eyebrow">YOUR LEARNING JOURNEY</p>
          <h2>這不是一條必須趕路的階梯。</h2>
          <p>
            每一個階段都可以停留、反覆練習，也可以依照當下的需要重新開始。
            點進每個路站，可以看見詳細介紹、能獲得什麼、適合對象與參與方式。
          </p>
        </div>
      </section>
      <section className="journey-page section-dark">
        <p className="eyebrow light">核心學習路徑 · CORE LEARNING PATH</p>
        <div className="journey-line" aria-hidden="true" />
        <div className="journey-stages">
          {stages.map((stage) => (
            <article key={stage.number}>
              <span className="journey-number">{stage.number}</span>
              <p className="path-kicker">{stage.kicker}</p>
              <h2>{stage.title}</h2>
              <p>{stage.description}</p>
              <div><small>我能得到什麼</small><p>{stage.gain}</p></div>
              <Link href={stage.href}>{stage.cta} →</Link>
            </article>
          ))}
        </div>
      </section>
      <section className="page-next">
        <p>想先看看目前有哪些活動？</p>
        <Link className="button warm" href="/events">查看課程與活動 →</Link>
      </section>
      <SiteFooter />
    </main>
  );
}
