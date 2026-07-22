# 部署設定步驟

本文件提供從零開始完成 **gas-auth-spa-template** 部署的完整指引，涵蓋 GCP 專案建立 → Apps Script 設定 → 試算表串接 → 正式上線。

---

## 前置需求

- Google 帳號
- [Google Cloud Console](https://console.cloud.google.com/) 存取權限
- [Google Apps Script](https://script.google.com/) 編輯器存取權限
- Google 試算表（用於儲存帳號白名單與網站參數）
- （選擇性）Node.js + [clasp](https://github.com/google/clasp) — 若要用本地端開發

---

## 快速入門（3 分鐘）

如果你已經熟悉 GCP 與 GAS，只需完成以下關鍵步驟：

1. **GCP**：建立 OAuth 2.0 Client ID（Web 應用程式類型，來源填 `https://script.google.com`）
2. **GAS**：將 `Code.js` 與 `index.html` 貼入專案
3. **試算表**：綁定一個 Google 試算表，重新整理後自動建立兩個工作表
4. **部署**：部署為 Web 應用程式（執行身分：我，存取權限：任何人）

詳細步驟請見下方：

---

## 1. 建立 Google Cloud 專案與 OAuth Client ID

Google Identity Services (GIS) 需要一組 OAuth 2.0 用戶端 ID 來識別您的應用程式。

詳細教學請參閱以下文件（擇一即可）：

| 文件 | 適合對象 |
|------|---------|
| [OAuth 2.0 認證申請與原理指南](./OAUTH_GUIDE.md) | 想了解 OAuth2 原理與 Client ID 申請 |
| [GIS 設定教學](./GIS_SETUP_GUIDE.md) | 想了解完整的 GIS 整合與安全最佳實踐 |

**重點摘要：**

1. 前往 [Google Cloud Console](https://console.cloud.google.com/) → 建立新專案（或選取現有專案）
2. **API 和服務 → OAuth 同意畫面**：選擇 External，填寫應用程式名稱與支援 Email
3. **範圍**：加入 `openid`、`email`、`profile`
4. **API 和服務 → 憑證 → + 建立憑證 → OAuth 用戶端 ID**
   - 應用程式類型：**Web 應用程式**
   - 已授權的 JavaScript 來源：`https://script.google.com`
   - 已授權的重新導向 URI：`https://script.google.com`
5. 建立後**複製 Client ID**（格式：`xxxxx.apps.googleusercontent.com`）

---

## 2. 設定 Apps Script 專案

### 方式 A：使用 clasp（建議）

如果你已安裝 clasp：

```bash
clasp clone "你的 Script ID"
# 將本專案的檔案複製到目錄中
clasp push
```

詳細 clasp 使用方式請參考 [clasp 官方文件](https://github.com/google/clasp)。

### 方式 B：手動設定

1. 前往 [Google Apps Script](https://script.google.com/)，點擊 **+ 建立新專案**
2. 將 `Code.js` 的內容貼入編輯器中的 `Code.gs`（可重新命名為 `Code.js`）
3. 點擊 **+ 新增檔案 → HTML**，命名為 `index`，將 `index.html` 的內容貼入
4. 點擊 **專案設定**（齒輪圖示），勾選 **「顯示 manifest 檔案」**
5. 將 `appsscript.json` 的內容貼入 manifest 編輯器：

```json
{
  "timeZone": "Asia/Taipei",
  "dependencies": {},
  "exceptionLogging": "STACKDRIVER",
  "runtimeVersion": "V8"
}
```

> **注意**：HTML 檔案在 GAS 中命名時不需加 `.html` 副檔名，系統會自動處理。

---

## 3. 連結 Google Sheets

GAS 專案需要綁定一個 Google 試算表來儲存帳號與設定：

1. 在 GAS 編輯器中，點擊左側的 **「專案設定」**
2. 找到 **「Google Cloud 平台專案」** 區塊
3. 點擊 **「連結 Google Cloud 專案」**（若尚未連結）
4. 或者直接在 Google 試算表中開啟 **「擴充功能 → Apps Script」**，系統會自動連結該試算表

> **提示**：最簡單的方式是先建立一個 Google 試算表，再從試算表中開啟 Apps Script 編輯器，這樣專案與試算表會自動綁定。

---

## 4. 設定試算表

重新整理試算表（或執行 `getWebsiteParameters()` 函式）後，系統會自動建立兩個工作表：

### 網站參數設定

| 參數項目 | 參數內容 | 說明 |
|---------|---------|------|
| 網站名稱 | GAS Auth Portal | 顯示在網頁標題與登入頁面的名稱 |
| 網站網域 | *(留空或填入網域)* | 限制特定 Google Workspace 網域登入（如 `example.com`） |
| OAuth Client ID | *(貼上你的 Client ID)* | 從 GCP 取得的 OAuth 2.0 用戶端 ID |
| 客服單位名稱 | 系統管理員 | 顯示在頁尾或其他位置的客服資訊 |

### 帳號管理

| Email | 姓名 | 人員編號 | 部門單位 | 角色 | 狀態 | 備註 |
|-------|------|---------|---------|------|------|------|
| admin@example.com | 管理員 | A001 | 資訊處 | admin | 啟用 | |
| teacher@example.com | 張老師 | T001 | 教務處 | teacher | 啟用 | |
| student@example.com | 李同學 | S001 | 資訊工程系 | student | 啟用 | |

> **角色說明**：
> - 內建角色：`admin`（管理員）、`teacher`（導師）、`student`（學生）
> - 支援中英文角色名稱（如 `管理員` 等同 `admin`）
> - 可在 `Code.js` 與 `index.html` 中擴充自訂角色
>
> **狀態**需填入 `啟用` 才能登入，填入 `停用` 則禁止存取。

---

## 5. 部署為 Web App

1. 點擊右上角 **「部署 → 新增部署作業」**
2. 類型選擇 **「網頁應用程式」**
3. 設定：
   - **描述**：自訂（如 `v1.0.0`）
   - **執行身分**：**我**（`Me`）
   - **誰可以存取**：**任何人**（`Anyone`）
4. 點擊 **「部署」**
5. **複製 Web App URL**（格式：`https://script.google.com/macros/s/.../exec`）

> **注意**：選擇「任何人」並不表示任何人都能使用您的應用程式，因為後端有 JWT 驗證 + 白名單雙重保護，未授權的使用者無法登入。

---

## 6. 測試

1. 開啟 Web App URL
2. 確認登入頁面正常顯示，網站名稱正確
3. 點擊 Google 登入按鈕，選擇一個已在「帳號管理」中的 Google 帳號
4. 確認能正確顯示對應角色的儀表板：
   - `admin` → 系統主控台（4 張統計卡片）
   - `teacher` → 導師工作區（學生清單）
   - `student` → 個人中心（學習進度 + 成績）
5. 點擊登出按鈕，確認回到登入頁面
6. **測試安全性**：用一個不在白名單中的帳號登入，確認顯示「存取遭拒」頁面

---

## 登入流程

```
使用者開啟 Web App URL
    │
    ▼
┌──────────────────────────┐
│ doGet() 回傳 index.html  │
│ (SPA 框架, 不檢查權限)    │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ 前端讀取試算表參數         │
│ (Client ID, 網站名稱等)   │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ 初始化 GIS SDK            │
│ 渲染 Google 登入按鈕       │
│ 顯示 One Tap 提示         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ 使用者點擊登入 → 選擇帳號  │
│ Google 核發 ID Token(JWT) │
└──────────┬───────────────┘
           │ ID Token
           ▼
┌──────────────────────────┐
│ 前端傳送 Token 給後端      │
│ loginWithToken(token)     │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐     ┌──────────────┐
│ verifyRole() 中介層        │────▶│ 帳號管理      │
│ 1. validateIdToken()     │     │ 工作表        │
│   呼叫 Token Info API    │◀────└──────────────┘
│   驗證 aud, iss, exp     │
│ 2. checkEmailPermission() │
│   檢查網域 + 白名單        │
│   檢查帳號狀態 (啟用/停用)  │
│ 3. 角色權限比對            │
└──────────┬───────────────┘
           │
      ┌────┴────┐
      │         │
      ▼         ▼
    通過       拒絕
    顯示       顯示
    對應角色    未授權頁面
    儀表板
```

---

## 使用 clasp 進行本地開發

本專案支援使用 clasp 進行本地開發與版本控制：

```bash
# 安裝 clasp
npm install -g @google/clasp

# 登入 Google 帳號
clasp login

# 建立新專案或複製現有專案
clasp create "專案名稱" --type webapp
# 或
clasp clone "Script ID"

# 上傳本地檔案到 GAS
clasp push

# 從 GAS 下載最新檔案
clasp pull

# 開啟 GAS 編輯器
clasp open

# 部署新版本
clasp deploy --description "v1.0.0"
```

> 使用前請先編輯 `.clasp.json`，將 `scriptId` 改為你的 GAS 專案 ID（可在 GAS 編輯器 → 專案設定中找到）。

---

## 注意事項

- **測試階段**：OAuth 同意畫面處於「測試」狀態時，只有加入測試使用者清單的帳號可以登入
- **發佈上線**：若要讓未經驗證的使用者登入，需完成 Google OAuth 驗證（送出審核）
- **安全性**：ID Token 透過 Google tokeninfo API 驗證，包含 audience、issuer、過期時間檢查
- **網域限制**：在「網站參數設定」的「網站網域」欄位填入 Google Workspace 網域即可啟用
- **Client Secret**：本專案使用前端 OAuth2 Implicit Flow，**不需要**（也不可以）在前端暴露 Client Secret
- **GAS 網址變動**：重新部署可能產生新網址，但 `https://script.google.com` 作為 Authorized JavaScript Origins 永遠有效

---

## 參考資料

| 主題 | 文件 |
|------|------|
| GIS Web Client Setup | https://developers.google.com/identity/gsi/web/guides/client-library |
| GIS Token Model | https://developers.google.com/identity/oauth2/web/guides/use-token-model |
| GIS JS Reference | https://developers.google.com/identity/gsi/web/reference/js-reference |
| OAuth 同意畫面設定 | https://developers.google.com/workspace/guides/configure-oauth-consent |
| Apps Script Web Apps | https://developers.google.com/apps-script/guides/web |
| Apps Script Manifest | https://developers.google.com/apps-script/manifest |
| clasp 官方文件 | https://github.com/google/clasp |
| Manage OAuth Clients | https://support.google.com/cloud/answer/15549257 |

---

## 相關文件

- [OAuth 2.0 認證申請與原理指南](./OAUTH_GUIDE.md)
- [Google Identity Services (GIS) 設定教學](./GIS_SETUP_GUIDE.md)
- [README.md](../README.md)
