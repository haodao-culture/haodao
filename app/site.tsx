"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type PageKey = "home" | "about" | "learning" | "courses" | "community" | "fazhou";
type EventItem = {
  title: string; start: string; end?: string; time: string; place: string;
  audience: string; excerpt: string; register: string; poster: string;
  format: "線上" | "線下實體"; region?: string;
};

const taipeiToday = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return `${value.year}-${value.month}-${value.day}`;
};
const thumb = (id: string) => `https://drive.google.com/thumbnail?id=${id}&sz=w1600`;
const gallery = [
  { id: "1eiIpLHY97z_h8G1J9VyKi19VWgmysPLH", alt: "昊道課程大合照" },
  { id: "1EBkje_9w3_f4fRHRdQ7l8HZP5eSPB88A", alt: "昊道課程團體合照" },
  { id: "1f5yi8KFJqwUdVB9ZVUziPwNSJqftITFm", alt: "北門昊道書院課程場佈" },
  { id: "1_wnbW_IjcFrVviS01PVKf4hT13nczQ3r", alt: "書院課程空間與布景" },
  { id: "1sC0g_RfNc7GUaylUtRy17loy490LioOo", alt: "團體共修互動全景" },
  { id: "1F5SBZ8rhVbw_b024ZMmUCvyaJv5NIZdx", alt: "共修夥伴團體活動" },
  { id: "1EkdIYv4JXXpGHY1wssqzGJVeGOZs9Kvp", alt: "無我茶會空間紀錄" },
  { id: "1y1QbAUsLYNaui3J8KqKtbxnzLzMOyKL0", alt: "茶會共學互動畫面" },
  { id: "1pfiz9eulGCErZ9DKSteWMC9cjNIFHJ6n", alt: "書院茶席與場景" },
  { id: "1rZheg1x7hXiN2PkILa5Tvqb8iIDDm7Lk", alt: "戶外共學活動紀錄" },
];

const courses: EventItem[] = [
  { title:"生命教育課程系列｜一階課程・生命再前進", start:"2026-07-17", end:"2026-07-19", time:"09:00–17:00", place:"台南北門昊道書院", audience:"不拘，任何想要生命成長的夥伴", excerpt:"給自己一次生命的深呼吸，全然投入三天課程的體驗，探索、經歷、體悟，讓所學真正回到日常生活。", register:"https://forms.gle/PeufZTKnppMCHr659", poster:thumb("1Dps-NUWkQfAnDGMQqvR1xypKG76v3ipB"), format:"線下實體" },
  { title:"靜心大共修", start:"2026-08-15", time:"09:00–16:30", place:"北門昊道書院", audience:"昊道文化生命教育群組成員", excerpt:"在靜默中聆聽內心的聲音，與志同道合的夥伴一同在光影與墨香中，共創一段覺醒的時光。", register:"https://forms.gle/KDJToYoVxn9YdrnKA", poster:thumb("1HxKYuDSUQo3UG5a01TJFk08K_y_evB10"), format:"線下實體" },
  { title:"全台聯合線上大共修｜打開覺察，處處是明師", start:"2026-09-01", time:"20:00–21:30", place:"線上 Google Meet", audience:"不拘，任何想要生命成長的夥伴", excerpt:"透過每一個發生反觀自照，便會發現：生活中的每一個發生，都在教會我們什麼。", register:"#", poster:thumb("1NOwRqnyii9Vy1vcrcIwXcMF8hF4qeMlG"), format:"線上" },
  { title:"生命教育課程系列｜二階課程・乘法風揚升", start:"2026-09-25", end:"2026-09-27", time:"09:00–17:00", place:"走馬瀨農場・蘭花會議廳", audience:"上過完整一階課程的夥伴", excerpt:"從知道道理，到活出道理；從認識自己，到超越自己。走入生命的真修實煉。", register:"https://docs.google.com/forms/d/e/1FAIpQLSddXNPrlaflz4EC8AvF0iopSaCyLuiOYh7lWAlYOjlQctaUCw/viewform", poster:thumb("1VfnaX1CWOxYG2LZG1RSYZSeISIoToNX6"), format:"線下實體" },
  { title:"靜心大共修", start:"2026-10-21", time:"09:00 起", place:"北門昊道書院", audience:"不拘，任何想要生命成長的夥伴", excerpt:"停下匆忙的腳步，回到內在，與自己展開一場深度對話。", register:"#", poster:thumb("1JHp-C61EVTGDOF4zuvoBMWTOrvlXwdUA"), format:"線下實體" },
  { title:"生命教育課程系列｜一階課程・生命再前進", start:"2026-12-08", end:"2026-12-10", time:"09:00–17:00", place:"走馬瀨農場・蘭花會議廳", audience:"不拘，任何想要生命成長的夥伴", excerpt:"一個更高維、更美好的自己，正在等著你的改變與到達。", register:"https://haodao3344.wixsite.com/haodao/december", poster:thumb("16kBBXsaqjMu0UAgrL9n2pOGwZMBcfARd"), format:"線下實體" },
];

