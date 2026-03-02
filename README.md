# gas-auth-spa-template (Google Apps Script 專案範本)

這是一個基於 Google Apps Script 的 Web 應用程式範本，採用 Google Identity Services (GIS) 認證與 SPA (Single Page Application) 架構，具備強大的跨網域權限管理功能。

## 專案特色

- ✅ **跨網域認證**：解決 GAS "Execute as Me" 部署時無法取得外部網域使用者 Email 的限制。
- ✅ **SPA 架構**：流暢的單頁面體驗，根據使用者角色（管理員、導師、學生）動態切換介面。
- ✅ **後端資料防護**：基於 JWT Token 與角色的後端驗證機制，確保資料存取安全性。
- ✅ **帳號白名單管理**：透過 Google 試算表直接控制可存取的使用者及其角色。
- ✅ **本地開發支援**：使用 clasp 進行本地開發和版本控制。

## 部署與設定指南

### 1. 建立 Google Cloud 專案與 OAuth Client ID

為了讓前端能夠進行 Google 登入，您必須設定 GCP：

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 建立新專案或選擇現有專案。
3. 進入「API 和服務」 > 「憑證」。
4. 點選「建立憑證」 > 「OAuth 2.0 用戶端 ID」。
5. 用戶端類型選擇 **「Web 應用程式」**。
6. **已授權的 JavaScript 來源**：填入您的 GAS Web App 網址（例如 `https://script.google.com`）。
7. **已授權的重新導向 URI**：填入您的 GAS Web App 網址。
8. 建立後，複製 **「用戶端 ID (Client ID)」**。

### 2. 初始化試算表與參數

1. 在 GAS 編輯器中執行 `onOpen` 或直接開啟綁定的試算表。
2. 系統會自動建立「網站參數設定」與「帳號管理」工作表。
3. 在「網站參數設定」中，將剛剛得到的 **OAuth Client ID** 填入對應欄位。
4. 在「帳號管理」中，新增授權使用者的 Email，並設定其角色（admin/teacher/student）與狀態為「啟用」。

### 3. 部署 Web 應用程式

1. 點選「部署」 > 「新增部署作業」。
2. 類型選擇「網頁應用程式」。
3. **執行身分**：選擇「我」。
4. **具有存取權的使用者**：選擇「任何人」。
5. 完成部署並取得 Web App 網址。

## 相關文件

- [🔐 Google OAuth 2.0 認證申請與原理指南](docs/OAUTH_GUIDE.md)：詳細介紹如何取得 Client ID 以及 OAuth2 的運作原理。

## 技術架構說明

### 前端 (SPA)
- 使用 `index.html` 作為唯一的入口。
- 引入 `https://accounts.google.com/gsi/client` SDK 處理登入。
- 登入成功後取得 JWT (ID Token)，並透過 `google.script.run` 傳送給後端。
- 根據後端回傳的 Role 屬性，動態切換顯示區塊。

### 後端 (GAS)
- `doGet(e)`：不進行權限判斷，僅負責回傳 HTML 框架。
- `validateIdToken(token)`：呼叫 Google 的 `tokeninfo` API 驗證 Token 合法性。
- `verifyRole(token, requiredRoles)`：核心中介層，檢查 Token、網域及白名單權限。
- 所有的資料請求 API 都必須攜帶 Token 並經過驗證。

## 角色說明

| 角色名稱 | 適用情境 | 權限等級 |
| :--- | :--- | :--- |
| **admin / 管理員** | 系統負責人 | 最高權限，可管理所有設定與帳號。 |
| **teacher / 導師** | 教職員、班導師 | 具備管理特定資料（如學生名單）的權限。 |
| **student / 學生** | 一般使用者、學生 | 僅能存取個人相關資料。 |

## 常見問題 (FAQ)

### Q: 為什麼跨網域的使用者登入後看不到 Email？
**A:** 在舊版 GAS 機制中這是隱私限制，但在本專案採用的 OAuth2 模式下已解決此問題。只要使用者點擊 Google 登入並授權，系統即可準確取得其 Email 並進行權限比對。

### Q: 如何新增自訂角色？
**A:** 直接在「帳號管理」試算表的角色欄位填入新名稱，並在 `index.html` 的 `renderDashboard` 函式中增加對應的顯示邏輯即可。

## 授權

MIT License
