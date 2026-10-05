# 活動與共學正式後端

Cloudflare Worker `haodao-website-api` 提供 `https://api.haodao.org/api/`。GitHub Pages 保持靜態網站，R2 保存圖片，D1 保存活動、報名、工作階段及同步狀態。

## 部署

1. 在昊道的 Cloudflare 帳號建立 D1 `haodao-website`，將 ID 寫入 `wrangler.jsonc`。
2. 執行 `wrangler d1 execute haodao-website --remote --file backend/schema.sql --config backend/wrangler.jsonc`。SQL 只建立尚未存在的表與索引。
3. 使用 `wrangler secret put ADMIN_AUTH --config backend/wrangler.jsonc` 設定管理者驗證資料。格式為 PBKDF2-SHA256 的 JSON，包含 `salt`、`iterations` 與 `digest`；不在儲存庫保存任何實際值。
4. 執行 `wrangler deploy --config backend/wrangler.jsonc`，並確認網域 `api.haodao.org` 的 HTTPS 已生效。

管理者驗證資料必須保留在 Secret，不得改成瀏覽器 JavaScript 或公開 JSON。正式 Cookie 使用 Secure、HttpOnly、SameSite=Strict，且僅綁定 API 主機。寫入限定官網來源；管理操作另外驗證 CSRF。

## 圖片與資料

- 品牌照片：R2 `haodao-media/images/website-20261005/`。
- 管理者新上傳的照片：R2 `haodao-media/images/website-uploads/`，隨機名稱，僅接受 JPG/PNG/WebP，最多 8 MB／3,000 萬畫素。
- 報名：D1 `registrations`，以 request_id 防止重複送出；公開 API 不提供個資讀取。
- 活動：D1 `events`，依 Asia/Taipei 日期判斷歷史活動，revision 避免覆蓋同時編輯。

Google 試算表連接需管理者另外部署官方網站後台的 Apps Script，並在管理介面完成驗證。未完成時報名仍保存於 D1，介面不宣稱已同步。完成後每五分鐘重送尚未成功同步的資料；Google 端以報名編號防重複。

`LOCAL_TEST=true` 僅供隔離測試使用，正式部署不設定此變數。

## 回復

前端可用 Git revert 回復這次發布。後端可用 Cloudflare Worker 版本回復；不要刪除 D1 或 R2，避免遺失已收到的報名與圖片。既有 GitHub Pages CNAME 與主網域 DNS 無須改動。