const community: EventItem[] = [
  { title:"高屏區讀書會｜修行文明・語言模組", start:"2026-06-17", time:"19:30–21:30", place:"覺悟行證共修點・高雄", audience:"不拘", excerpt:"覺察語言模組如何影響我們解讀周遭的發生。", register:"#", poster:thumb("16jdqzjSAv4AT8eaF7X46r_RPMeSTGXyO"), format:"線下實體", region:"高屏區" },
  { title:"中區讀書會｜修行文明", start:"2026-06-27", time:"13:50–16:00", place:"妙智共修點・台中", audience:"不拘", excerpt:"語言不只是溝通工具，更是塑造人生的力量。", register:"#", poster:thumb("1IntlfVKgv770vfn_lITeobNHixVsNLyV"), format:"線下實體", region:"中區" },
  { title:"北區讀書會｜世界，由你的語言築成", start:"2026-06-28", time:"13:50–16:00", place:"厚德共修點・台北", audience:"不拘", excerpt:"你怎麼說，就怎麼想，就怎麼活。", register:"#", poster:thumb("1e-oih5_zjpvTLZXB9KXbOcVLSOsbVPMV"), format:"線下實體", region:"北區" },
  { title:"嘉南區讀書會｜觀呼吸到證悟之路徑", start:"2026-07-01", time:"19:30–21:30", place:"觀自在共修點・台南", audience:"限上過一階課程夥伴", excerpt:"透過觀呼吸培養穩定覺知，回歸本自具足的覺性。", register:"#", poster:thumb("1cbhI5P6gEatmMbBaIpURuX_5JQp-pPrx"), format:"線下實體", region:"嘉南區" },
  { title:"高屏區讀書會｜心靈慧談研磨", start:"2026-07-08", time:"19:30–21:30", place:"覺悟行證共修點・高雄", audience:"不拘", excerpt:"褪去浮華、沉澱雜質，於靜謐中淬煉出智慧的光芒。", register:"#", poster:thumb("1l7zO1YGxjy3fuuIbKjkXMce_WAAqtwU4"), format:"線下實體", region:"高屏區" },
  { title:"高屏讀書會｜一階課後心得流淌", start:"2026-07-22", time:"19:30–21:30", place:"覺悟行證共修點・高雄", audience:"不拘", excerpt:"讓課堂中被喚醒的覺察與感動，滋養日常的每一步。", register:"#", poster:thumb("1IK1jrqqQMXmD6N4O89Eg4K5lW1notzk7"), format:"線下實體", region:"高屏區" },
  { title:"嘉南區讀書會｜一階課後心得流淌", start:"2026-08-29", time:"19:30–21:30", place:"心燈長明共修點・台南", audience:"不拘", excerpt:"跨越一階的門檻，心靈的泉水開始悄然流淌。", register:"#", poster:thumb("1hsNkzmvcmbE9oIzVBbM_jrxITT1gp4m7"), format:"線下實體", region:"嘉南區" },
];

