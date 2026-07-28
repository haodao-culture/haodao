"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { PageHero, SiteFooter, SiteHeader } from "../components/SiteChrome";
import {
  EventItem,
  formatEventDate,
  isPastEvent,
  parseEvents,
  sheetCsvUrl,
} from "../lib/events";

const filters = ["全部", "線上", "線下"];

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [filter, setFilter] = useState("全部");
  const [view, setView] = useState<"current" | "calendar" | "past">("current");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    setSelectedId(new URLSearchParams(window.location.search).get("event") || "");
    const controller = new AbortController();
    fetch(sheetCsvUrl, { cache: "no-store", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("活動資料載入失敗");
        return response.text();
      })
      .then((text) => {
        setEvents(parseEvents(text));
        setError(false);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  const visibleEvents = useMemo(() => {
    return events
      .filter((event) => (view === "past" ? isPastEvent(event) : !isPastEvent(event)))
      .filter((event) => {
        if (filter === "全部" || view === "calendar") return true;
        const online = /線上|meet|zoom/i.test(`${event.format} ${event.location}`);
        return filter === "線上" ? online : !online;
      })
      .sort((a, b) => view === "past" ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date));
  }, [events, filter, view]);

  const selectedEvent = events.find((event) => event.id === selectedId);
  const calendarGroups = visibleEvents.reduce<Record<string, EventItem[]>>((groups, event) => {
    const key = event.date.slice(0, 7);
    groups[key] = [...(groups[key] || []), event];
    return groups;
  }, {});

  if (!loading && selectedId && selectedEvent) {
    const online = /線上|meet|zoom/i.test(`${selectedEvent.format} ${selectedEvent.location}`);
    const registrationIsLink = /^https?:\/\//.test(selectedEvent.registrationUrl);
    return (
      <main>
        <SiteHeader />
        <PageHero
          eyebrow={`${online ? "ONLINE" : "IN PERSON"} · 活動詳情`}
          title={selectedEvent.title}
          description={formatEventDate(selectedEvent.date, selectedEvent.endDate)}
          image={selectedEvent.image || "/images/classroom.jpg"}
        />
        <section className="event-detail-page section">
          <aside>
            <Link href="/events">← 返回活動列表</Link>
            <span>{online ? "線上活動" : "線下活動"}</span>
          </aside>
          <article>
            <div className="event-detail-meta">
              <div><small>日期</small><p>{formatEventDate(selectedEvent.date, selectedEvent.endDate)}</p></div>
              <div><small>時間</small><p>{selectedEvent.startTime}{selectedEvent.endTime ? `－${selectedEvent.endTime}` : ""}</p></div>
              <div><small>地點</small><p>{selectedEvent.location || "另行通知"}</p></div>
            </div>
            <h2>活動介紹</h2>
            <p className="event-detail-description">{selectedEvent.description}</p>
            {selectedEvent.audience && <div className="event-audience-box"><h3>適合對象</h3><p>{selectedEvent.audience}</p></div>}
            {selectedEvent.registrationUrl && (
              registrationIsLink
                ? <a className="button primary" href={selectedEvent.registrationUrl} target="_blank" rel="noreferrer">前往報名 ↗</a>
                : <p className="live-event-registration">報名方式：{selectedEvent.registrationUrl}</p>
            )}
          </article>
        </section>
        <SiteFooter />
      </main>
    );
  }

  return (
    <main>
      <SiteHeader />
      <PageHero
        eyebrow="COURSES & EVENTS · 活動與課程"
        title="在適合的時間，走進一段學習。"
        description="查看進行中的線上與線下活動、日期行事曆及歷史活動。"
        image="/images/classroom.jpg"
      />
      <section className="events-page section">
        <div className="section-heading">
          <div><p className="eyebrow">LIVE EVENT DATA</p><h2>近期活動與報名</h2></div>
          <p>活動內容直接同步自昊道文化活動後台。</p>
        </div>
        <div className="events-source-note">
          <span className={error ? "source-dot error" : "source-dot"} />
          <span>{loading ? "正在同步活動資料…" : error ? "目前無法同步活動資料" : `已同步活動後台 · 共 ${events.length} 筆`}</span>
        </div>
        <nav className="events-tabs" aria-label="活動分頁">
          {[["current", "進行中"], ["calendar", "行事曆"], ["past", "歷史活動"]].map(([value, label]) => (
            <button type="button" className={view === value ? "active" : ""} aria-pressed={view === value} onClick={() => setView(value as typeof view)} key={value}>{label}</button>
          ))}
        </nav>
        {view !== "calendar" && (
          <div className="event-format-filter" role="group" aria-label="篩選活動形式">
            {filters.map((item) => <button type="button" className={filter === item ? "active" : ""} aria-pressed={filter === item} onClick={() => setFilter(item)} key={item}>{item}</button>)}
          </div>
        )}
        {loading ? <p className="events-status">活動資訊載入中⋯</p>
          : error ? <div className="events-status"><p>活動資訊暫時無法載入。</p><a href="https://www.haodao.org/events/" target="_blank" rel="noreferrer">前往原官網活動頁 →</a></div>
          : view === "calendar" ? (
            <div className="live-calendar">
              {Object.entries(calendarGroups).map(([month, monthEvents]) => (
                <section key={month}><h3>{month.replace("-", " 年 ")} 月</h3><div>
                  {monthEvents.map((event) => <a href={`/events?event=${encodeURIComponent(event.id)}`} key={event.id}><time>{event.date.slice(8, 10)}</time><span><strong>{event.title}</strong><small>{event.format || event.location}</small></span></a>)}
                </div></section>
              ))}
              {!Object.keys(calendarGroups).length && <p className="events-status">目前行事曆中沒有活動。</p>}
            </div>
          ) : visibleEvents.length ? (
            <div className="live-events-list">
              {visibleEvents.map((event) => {
                const online = /線上|meet|zoom/i.test(`${event.format} ${event.location}`);
                const registrationIsLink = /^https?:\/\//.test(event.registrationUrl);
                return (
                  <article className="live-event-card" key={event.id}>
                    {event.image && <div className="live-event-image"><img src={event.image} alt={`${event.title}活動海報`} loading="lazy" /></div>}
                    <div className="live-event-body">
                      <div className="live-event-heading"><span>{online ? "線上" : "線下"}</span><h3>{event.title}</h3></div>
                      <div className="live-event-meta"><p>{formatEventDate(event.date, event.endDate)}</p>{event.location && <p>{event.location}</p>}</div>
                      {event.description && <p className="live-event-description">{event.description}</p>}
                      <div className="live-event-actions">
                        <a
                          className="live-event-detail-link"
                          href={`/events?event=${encodeURIComponent(event.id)}`}
                        >
                          查看完整介紹 →
                        </a>
                        {event.registrationUrl && (
                          registrationIsLink ? (
                            <a
                              className="live-event-cta"
                              href={event.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {view === "past" ? "查看原活動頁" : "立即報名"} ↗
                            </a>
                          ) : (
                            <p className="live-event-registration">
                              報名方式：{event.registrationUrl}
                            </p>
                          )
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : <p className="events-status">{view === "past" ? "目前沒有符合條件的歷史活動。" : "目前沒有符合條件的進行中活動。"}</p>}
      </section>
      <SiteFooter />
    </main>
  );
}
