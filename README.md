# 昊道文化網站

昊道文化新版網站 MVP。這個分支可直接由 Cloudflare Workers Builds 部署，
也能在本機即時預覽修改。

## 本機預覽

需要 Node.js 22.13 以上版本。

```bash
npm ci
npm run dev
```

## Cloudflare Workers 部署

Cloudflare Workers Builds 建議設定：

- Production branch：`codex/cloudflare-workers-site`
- Root directory：留白（網站就在分支根目錄）
- Build command：`npm ci && npm run build`
- Deploy command：`npx wrangler deploy --config dist/server/wrangler.json`

也可以在已登入 Cloudflare 的電腦執行：

```bash
npm run deploy:cloudflare
```

建置後的 Worker 設定由 Vinext 產生在 `dist/server/wrangler.json`，
靜態檔案則位於 `dist/client`。

## 圖片素材

使用既有的 Cloudflare R2：

- Bucket：`haodao-media`
- 開發素材前綴：`development/`

MVP 階段的圖片先放在同一個開發目錄，不占用既有的 `images/`、
`audio/`、`documents/`、`videos/` 正式目錄。網站內容穩定後，再把確認
採用的素材搬到正式分類。

建議替 R2 設定自訂網域 `assets.haodao.org`。完成後，在 Cloudflare
Workers Builds 加入：

```text
NEXT_PUBLIC_SITE_URL=https://www.haodao.org
NEXT_PUBLIC_ASSET_BASE_URL=https://assets.haodao.org/development
```

未設定 `NEXT_PUBLIC_ASSET_BASE_URL` 時，網站會使用分支內的圖片，因此
本機與初次部署都不會破圖。

建立 R2 bucket 並登入 Wrangler 後，可一次上傳目前的官網圖片：

```bash
npm run assets:upload
```

若 bucket 或前綴不同，可以臨時指定：

```bash
R2_BUCKET=haodao-media R2_PREFIX=development npm run assets:upload
```

請勿把 Cloudflare API Token、R2 Access Key 或其他密鑰提交到 Git。