const nav = [
  { label:"關於昊道", href:"/about" },
  { label:"學習地圖", href:"/learning", children:[["學習地圖介紹","/learning#intro"],["學習地圖","/learning#map"],["課程介紹","/learning#paths"]] },
  { label:"課程與活動", href:"/courses", children:[["課程與活動介紹","/courses#intro"],["近期課程與活動","/courses#upcoming"],["歷史回顧","/courses#history"]] },
  { label:"各地共修與陪伴", href:"/community", children:[["共修與陪伴介紹","/community#intro"],["近期共修活動","/community#upcoming"],["歷史回顧","/community#history"]] },
  { label:"昊道法舟數位館", href:"/fazhou" },
];

const socials = [
  ["LINE","/assets/LINE_APP_Android.png","https://lin.ee/VJrd0i3"],
  ["Facebook","/assets/facebook_logo.png","https://www.facebook.com/profile.php?id=100063957733524"],
  ["Instagram","/assets/Instagram_Glyph_Gradient.png","https://www.instagram.com/haodao_culture"],
  ["Threads","/assets/threads.png","https://www.threads.com/@haodao_culture"],
];

function Header() {
  const [open,setOpen] = useState(false);
  return <header className="header">
    <Link className="brand" href="/"><span className="brand-cn">昊道文化</span><span>HAODAO Culture</span></Link>
    <button className="menu-btn" onClick={()=>setOpen(!open)} aria-label="開啟選單">{open?"×":"☰"}</button>
    <nav className={open ? "nav open" : "nav"}>{nav.map(item=><div className="nav-item" key={item.href}>
      <a href={item.href}>{item.label}</a>
      {item.children && <div className="dropdown">{item.children.map(([label,href])=><a key={href} href={href}>{label}<span>↗</span></a>)}</div>}
    </div>)}<button className="search" aria-label="全站搜尋">⌕</button></nav>
  </header>
}

function Footer() {
  return <footer className="footer ink-dark"><img className="ink-bg ink-white" src="/assets/haodao-white.png" alt="" />
    <div><Link className="footer-brand" href="/">昊道文化<br/><span>HAODAO Culture</span></Link><p>陪伴生命成長，提升內心文明，<br/>走向光明與覺醒。</p></div>
    <div className="footer-links">{nav.map(n=><a href={n.href} key={n.href}>{n.label}</a>)}</div>
    <div><p className="eyebrow">CONTACT</p><div className="social-row">{socials.map(([n,img,url])=><a href={url} key={n} target="_blank" rel="noreferrer"><img src={img} alt={n}/></a>)}</div><p className="legal">隱私權政策　版權聲明<br/>© 2026 HAODAO Culture</p></div>
  </footer>
}

function FloatingSocial() { return <aside className="floating">{socials.map(([n,img,url])=><a href={url} key={n} target="_blank" rel="noreferrer"><img src={img} alt={n}/></a>)}</aside> }

function ReviewNotes() {
  const [open,setOpen]=useState(false);
  const [note,setNote]=useState("");
  const [saved,setSaved]=useState(false);
  const key=typeof window!=="undefined"?`haodao-review:${window.location.pathname}`:"haodao-review";
  useEffect(()=>{
    const frame=requestAnimationFrame(()=>setNote(localStorage.getItem(key)||""));
    return ()=>cancelAnimationFrame(frame);
  },[key]);
  const save=()=>{localStorage.setItem(key,note);setSaved(true);setTimeout(()=>setSaved(false),1600)};
  const copy=async()=>{await navigator.clipboard.writeText(`頁面：${window.location.pathname}\n\n${note}`);setSaved(true);setTimeout(()=>setSaved(false),1600)};
  return <aside className={open?"review-panel open":"review-panel"}>
    <button className="review-tab" onClick={()=>setOpen(!open)} aria-label="開啟頁面修改備註">✎<span>修改備註</span></button>
    <div className="review-body"><div className="review-head"><div><small>PAGE REVIEW</small><h3>這一頁要調整什麼？</h3></div><button onClick={()=>setOpen(false)} aria-label="關閉備註">×</button></div>
      <p>備註會依頁面保存在您的瀏覽器。完成後按「複製備註」，直接貼回對話給我。</p>
      <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="例如：首頁第一張照片換成場佈照；標題再縮小一點……" />
      <div className="review-actions"><button onClick={save}>{saved?"已完成":"儲存備註"}</button><button onClick={copy}>複製備註</button></div>
    </div>
  </aside>
}

