# 🔐 Google OAuth 2.0 認證申請與原理指南

本專案採用 **Google Identity Services (GIS)** 實作前端登入，並配合後端 JWT 驗證。為了讓您的應用程式能正常運作，您必須在 Google Cloud Console 取得一組 **OAuth 2.0 用戶端 ID**。

---

## 📖 1. Google OAuth 2.0 的基本原理

在傳統的 GAS Web App 中，我們依賴伺服器端（GAS）去辨識使用者。但這在跨網域（例如 A 公司開發，B 公司學生使用）時會因為隱私限制而失效。

**OAuth 2.0 (OpenID Connect) 的運作流程如下：**

1.  **票券申請（前端）**：當使用者點擊「Google 登入」按鈕，前端會直接導向 Google 的認證伺服器。
2.  **使用者授權**：使用者同意授權（提供 Email 與基本資料）給您的應用程式。
3.  **核發票券 (ID Token)**：Google 會核發一張經過加密簽章的「票券」（稱為 **JWT - JSON Web Token**）給前端。
4.  **票券驗證（後端）**：前端把這張票券傳給 GAS 後端。後端會聯絡 Google 驗證這張票券是否偽造、是否過期、以及這張票券是核發給誰的。
5.  **取得身分**：驗證成功後，後端能百分之百確定使用者的 Email，進而根據試算表中的「角色」給予權限。

---

## 🛠️ 2. 如何取得 OAuth 用戶端 ID (步驟教學)

### 第一步：進入 Google Cloud Console
1. 前往 [Google Cloud Console](https://console.cloud.google.com/)。
2. 在左上角點擊「選取專案」，然後點擊 **「新增專案」**（或是選取您現有的 GAS 關聯專案）。

### 第二步：設定「OAuth 同意畫面」(Consent Screen)
在申請 ID 之前，必須先設定應用程式的對外資訊：
1. 點擊左側選單：**「API 和服務」 > 「OAuth 同意畫面」**。
2. **User Type**：
    *   如果您是 Google Workspace 內部使用，選 **Internal**。
    *   如果您要開放給外部 @gmail.com 或是其他網域的人使用，選 **External**。
3. 填寫必要資訊：
    *   **應用程式名稱**：例如「學生成績查詢系統」。
    *   **使用者支援電子郵件**：您的 Email。
    *   **開發人員聯絡資訊**：您的 Email。
4. **範圍 (Scopes)**：點擊「新增或移除範圍」，勾選以下三項（通常是預設）：
    *   `.../auth/userinfo.email`
    *   `.../auth/userinfo.profile`
    *   `openid`
5. 點擊「儲存並繼續」直到完成。

### 第三步：建立 OAuth 2.0 用戶端 ID
1. 點擊左側選單：**「API 和服務」 > 「憑證」**。
2. 點擊上方 **「+ 建立憑證」 > 「OAuth 用戶端 ID」**。
3. **應用程式類型**：選擇 **「Web 應用程式」**。
4. **名稱**：隨意填寫，方便辨識即可。
5. **已授權的 JavaScript 來源** (關鍵步驟)：
    *   點擊「新增 URI」。
    *   填入：`https://script.google.com`
6. **已授權的重新導向 URI**：
    *   點擊「新增 URI」。
    *   填入：`https://script.google.com`
    *   *(提示：對於 GAS SPA 來說，這兩個欄位填入上述網址即可，因為我們主要使用隱含授權流)*。
7. 點擊 **「建立」**。

### 第四步：取得 Client ID
建立完成後，您會看到一個彈出視窗，顯示 **「您的用戶端 ID」**。
*   格式範例：`1234567890-abc123def456.apps.googleusercontent.com`
*   **請複製這串字串**，這是本專案唯一需要的資料。

---

## ⚙️ 3. 將 ID 整合進您的專案

拿到 Client ID 後，請依照以下步驟設定您的 Google 試算表：

1.  開啟與 GAS 專案綁定的 **Google 試算表**。
2.  找到 **「網站參數設定」** 工作表。
3.  在 **「OAuth Client ID」** 這一列的 **「參數內容」** 欄位中，貼上您剛剛複製的 ID。
4.  **重新整理** 您的 Web App 網頁。

---

## ❓ 4. 常見問題與安全性提示

*   **為什麼要設 Authorized JavaScript origins？**
    這是為了防止駭客在其他網站惡意呼叫您的 Client ID。Google 只會允許來自 `script.google.com` 的請求執行登入動作。
*   **用戶端密鑰 (Client Secret) 需要用到嗎？**
    在本專案的前端 SPA 架構中，我們使用的是 **OAuth 2.0 Token 驗證流**，不需要（也不可以）將 Client Secret 放在程式碼中，以確保安全。
*   **為什麼看到「未經驗證的應用程式」警告？**
    如果您的 OAuth 同意畫面設為 External，在通過 Google 審核前會看到此警告。您可以點擊「進階」並「繼續前往」來進行開發測試。對於組織內部 (Internal) 則不會有此問題。

---

**恭喜！您已經完成了認證系統的配置。現在您的 Web App 已經具備安全且跨網域的登入功能了！**
