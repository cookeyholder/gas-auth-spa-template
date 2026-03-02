## Why

因為 GAS Web App 的部署限制（當以發布者身分執行時，跨網域存取無法透過 `Session.getActiveUser().getEmail()` 取得使用者的 Email），目前的內建機制無法有效處理外部網域使用者的權限控管。為了讓系統具備跨網域的存取控制，同時支援多種角色（如管理員、導師、學生）在同一系統中共存並呈現不同介面，我們需要實作標準的前端 Google OAuth2 (Google Identity Services API) 認證，並轉型為 SPA (Single Page Application) 架構。這能確保能準確取得任何 Google 帳號的 Email，並在後端實行嚴格的資料防護，提升整體資訊安全與使用者體驗。

## What Changes

- 導入 Google Identity Services (GIS) 進行前端 OAuth2 登入。
- **BREAKING**: 捨棄原先完全依賴 `Session.getActiveUser()` 的後端路由多頁面驗證，改為 SPA 架構：前端取得 Token 後傳遞給後端進行驗證，並由前端動態渲染對應角色的介面。
- 支援透過白名單限定可登入的特定 Google 帳號，並支援跨網域。
- 支援限定特定 Google Workspace 網域的使用者登入，並可依據需求保持彈性以支援跨網域學生。
- 實作基於角色的後端資料存取防護（Role-based access control）。

## Capabilities

### New Capabilities
- `google-oauth2-auth`: 處理 Google Identity Services 前端登入、後端 JWT 驗證與角色權限控管機制，包含白名單、網域限制，以及 SPA 前端動態渲染功能。

### Modified Capabilities
- 

## Impact

- 必須在 Google Cloud Console 中建立 OAuth Client ID 並設定 Authorized JavaScript origins。
- `Code.js` 中的路由邏輯：`doGet(e)` 將無條件返回基礎頁面（SPA 進入點，包含登入邏輯），不再處理 HTML 切換。
- 新增/修改後端驗證 Token 的 API，所有受保護的 API 都必須執行角色與 Token 驗證。
- 試算表中的「帳號管理」與「網站參數設定」工作表結構維持，但需要新增「OAuth Client ID」設定項。
- 前端架構重構：將原本分散的 `index.html` 與 `unauthorized.html` 整合，並根據角色動態顯示不同區塊。
- **專案文件更新**: 需全面改寫 README.md，包含新的 GCP 設定流程、SPA 架構說明，以及移除過時的認證教學。