function Shell({children}:{children:React.ReactNode}) { return <><Header/>{children}<Footer/><FloatingSocial/><ReviewNotes/></> }

function EventCards({items}:{items:EventItem[]}) {
  return <div className="event-grid">{items.map((e,i)=><article className="event-card" key={e.title+e.start}>
    <div className="poster"><img src={e.poster} alt={e.title+"海報"} /><span>{String(i+1).padStart(2,"0")}</span></div>
    <div className="event-body"><p className="eyebrow">{e.region || e.format}</p><h3>{e.title}</h3><p className="event-meta">{e.start}{e.end? ` — ${e.end}`:""}　{e.time}<br/>{e.place}</p><p>{e.excerpt}</p><a className="text-link" href={e.register}>查看活動／報名 <span>↗</span></a></div>
  </article>)}</div>
}

function Home() {
  return <Shell><main>
    <section className="hero ink-dark"><img className="ink-bg ink-white hero-ink" src="/assets/haodao-white.png" alt="" />
      <div className="hero-copy"><p className="eyebrow">HAODAO CULTURE · TAIWAN</p><h1>由生活走向生命，<br/>由生命走向覺醒。</h1><p>以聖賢智慧與心智教育為入口，陪伴每一個生命，在生活中明理、在覺察中照見、在修煉中轉化。</p><a className="round-link" href="/about">認識昊道 <span>↗</span></a></div>
      <div className="hero-photo"><img src={thumb(gallery[2].id)} alt={gallery[2].alt}/><span className="vertical">明理 · 照見 · 轉化 · 愿行</span></div>
    </section>
    <section className="statement ink-light"><img className="ink-bg ink-black" src="/assets/haodao-black.png" alt="" /><p className="eyebrow">OUR BELIEF</p><h2>陪伴生命成長，<br/>提升內心文明。</h2><p>真正的成長，不是離開生活，而是在每一次關係、困境與選擇中，看見自己，也成為別人的好環境。</p></section>
    <section className="photo-strip">{[gallery[0],gallery[6],gallery[2],gallery[8]].map((g,i)=><figure key={g.id} className={i===1?"tall":""}><img src={thumb(g.id)} alt={g.alt}/></figure>)}</section>
    <section className="index-section"><div className="section-head"><p className="eyebrow">EXPLORE HAODAO</p><h2>從此刻，走進生命的學習</h2></div><div className="index-grid">{nav.map((n,i)=><a href={n.href} key={n.href}><span>0{i+1}</span><h3>{n.label}</h3><b>View More　↗</b></a>)}</div></section>
  </main></Shell>
}

