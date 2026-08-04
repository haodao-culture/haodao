export default function Home() {
  return (
    <main className="v2-holding-page">
      <section className="v2-holding-card" aria-labelledby="v2-title">
        <p className="eyebrow">HAODAO CULTURE · ARCHITECTURE V2</p>
        <span className="v2-holding-mark" aria-hidden="true"><span>昊</span></span>
        <h1 id="v2-title">新版官網架構建置中</h1>
        <p>
          這是昊道文化新版架構的獨立測試環境。接下來的設計與內容調整，
          將在這裡逐步完成並提供團隊預覽。
        </p>
        <div className="v2-holding-status">
          <span aria-hidden="true" />
          new2.haodao.org 已連線
        </div>
        <a className="button primary" href="https://new.haodao.org">
          查看目前版本
        </a>
      </section>
    </main>
  );
}
