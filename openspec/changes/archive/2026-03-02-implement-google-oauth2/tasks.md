## 0. 開發準備與 Git 初始化

- [x] 0.1 建立並切換至新分支 `feat/implement-google-oauth2`。
- [x] 0.2 提交所有 OpenSpec 提案文件（Proposal, Design, Specs, Tasks）作為實作基準。

## 1. 基礎環境與 GCP 配置

- [x] 1.1 在 Google Cloud Console 中建立 OAuth 2.0 用戶端 ID (Web application 類型)。
  - **驗收標準**: 成功取得 Client ID，且 Authorized origins 正確設定為 GAS Web App 網址。
- [x] 1.2 在試算表的「網站參數設定」工作表中新增「OAuth Client ID」設定項目。
  - **驗收標準**: 能夠透過 `getWebsiteParameter("OAuth Client ID")` 取得正確的值。

## 2. 後端 JWT 驗證與角色防護邏輯

- [x] 2.1 實作輕量級 JWT 解析與驗證的 GAS 後端函式（驗證 signature, `iss`, `aud`, `exp`）。
  - **驗收標準**: 提供無效、過期或篡改的 JWT 時，函式應拋出明確的錯誤。
- [x] 2.2 實作對應「網站網域」與「帳號管理（白名單）」的驗證邏輯，並取出使用者「角色」。
  - **驗收標準**: 不在白名單或網域不符的信箱會被拒絕；合法的信箱能正確回傳對應的 Role。
- [x] 2.3 實作中介層或權限檢查函式 `verifyRole(token, requiredRoles)`。
  - **驗收標準**: 當 `token` 擁有者的角色不包含在 `requiredRoles` 時，請求會被拒絕並回傳 403 錯誤狀態。
- [x] 2.4 實作登入 API `loginWithToken(token)`，回傳驗證結果、使用者資訊與角色。

## 3. 前端 SPA 架構與登入介面實作
- [x] 3.1 整合 HTML，將 `index.html` 轉型為 SPA 基礎框架（包含登入區塊、應用程式區塊、未授權區塊，預設皆隱藏）。
  - **驗收標準**: `doGet(e)` 統一回傳此 SPA 頁面，無伺服器端重導向。
- [x] 3.2 引入 Google Identity Services (GIS) SDK，實作 Google 登入按鈕與回呼 (Callback) 處理。
  - **驗收標準**: 使用者能點擊按鈕跳出 Google 登入視窗，並在前端成功捕獲 JWT。
- [x] 3.3 實作前端 Token 傳遞邏輯，將 JWT 傳送至後端 `loginWithToken(token)` 驗證。
  - **驗收標準**: 驗證成功時，前端儲存 Token 並能正確解析後端回傳的角色資訊；失敗時顯示「未授權區塊」。

## 4. 前端動態渲染與資料請求

- [x] 4.1 根據後端回傳的「角色」屬性，實作前端動態顯示對應儀表板（如：學生區塊、導師區塊）的邏輯。
  - **驗收標準**: 學生帳號登入只看到學生畫面，導師帳號登入只看到導師畫面，無閃爍。
- [x] 4.2 確保所有前端向後端請求資料的 `google.script.run` 呼叫，皆附帶有效的 JWT。
  - **驗收標準**: 未帶 Token 或帶舊 Token 請求敏感資料時，前端能正確處理後端的拒絕回應並引導重新登入。

## 5. 整合測試與驗證

- [x] 5.1 跨網域登入測試：使用非部署者網域的合法 Google 帳號（如 @gmail.com 學生帳號）進行登入。
  - **驗收標準**: 應能成功登入，且前端正確顯示學生儀表板。
- [x] 5.2 越權防護測試：使用「學生」角色的 Token 呼叫「管理員」或「導師」專屬的後端 API。
  - **驗收標準**: 後端強硬拒絕請求，不回傳任何敏感資料。
- [x] 5.3 錯誤狀態測試：測試網域不符、不在白名單、或使用假 Token 的情況。
  - **驗收標準**: 系統不會崩潰，且前端能給予使用者優雅的錯誤提示。

## 6. 專案文件與部署指南更新

- [x] 6.1 更新 `README.md`，加入 Google Cloud Console (GCP) 的設定圖文步驟。
  - **驗收標準**: 包含如何建立 Client ID、設定 Authorized origins。
- [x] 6.2 更新系統架構說明，描述 SPA 模式與 Token 驗證機制。
  - **驗收標準**: 文件能清楚解釋前端如何切換角色畫面，以及後端如何防護資料。
- [x] 6.3 移除過時的 `Session.getActiveUser()` 相關說明與 FAQ。
  - **驗收標準**: 使用者不會再被舊的「切換帳號按鈕」或認證限制所誤導。