const aboutBlocks = [
  ["從生活中的真實課題開始","生命的成長，不是從遙遠的地方開始，而是從每天的生活開始。家庭、關係、工作與情緒，都是照見自己的鏡子。當我們學會停下來、看見念頭與反應，便有機會不再被慣性推著走。"],
  ["以聖賢智慧與心智教育，打開生命的看見","昊道文化以生活化、白話化的方式，引導人們看見想法背後的心智模式、情緒背後的生命狀態。所重視的不只是知道多少道理，而是能否活得更清明、柔軟與成熟。"],
  ["以共學、共修與生命陪伴，支持持續成長","成長需要陪伴，也需要一個能持續支持自己的環境。透過課程、共學交流、生命分享與線上線下陪伴，讓修煉回到每一天的行住坐臥。"],
  ["以覺察、靜心與修煉實踐，讓生命真正轉化","從覺察開始，走向覺知；從覺知深入，慢慢走向覺悟；再把所覺悟的落實在生活與行動中，成為真正能活出來的生命力量。"],
  ["以志工公益服務，讓生命在愿行中發光","志工不只是幫忙做事的人，而是在服務中修心、在承擔中成長、在陪伴他人時照見自己的人。當生命陪伴生命，愛便有了落地的道路。"],
];
function About(){
 return <Shell><main><PageHero en="ABOUT HAODAO" title="關於昊道" image={gallery[0]}/>
  <section className="manifesto ink-light"><img className="ink-bg ink-black" src="/assets/haodao-black.png" alt=""/><p className="eyebrow">STATEMENT</p><h2>昊道文化，是一個陪伴生命成長、提升內心文明，並走向光明與覺醒的純公益文化平台。</h2><p>我們透過課程、共學交流、生命陪伴、覺察、靜心、修煉實踐與志工公益服務，陪伴人們由生活走向生命，由生命走向覺醒。</p></section>
  <section className="numbered">{aboutBlocks.map((b,i)=><article key={b[0]}><span>{String(i+1).padStart(2,"0")}</span><div><h3>{b[0]}</h3><p>{b[1]}</p></div></article>)}</section>
  <section className="wide-quote ink-dark"><img className="ink-bg ink-white" src="/assets/haodao-white.png" alt=""/><img src={thumb(gallery[1].id)} alt={gallery[1].alt}/><blockquote>在生活中明理，<br/>在關係中照見，<br/>在困境中修煉，<br/>在服務中發光。</blockquote></section>
 </main></Shell>
}

function PageHero({en,title,image}:{en:string,title:string,image:{id:string,alt:string}}){
 return <section className="page-hero ink-dark"><div><p className="eyebrow">{en}</p><h1>{title}</h1><p>HAODAO Culture</p></div><img src={thumb(image.id)} alt={image.alt}/></section>
}

const learningSteps=[["各地共學","從每週共學開始，在穩定的學習環境中閱讀經典、交流分享，讓修學融入日常。"],["各類理法課程","學習生命成長、心性修養、智慧思維與處世之道，建立正確觀念。"],["修煉課程","透過觀照、覺察、反思與實踐，讓知道真正成為做到。"],["修煉營陪伴","在團體共修與陪伴中，深化內在覺察與轉化，累積真實修煉體驗。"],["志工服務","以服務作為修行，以承擔作為成長，在付出中照見自己也成就他人。"]];
function Learning(){
 return <Shell><main><PageHero en="LEARNING MAP" title="在昊道文化，你可以學習什麼？" image={gallery[4]}/>
  <section id="intro" className="intro-two ink-light"><img className="ink-bg ink-black" src="/assets/haodao-black.png" alt=""/><p className="eyebrow">A PATH OF PRACTICE</p><div><h2>讓所學真正落實於生活，<br/>從理解、體會，到活出生命的改變。</h2><p>透過理法、修煉與志工服務三個面向，循序培養覺察力、心性修養與生命智慧。</p></div></section>
  <section id="map" className="learning-map"><div className="map-core"><span>生命成長</span><b>覺察 · 轉化 · 愿行</b></div>{learningSteps.map((s,i)=><article key={s[0]}><span>0{i+1}</span><h3>{s[0]}</h3><p>{s[1]}</p></article>)}</section>
  <section id="paths" className="photo-marquee">{[gallery[3],gallery[7],gallery[4],gallery[9]].map(g=><img key={g.id} src={thumb(g.id)} alt={g.alt}/>)}</section>
 </main></Shell>
}

