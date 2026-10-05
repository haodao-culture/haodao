# 官網正式版來源

`website-src` 保存版型與品牌內容。正式頁面由同一份版型預先產生完整 HTML；一般訪客與搜尋引擎取得相同內容。

首次使用或更新依賴後，執行 `npm --prefix website-src ci` 安裝鎖定版本的建置工具。

執行 `npm --prefix website-src run build`（或 `node website-src/tools/build.mjs`）更新根目錄與各頁 `index.html`，再提交產出檔案至 GitHub `main`，由既有 GitHub Pages 發布。

建置會使用固定版本的 Prettier，輸出兩格縮排、LF 換行與穩定的 HTML 格式；嚴格保留行內元素間的空白，避免改變文字間距。請修改來源後重新建置，不要手動排版產出檔案。首次導入格式會有較大的 diff，後續內容修改則能顯示局部差異。

執行 `npm --prefix website-src test` 驗證行內文字、預格式化內容、課程 template 與全部正式頁面的結構保留，以及格式化的可重複性。

- `routes.json`：正式網址、搜尋標題與描述。
- `app.js`、`editorial.js`：品牌頁面版型（供建置使用）。
- `bootstrap.js`：正式版導覽、搜尋、篩選與表單初始化。
- `events.js`：活動管理與共學報名介面；建置時切換正式 API 與 R2 網址。
- `media-manifest.json`：圖片原檔名到 R2 WebP 檔名的對照。
- `image-dimensions.json`：圖片原始尺寸，建置時產生 width/height。
- `legacy-sitemap.xml`：改版前網站地圖。建置時保留既有網址，再加入新版頁面。

照片位於 `https://media.haodao.org/images/website-20261005/`，不存入這個來源目錄。不要提交管理者雜湊、Cookie、API token、報名資料或 SQLite 資料庫。

原有 `/events/`、`/events/course1/`、`/breathing/` 及其他既有獨立服務保留原路徑。首頁與新頁面也提供原有活動與靜心閱讀入口。未知頁面使用 GitHub Pages 的 404 頁面。

原站 Google 驗證使用 DNS TXT 記錄，這次改版不改動該記錄。正式網域固定為 `https://www.haodao.org`，社群分享、canonical 與 sitemap 使用同一網域。
