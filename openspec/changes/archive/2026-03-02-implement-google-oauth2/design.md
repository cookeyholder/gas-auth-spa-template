## Context

目前的 Google Apps Script 專案依賴 `Session.getActiveUser().getEmail()` 來進行認證。然而，當 Web App 部署為「Execute as Me」且存取者來自不同網域時，基於隱私限制，該方法會回傳空字串，導致無法實作跨網域的白名單或網域驗證。同時，系統需支援多種角色（管理員、導師、學生）且呈現不同的介面與資料。為了突破跨網域限制並明確管理存取權限，我們將導入 Google Identity Services (GIS) 標準前端 OAuth2 認證，並採用 SPA (Single Page Application) 架構。

## Goals / Non-Goals

**Goals:**
- 導入 Google Identity Services，實作標準的前端 OAuth2 登入流程以解決跨網域 Email 取得問題。
- 採用 SPA 架構：由前端根據登入者的角色 (Role) 動態渲染不同的儀表板或介面。
- 實作後端資料防護：後端 API 必須驗證 Token 與角色權限，確保即使前端被篡改，越權者也無法取得資料。
- 實作白名單機制與網域存取限制（透過試算表管理）。

**Non-Goals:**
- 不涉及實作第三方（如 Facebook, Apple 等）的登入機制。
- 不開發客製化的帳號密碼註冊系統。
- 不實作需請求額外 Scope (如 Drive, Calendar) 的授權，僅專注於身分驗證 (Authentication)。

## Decisions

- **認證與渲染架構轉變**：從「後端 GAS 內建認證回傳多頁面」轉向「前端 GIS 登入 + SPA 動態渲染」。`doGet(e)` 僅負責提供包含 GIS 與各角色介面模板的單一入口應用程式。
- **Token 驗證與資料防護**：前端取得 JWT (ID Token) 後，每次向後端請求資料時都必須攜帶該 Token。後端不僅驗證 JWT 的合法性，更會比對試算表取出「角色」，並基於該角色決定是否放行資料存取請求（例如：學生角色請求全校名單將直接被後端阻擋）。
- **配置管理**：由於 GIS 需要 OAuth Client ID，我們將在「網站參數設定」工作表中增加一個欄位，供管理者填入 Client ID，讓前端動態讀取。

## Development Strategy

- **測試驅動開發 (TDD)**：優先撰寫測試案例（或在 specs 中定義情境）再進行實作，確保每一項功能皆可驗證。
- **高頻提交策略**：遵循「每完成一個小任務即提交一次」的原則，確保 Git 紀錄細膩且易於回溯。
- **分支管理**：所有的開發工作皆在獨立的功能分支（例如 `feat/implement-google-oauth2`）進行，嚴禁直接更動主分支。
- **文件先行**：在開始任何程式碼實作前，必須先將 OpenSpec 的提案文件（Proposal, Design, Specs, Tasks）提交至功能分支，確立實作範疇。

## Risks / Trade-offs

- [Risk] SPA 前端安全性誤區（依賴隱藏而非阻擋） → Mitigation：嚴格執行「後端資料防護 (Backend Enforcement)」，前端的隱藏僅為 UX 考量，所有受保護資料的取得均需透過後端嚴格的 Token + 角色雙重校驗。
- [Risk] 架構變複雜，需設定 Google Cloud Console → Mitigation：在 `tasks.md` 中詳細列出 GCP 設定步驟，並在 README 中補充圖文說明。
- [Risk] 前後端通訊安全性：因為不再是純後端渲染，前端必須攜帶 Token 請求受保護的資料 → Mitigation：每次前端向 GAS 後端請求敏感資料時，都必須攜帶 JWT Token，後端需實作一個驗證中介層函式來確保請求合法。