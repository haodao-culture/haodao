import Link from "next/link";
import { PageHero, SiteFooter, SiteHeader } from "../../components/SiteChrome";

export default function CommunityLearningPage() {
  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="LEARNING STAGE 01 · 共學會"
        title="在真誠的相遇裡，開始看見自己。"
        description="核心學習路徑的第一站：共學會。"
        image="/images/group-sharing.jpg"
      />
      <section className="detail-layout section">
        <aside>
          <p className="eyebrow">STAGE 01</p>
          <p>入門 · 相遇</p>
        </aside>
        <div>
          <h2>共學會是什麼？</h2>
          <p>
            共學會是一個安全、尊重且真誠的學習空間。透過主題引導、個人覺察、
            夥伴分享與生活練習，讓人慢慢看見自己的感受、反應與選擇。
          </p>
          <div className="detail-facts">
            <article><h3>我能得到什麼</h3><p>更理解自己、練習傾聽，也在同行中感受到支持。</p></article>
            <article><h3>適合對象</h3><p>第一次接觸昊道文化，或希望在生活裡持續練習的夥伴。</p></article>
            <article><h3>參與方式</h3><p>選擇鄰近的共學點，或參加近期線上與線下共學活動。</p></article>
          </div>
        </div>
      </section>
      <section className="dual-actions">
        <Link href="/community">尋找共學點 <span>→</span></Link>
        <Link href="/community#activities">查看近期共學活動 <span>→</span></Link>
      </section>
      <SiteFooter />
    </main>
  );
}

