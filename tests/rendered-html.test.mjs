import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the complete Haodao homepage", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>昊道文化｜在覺察裡，走回生命的從容<\/title>/);
  assert.match(html, /認識昊道/);
  assert.match(html, /學習地圖/);
  assert.match(html, /課程與活動/);
  assert.match(html, /共學與陪伴/);
  assert.match(html, /公益與服務/);
  assert.match(html, /昊道法舟/);
  assert.doesNotMatch(html, /原始架構設計|使用者路徑架構/);
});

test("includes the Notion architecture content and interactions", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /學習與參與/);
  assert.match(page, /活動與課程/);
  assert.match(page, /課程行事曆/);
  assert.match(page, /歷史活動/);
  assert.match(page, /eventFilters = \["全部", "線上", "線下"\]/);
  assert.match(page, /docs\.google\.com\/spreadsheets/);
  assert.match(page, /各地共學點/);
  assert.match(page, /近期共學活動/);
  assert.match(page, /全站搜尋/);
  assert.match(page, /沒有找到符合的內容/);
  assert.match(
    page,
    /https:\/\/calligraphy-gallery-curation\.k1l2p3k1l2p3\.chatgpt\.site\/haodao/,
  );
});
