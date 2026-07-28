import { PageHero, SiteFooter, SiteHeader } from "../components/SiteChrome";

const fazhouUrl = "https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/haodao";

export default function FazhouPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero eyebrow="HAODAO FAZHOU · 昊道法舟" title="以文化為舟，渡向心中的清明。" description="在一筆一畫、一音一念之間，留一段安靜的時間與自己相遇。" image="/images/fazhou-calligraphy.webp" />
      <section className="fazhou-intro section">
        <div className="section-label"><span>01</span><p>法舟簡介</p></div>
        <div><p className="eyebrow">A VESSEL OF CULTURE</p><h2>承載文化，也承載一段與自己相遇的時間。</h2><p>昊道法舟收藏書法、音樂與心靈慧談。它與學習課程不同，不要求按照順序前進，而是讓每個人依照當下的心境，自由停留與感受。</p></div>
      </section>
      <section className="fazhou-categories section-dark">
        <article><span>書</span><div><p className="eyebrow light">CALLIGRAPHY</p><h2>書法</h2><p>在筆墨的起落與留白之間，看見心的狀態。</p></div></article>
        <article><span>樂</span><div><p className="eyebrow light">MUSIC</p><h2>音樂</h2><p>讓聲音成為安住當下、回到內在的陪伴。</p></div></article>
        <article><span>談</span><div><p className="eyebrow light">WISDOM TALKS</p><h2>心靈慧談</h2><p>用生活的語言，分享能夠被實踐的理解。</p></div></article>
      </section>
      <section className="page-next"><p>完整內容收藏於獨立的昊道法舟網站。</p><a className="button warm" href={fazhouUrl} target="_blank" rel="noreferrer">進入昊道法舟 ↗</a></section>
      <SiteFooter />
    </main>
  );
}
