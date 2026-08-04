import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function getWorker() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  return (await import(workerUrl.href)).default;
}

async function render(pathname = "/") {
  const worker = await getWorker();
  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("homepage renders the architecture V2 holding page", async () => {
  const response = await render("/");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /新版官網架構建置中/);
  assert.match(html, /new2\.haodao\.org 已連線/);
  assert.match(html, /href="https:\/\/new\.haodao\.org"/);
});

test("main architecture pages render as independent routes", async () => {
  const expectations = [
    ["/about", "成立緣起"],
    ["/learning", "核心學習路徑"],
    ["/learning/community", "共學會是什麼"],
    ["/events", "近期活動與報名"],
    ["/community", "各地共學點"],
    ["/community/taipei", "共學點介紹"],
    ["/welfare", "服務領域"],
    ["/fazhou", "法舟簡介"],
    ["/search", "輸入關鍵字"],
  ];
  for (const [pathname, text] of expectations) {
    const response = await render(pathname);
    assert.equal(response.status, 200, pathname);
    assert.match(await response.text(), new RegExp(text), pathname);
  }
});

test("events page uses the shared live backend and online/offline filters", async () => {
  const [eventsPage, eventsLib] = await Promise.all([
    readFile(new URL("../app/events/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/lib/events.ts", import.meta.url), "utf8"),
  ]);
  assert.match(eventsPage, /const filters = \["全部", "線上", "線下"\]/);
  assert.match(eventsPage, /立即報名/);
  assert.match(eventsPage, /event\.registrationUrl/);
  assert.doesNotMatch(eventsPage, /查看完整介紹|URLSearchParams|\/events\?event=/);
  assert.match(eventsLib, /docs\.google\.com\/spreadsheets/);
  assert.match(eventsLib, /parseEvents/);
});

test("navigation has one clear courses and events destination", async () => {
  const chrome = await readFile(
    new URL("../app/components/SiteChrome.tsx", import.meta.url),
    "utf8",
  );
  assert.equal((chrome.match(/>課程與活動</g) || []).length, 2);
  assert.doesNotMatch(chrome, />近期活動</);
});

test("footer uses the official social and contact links", async () => {
  const chrome = await readFile(
    new URL("../app/components/SiteChrome.tsx", import.meta.url),
    "utf8",
  );
  assert.match(chrome, /facebook\.com\/profile\.php\?id=100063957733524/);
  assert.match(chrome, /instagram\.com\/haodao_culture/);
  assert.match(chrome, /threads\.net\/@haodao_culture/);
  assert.match(chrome, /youtube\.com\/@昊道文化/);
  assert.doesNotMatch(chrome, /team@haodao\.org|mailto:/);
  assert.doesNotMatch(chrome, /href="#"/);
  assert.doesNotMatch(chrome, /官方 LINE/);
});
