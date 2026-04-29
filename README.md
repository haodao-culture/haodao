# 昊道文化文教發展協會

官方網站原始碼，部署於 GitHub Pages，網址：[www.haodao.org](https://www.haodao.org)

## 檔案結構

```
.
├── index.html      # 首頁
├── styles.css      # 樣式
├── CNAME           # GitHub Pages 自訂網域設定
├── .nojekyll       # 停用 Jekyll 處理
└── README.md
```

## 本地預覽

直接用瀏覽器開啟 `index.html`，或執行：

```bash
python3 -m http.server 8000
```

然後開啟 <http://localhost:8000>

## 部署到 GitHub Pages

1. 建立 GitHub repository（建議命名為 `haodao` 或 `haodao.github.io`）
2. 推送本目錄內容到 `main` branch
3. 在 repository 的 **Settings → Pages**：
   - Source 選擇 `Deploy from a branch`
   - Branch 選擇 `main` / `/ (root)`
4. 設定自訂網域：
   - 在 GitHub Pages 設定中填入 `www.haodao.org`
   - 在 DNS 服務商新增 CNAME 紀錄：`www` → `<github-username>.github.io`
   - 若要支援 apex 網域 `haodao.org`，加上 A 紀錄指向 GitHub Pages IP：
     - `185.199.108.153`
     - `185.199.109.153`
     - `185.199.110.153`
     - `185.199.111.153`
5. 勾選 **Enforce HTTPS**

## 待辦事項

所有待辦項目都在 **[Issues](https://github.com/shianyow/haodao/issues)** 追蹤。

- 想新增一件事 → [開新 issue](https://github.com/shianyow/haodao/issues/new)
- 想看現在最重要的 → [priority:high](https://github.com/shianyow/haodao/labels/priority%3Ahigh)
- 依分類瀏覽：[content](https://github.com/shianyow/haodao/labels/content) · [seo](https://github.com/shianyow/haodao/labels/seo) · [design](https://github.com/shianyow/haodao/labels/design) · [infra](https://github.com/shianyow/haodao/labels/infra)

完成的工作會用 commit message 自動關閉對應的 issue（例如 `closes #5`）。
