# 活動與共學正式後端

Cloudflare Worker `haodao-website-api` 提供 `https://api.haodao.org/api/`。GitHub Pages 保持靜態網站，R2 保存圖片，D1 保存活動、報名、工作階段及同步狀態。

## 部署

1. 在昊道的 Cloudflare 帳號建立 D1 `haodao-website`，將 ID 寫入 `wrangler.jsonc`。
2. 執行 `wrangler d1 execute haodao-website --remote --file backend/schema.sql --config backend/wrangler.jsonc`。SQL 只建立尚未存在的表與索引。
3. 依下方「Google 管理後台」設定 `GOOGLE_CLIENT_ID`，並執行 `backend/migrations/` 的資料表遷移。
4. 執行 `wrangler deploy --config backend/wrangler.jsonc`，並確認網域 `api.haodao.org` 的 HTTPS 已生效。

管理者以個人 Google 帳號登入，Worker 不保存任何管理密碼。正式 Cookie 使用 Secure、HttpOnly、SameSite=Strict，且僅綁定 API 主機。寫入限定官網來源；管理操作另外驗證 CSRF。

## 圖片與資料

- 品牌照片：R2 `haodao-media/images/website-20261005/`。
- 管理者新上傳的照片：R2 `haodao-media/images/website-uploads/`，隨機名稱，僅接受 JPG/PNG/WebP，最多 8 MB／3,000 萬畫素。
- 報名：D1 `registrations`，以 request_id 防止重複送出；公開 API 不提供個資讀取。
- 活動：D1 `events`，依 Asia/Taipei 日期判斷歷史活動，revision 避免覆蓋同時編輯。

Google 試算表連接需管理者另外部署官方網站後台的 Apps Script，並在管理介面完成驗證。未完成時報名仍保存於 D1，介面不宣稱已同步。完成後每五分鐘重送尚未成功同步的資料；Google 端以報名編號防重複。

`LOCAL_TEST=true` 僅供隔離測試使用，正式部署不設定此變數。

## 回復

前端可用 Git revert 回復這次發布。後端可用 Cloudflare Worker 版本回復；不要刪除 D1 或 R2，避免遺失已收到的報名與圖片。既有 GitHub Pages CNAME 與主網域 DNS 無須改動。

## Google 管理後台（部署前必須設定）

- 獨立入口 `/admin/`，不列入搜尋索引或 sitemap。
- 固定最高權限管理者 `hd@haodao.org`，資料庫與 API 均禁止刪除或降權。
- 編輯者可以管理活動、照片與共學報名；只有 owner 可以增刪名單及設定 Sheets 連接。
- Google 帳號須為 Gmail 或 Google Workspace；Google `sub` 首次登入後綁定，不以可變更的郵件代替帳號身分。
- 每次 API 請求查詢目前名單；移除編輯者立即撤銷登入。舊密碼登入及舊 sessions 不再接受。
- Google ID token 經 jose 驗證簽章、audience、issuer、期限、已驗證 email 與一次性 nonce；權杖不保存於 localStorage。

部署順序（不要在 Google 設定完成前發布，避免管理入口暫時無法登入）：
1. Google Cloud 建立 Web OAuth client，JavaScript origins 加入 `https://www.haodao.org`（本地真實登入測試另加 `http://127.0.0.1:4180`）。使用 Google Identity Services popup callback，不需 OAuth client secret。
2. 設定 Worker 公開變數 `GOOGLE_CLIENT_ID` 為該用戶端 ID；不可使用其他專案的猜測值。
3. 安裝 backend dependencies（pnpm install --frozen-lockfile），以 D1 execute 執行 `backend/migrations/0001_google_admin.sql`。僅新增管理資料表；保留活動與報名。
4. 部署 Worker，建置靜態頁後部署 GitHub Pages。先測試 owner 真實登入，再讓 owner 加入指定編輯者。
5. 確認正常後，刪除不再使用的 `ADMIN_AUTH` Worker secret（`wrangler secret delete ADMIN_AUTH --config backend/wrangler.jsonc`）。舊的密碼登入已停用，這個 secret 不再被讀取。不要將秘密寫入 Git。

測試：在 `backend` 執行 `pnpm install --frozen-lockfile` 後執行 `pnpm test`。GitHub Actions 的 `backend` 檢查會在每個 PR 自動執行。
目前自動測試使用本地 SQLite 與簽署測試 JWT，並未代替實際 Google OAuth 端到端登入驗證。
