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

test("server-renders the architecture version selector", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>昊道文化｜雙版本網站架構展示<\/title>/);
  assert.match(html, /同一份內容/);
  assert.match(html, /原始架構設計/);
  assert.match(html, /使用者路徑架構/);
  assert.match(html, /兩個版本均為架構對焦用展示/);
  assert.doesNotMatch(html, /codex-preview|Building your site/);
});

test("includes both architecture models and the Fazhou destination", async () => {
  const page = await readFile(new URL("../app/page.tsx", import.meta.url), "utf8");

  assert.match(page, /const originalSections/);
  assert.match(page, /const recommendedSections/);
  assert.match(page, /學習地圖/);
  assert.match(page, /找到學習起點/);
  assert.match(page, /課程類型/);
  assert.match(page, /尋找共學點/);
  assert.match(
    page,
    /https:\/\/calligraphy-gallery-curation\.k1l2p3k1l2p3\.chatgpt\.site\/haodao/,
  );
});
