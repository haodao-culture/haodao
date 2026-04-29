# 昊道文化文教發展協會

[www.haodao.org](https://www.haodao.org) 的官方網站原始碼。

## 檔案結構

```
.
├── index.html      # 首頁
├── styles.css      # 樣式
├── robots.txt      # 搜尋引擎爬取規則
├── sitemap.xml     # 網站地圖
├── CNAME           # 自訂網域設定
├── .nojekyll       # 停用 Jekyll 處理
└── README.md
```

## 本地預覽

```bash
python3 -m http.server 8000
```

然後開啟 <http://localhost:8000>。

## 部署

推到 `main` 分支即會由 GitHub Pages 自動發布，通常 1 分鐘內生效。

## 待辦事項

所有待辦項目都在 **[Issues](https://github.com/haodao-culture/haodao/issues)** 追蹤。

- 想新增一件事 → [開新 issue](https://github.com/haodao-culture/haodao/issues/new)
- 想看現在最重要的 → [priority:high](https://github.com/haodao-culture/haodao/labels/priority%3Ahigh)
- 依分類瀏覽：[content](https://github.com/haodao-culture/haodao/labels/content) · [seo](https://github.com/haodao-culture/haodao/labels/seo) · [design](https://github.com/haodao-culture/haodao/labels/design) · [infra](https://github.com/haodao-culture/haodao/labels/infra)

完成的工作可用 commit message 自動關閉對應的 issue（例如 `Closes #5`）。
