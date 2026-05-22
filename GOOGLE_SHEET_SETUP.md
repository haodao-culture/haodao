# Google Sheet 串接設定

## 1. 建立 Google Sheet

1. 到 Google Drive 新增一個試算表。
2. 檔名可命名為「靜心修煉營資料」。
3. 從試算表網址複製 Google Sheet ID。

試算表網址通常長這樣：

```text
https://docs.google.com/spreadsheets/d/這一段就是 Google Sheet ID/edit
```

只複製 `/d/` 後面、`/edit` 前面的那一大串字。

## 2. 貼上 Apps Script

1. 到 [Google Apps Script](https://script.google.com/) 新增專案。
2. 刪除 Apps Script 預設內容。
3. 將本專案的 `google-apps-script.gs` 全部貼上。
4. 找到最上方：

```js
const SPREADSHEET_ID = '請貼上你的 Google Sheet ID';
```

改成：

```js
const SPREADSHEET_ID = '你的 Google Sheet ID';
```

5. 儲存專案。
6. 在 Apps Script 裡執行一次 `setupSheets`，授權後會自動建立：
   - 打卡
   - 心得
   - 期數
   - 名單

## 3. 部署成 Web App

1. 點選「部署」→「新增部署作業」。
2. 類型選「網頁應用程式」。
3. 執行身分選「我」。
4. 存取權選「任何人」。
5. 部署後複製 Web App URL。

## 4. 貼回網站設定

打開 `mindfulness.js`，找到：

```js
var SHEET_API_URL = '';
```

改成：

```js
var SHEET_API_URL = '你的 Google Apps Script Web App URL';
```

儲存後重新部署網站。

## 5. 上線網址

打卡頁：

```text
https://www.haodao.org/breath.html
```

管理後台：

```text
https://www.haodao.org/cultivationadmin.html
```

後台密碼目前在 `mindfulness.js`：

```js
var adminPassword = 'vx123';
```