function Courses(){
 const [filter,setFilter]=useState("全部");
 const today=taipeiToday();
 const upcoming=useMemo(()=>courses.filter(e=>e.end ? e.end>=today : e.start>=today),[today]);
 const history=useMemo(()=>courses.filter(e=>(e.end||e.start)<today),[today]);
 const shown=upcoming.filter(e=>filter==="全部" || (filter==="線上"?e.format==="線上":e.format==="線下實體"));
 return <Shell><main><PageHero en="COURSES & EVENTS" title="課程與活動" image={gallery[3]}/>
  <section id="intro" className="intro-two ink-light"><img className="ink-bg ink-black" src="/assets/haodao-black.png" alt=""/><p className="eyebrow">LEARN · PRACTICE · GROW</p><div><h2>每一場課程，<br/>都是一次與自己相遇的開始。</h2><p>從認識自己、覺察自己，到修煉自己，將所學真正落實於生活之中。</p></div></section>
  <section id="upcoming" className="events-section"><div className="section-head row"><div><p className="eyebrow">UPCOMING</p><h2>近期課程與活動</h2></div><div className="filters">{["全部","線下","線上"].map(f=><button className={filter===f?"active":""} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div></div><EventCards items={shown}/></section>
  <section id="history" className="events-section history"><div className="section-head"><p className="eyebrow">ARCHIVE</p><h2>近年歷史回顧</h2></div><EventCards items={history}/></section>
 </main></Shell>
}

function Community(){
 const [filter,setFilter]=useState("全部");
 const today=taipeiToday();
 const upcoming=community.filter(e=>e.start>=today);
 const history=community.filter(e=>e.start<today);
 const pick=(xs:EventItem[])=>xs.filter(e=>filter==="全部"||e.region===filter);
 return <Shell><main><PageHero en="COMMUNITY & COMPANIONSHIP" title="各地共修與陪伴" image={gallery[5]}/>
  <section id="intro" className="manifesto ink-light"><img className="ink-bg ink-black" src="/assets/haodao-black.png" alt=""/><p className="eyebrow">WALK TOGETHER</p><h2>一個人，可以走得快；<br/>一群人，可以走得遠。</h2><p>在共修中同行，在陪伴中成長，在生活中實踐。沒有比較與競爭，而是彼此支持、提醒與成就。</p></section>
  <section id="upcoming" className="events-section"><div className="section-head row"><div><p className="eyebrow">UPCOMING</p><h2>近期共修活動</h2></div><div className="filters">{["全部","北區","中區","嘉南區","高屏區"].map(f=><button className={filter===f?"active":""} onClick={()=>setFilter(f)} key={f}>{f}</button>)}</div></div><EventCards items={pick(upcoming)}/></section>
  <section id="history" className="events-section history"><div className="section-head"><p className="eyebrow">ARCHIVE</p><h2>共修活動歷史回顧</h2></div><EventCards items={pick(history)}/></section>
 </main></Shell>
}

function Fazhou(){
 const halls=["書法展廳","書法法舟","心靈慧談法舟","理法法舟","音樂法舟","書院法舟"];
 return <Shell><main><section className="fazhou-hero ink-dark"><img className="ink-bg ink-white" src="/assets/haodao-white.png" alt=""/><p className="eyebrow">HAODAO FAZHOU DIGITAL MUSEUM</p><h1>昊道法舟<br/>數位館</h1><p>共同展開觀看、閱讀、修習、聆聽與空間行旅。</p></section><section className="halls">{halls.map((h,i)=><a target="_blank" rel="noreferrer" href="https://calligraphy-gallery-curation.k1l2p3k1l2p3.chatgpt.site/#scroll" key={h}><span>0{i+1}</span><h2>{h}</h2><b>進入展館 ↗</b></a>)}</section></main></Shell>
}

export default function SitePage({page}:{page:PageKey}) {
 return page==="home"?<Home/>:page==="about"?<About/>:page==="learning"?<Learning/>:page==="courses"?<Courses/>:page==="community"?<Community/>:<Fazhou/>;
}
