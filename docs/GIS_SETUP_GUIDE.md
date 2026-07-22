# Google Identity Services (GIS) 設定教學

本文件詳細介紹如何在 Google Apps Script (GAS) Web 應用程式中整合 Google Identity Services (GIS) 進行使用者認證。

---

## 📚 資料來源

本教學內容参考以下官方文件：

### 官方文件

| 資料來源 | 連結 | 說明 |
| :--- | :--- | :--- |
| Google Identity 官方首頁 | https://developers.google.com/identity | GIS 產品總覽 |
| Sign in with Google | https://developers.google.com/identity/siwg | 認證功能介紹 |
| Web 實作指南 | https://developers.google.com/identity/gsi/web/guides/overview | Web 平台整合指南 |
| OAuth 2.0 用戶端 ID 設定 | https://developers.google.com/identity/gsi/web/guides/get-google-api-clientid | Client ID 申請步驟 |
| OAuth 同意畫面設定 | https://console.developers.google.com/auth/branding | Branding 頁面 |
| 憑證管理頁面 | https://console.developers.google.com/auth/clients | Client ID 建立頁面 |
| Token 驗證指南 | https://developers.google.com/identity/gsi/web/guides/verify-google-id-token | 後端驗證方法 |
| JavaScript API 參考 | https://developers.google.com/identity/gsi/web/reference/js-reference | GIS JS API |
| HTML API 參考 | https://developers.google.com/identity/gsi/web/reference/html-reference | GIS HTML 屬性 |
| 支援的瀏覽器 | https://developers.google.com/identity/gsi/web/guides/supported-browsers | 相容性列表 |
| 品牌使用規範 | https://developers.google.com/identity/branding-guidelines | Logo 與 UI 規範 |

### GAS + GIS 整合相關

| 資料來源 | 連結 | 說明 |
| :--- | :--- | :--- |
| GAS Troubleshooting | https://developers.google.com/apps-script/guides/support/troubleshooting | Apps Script 除錯指南 |
| Auth Troubleshooting | https://developers.google.com/apps-script/api/troubleshoot-authentication-authorization | 認證問題除錯 |
| CORS 問題討論 | https://stackoverflow.com/questions/79392832 | Stack Overflow 討論 |
| Invalid Origin 問題 | https://stackoverflow.com/questions/65791839 | 網域設定問題 |
| FedCM 遷移指南 | https://developers.google.com/identity/gsi/web/guides/fedcm-migration | FedCM 整合 |

---

## 🎯 什麼是 Google Identity Services？

Google Identity Services (GIS) 是 Google 官方提供的使用者認證解決方案，支援：

- **Sign in with Google 按鈕**：一鍵登入，無需密碼
- **One Tap 提示**：自動偵測已登入的 Google 帳號，一鍵授權
- **自動登入**：回訪使用者可自動恢復登入狀態

### 核心優勢

| 特點 | 說明 |
| :--- | :--- |
| 簡化開發 | 無需管理密碼雜湊、忘記密碼等功能 |
| 提高轉換率 | 減少註冊表單填寫，最高可提升 8 倍轉換率 |
| 跨平台一致性 | Web、Android、iOS 統一體驗 |
| 安全性 | 利用 Google 帳號的安全機制，減少密碼外洩風險 |

---

## 🔧 環境需求

- Google Cloud 專案（可新建立或使用現有專案）
- Google Apps Script 專案
- Google 試算表（綁定 GAS 專案）

---

## 📋 設定步驟

### 步驟 1：建立 Google Cloud 專案

1. 前往 [Google Cloud Console](https://console.cloud.google.com/)
2. 點擊左上角「選取專案」>「新增專案」
3. 輸入專案名稱（例如：`my-gas-auth-app`）
4. 點擊「建立」

### 步驟 2：設定 OAuth 同意畫面

1. 點擊左側選單：**「API 和服務」>「OAuth 同意畫面」**
2. 選擇使用者類型：
   - **Internal**：僅限 Google Workspace 組織內部使用者
   - **External**：開放給所有 Google 帳號使用者（含 @gmail.com）
3. 填寫必要資訊：
   - **應用程式名稱**：顯示在授權畫面的名稱
   - **使用者支援電子郵件**：使用者聯絡用 Email
   - **開發人員聯絡資訊**：您的 Email
4. 點擊「儲存並繼續」

### 步驟 3：設定範圍 (Scopes)

1. 在「OAuth 同意畫面」頁面，點擊「新增或移除範圍」
2. 勾選以下三個預設範圍（用於認證）：
   - `.../auth/userinfo.email` — 取得使用者 Email
   - `.../auth/userinfo.profile` — 取得使用者基本資料
   - `openid` — OpenID Connect 認證
3. 點擊「更新」>「儲存並繼續」

### 步驟 4：建立 OAuth 2.0 用戶端 ID

1. 點擊左側選單：**「API 和服務」>「憑證」**
2. 點擊上方 **「+ 建立憑證」>「OAuth 用戶端 ID」**
3. **應用程式類型**：選擇 **「Web 應用程式」**
4. **名稱**：方便辨識的名稱（例如：`GAS SPA Client`）
5. 設定 **已授權的 JavaScript 來源**：
   - 點擊「新增 URI」
   - 填入：`https://script.google.com`
6. 設定 **已授權的重新導向 URI**：
   - 點擊「新增 URI」
   - 填入：`https://script.google.com`
7. 點擊 **「建立」**

### 步驟 5：複製 Client ID

建立完成後，會彈出視窗顯示 **「您的用戶端 ID」**。

格式範例：`1234567890-abc123def456.apps.googleusercontent.com`

**請複製此 ID**，接下來要設定到 GAS 專案中。

---

## ⚙️ 整合到 GAS 專案

### 步驟 6：設定試算表參數

1. 開啟與 GAS 專案綁定的 **Google 試算表**
2. 找到或建立 **「網站參數設定」** 工作表
3. 在 **「OAuth Client ID」** 這一列的 **「參數內容」** 欄位中，貼上您的 Client ID
4. 儲存試算表

### 步驟 7：確認前端程式碼

您的 `index.html` 應該包含以下 GIS 整合程式碼：

#### 7.1 載入 GIS SDK

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>
```

#### 7.2 初始化 Google 認證

```javascript
function initGoogleAuth(clientId) {
    google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        auto_select: true
    });
    
    // 渲染登入按鈕
    google.accounts.id.renderButton(
        document.getElementById("g_id_signin"),
        { 
            theme: "outline", 
            size: "large", 
            width: "250", 
            shape: "pill" 
        }
    );
    
    // 顯示 One Tap 提示
    google.accounts.id.prompt();
}
```

#### 7.3 處理認證回應

```javascript
function handleCredentialResponse(response) {
    const idToken = response.credential;
    
    // 將 ID Token 傳送到後端驗證
    google.script.run
        .withSuccessHandler(function(resJson) {
            const res = JSON.parse(resJson);
            if (res.status === 'success') {
                // 登入成功
                loginSuccess(res.user);
            } else {
                // 登入失敗
                showUnauthorized(res.message);
            }
        })
        .withFailureHandler(function(err) {
            showError('伺服器驗證失敗：' + err);
        })
        .loginWithToken(idToken);
}
```

### 步驟 8：後端 Token 驗證

在 `Code.js` 中，使用 Google 的 Token Info API 驗證 ID Token：

```javascript
function validateIdToken(token) {
    if (!token) throw new Error("缺少 Token");
    
    // 取得專案的 Client ID
    const clientId = getWebsiteParameter("OAuth Client ID");
    
    // 呼叫 Google Token Info API 驗證
    // muteHttpExceptions: true 才能讀取非 2xx 回應（例如無效 Token 的 400）
    const response = UrlFetchApp.fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`,
        { muteHttpExceptions: true }
    );
    const result = JSON.parse(response.getContentText());
    
    if (response.getResponseCode() !== 200 || result.error) {
        throw new Error("Token 驗證失敗: " + (result.error_description || "無效的 Token"));
    }
    
    // 驗證 Audience（必須與專案的 Client ID 相符）
    if (clientId && result.aud !== clientId) {
        throw new Error("Token 的對象不符 (Audience mismatch)");
    }
    
    // 驗證 Issuer
    if (result.iss !== "accounts.google.com" && 
        result.iss !== "https://accounts.google.com") {
        throw new Error("無效的 Issuer");
    }
    
    return result;
}
```

> ⚠️ **正式環境注意事項**：`tokeninfo` 端點方便除錯，但 Google 官方文件指出該端點可能被限流或出現間歇性錯誤。低流量的 GAS 應用可直接使用；**高流量或正式環境建議改用本機 JWT 公鑰驗證**（下載 Google 公鑰並在本地驗證簽章），避免依賴遠端端點。詳見 [驗證 Google ID Token](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)。

---

## 🔐 安全性考量

### Content Security Policy (CSP)

如果您使用 CSP，需允許 GIS 相關網域：

```
Content-Security-Policy: 
    script-src https://accounts.google.com/gsi/client; 
    frame-src https://accounts.google.com/gsi/; 
    connect-src https://accounts.google.com/gsi/;
```

### Cross-Origin-Opener-Policy (COOP)

當 FedCM 停用時，需設定：

```
Cross-Origin-Opener-Policy: same-origin; same-origin-allow-popups
```

### 安全最佳實踐

1. **永遠不要在前端暴露 Client Secret**
2. **在後端驗證 ID Token**，不要僅依賴前端回傳的資訊
3. **驗證 Audience (aud)** 確保 Token 是發給您的應用程式
4. **驗證 Issuer (iss)** 確保 Token 來自 Google
5. **檢查 Token 過期時間** 雖然 Token Info API 會檢查，但建議雙重確認

---

## 🧪 測試與除錯

### 測試步驟

1. 部署 Web App（執行身分：我，存取權限：任何人）
2. 開啟 Web App 網址
3. 點擊 Google 登入按鈕
4. 完成 Google 帳號授權
5. 確認成功跳轉至儀表板

---

## ❓ 常見問題 (FAQ)

### Q1: 為什麼登入按鈕不出現？

**可能原因：**
1. Client ID 未正確設定或格式錯誤
2. Authorized JavaScript Origins 未正確設定
3. GIS SDK 載入失敗

**解決方案：**
- 確認 Client ID 格式為 `xxxxx.apps.googleusercontent.com`
- 確認 Authorized JavaScript Origins 設定為 `https://script.google.com`
- 檢查瀏覽器控制台是否有錯誤訊息
- 確認 `<script src="https://accounts.google.com/gsi/client">` 已正確載入

**相關討論：**
- [Stack Overflow: idpiframe_initialization_failed](https://www.xjavascript.com/blog/idpiframe-initialization-failed-in-google-sign-in-from-localhost)

---

### Q2: 出現 "Invalid origin: Uses a forbidden domain" 錯誤

**問題說明：**
GAS Web App 實際執行的網域是 `*.script.googleusercontent.com`，但 Google **不允許**將 `googleusercontent.com` 網域加入 Authorized JavaScript Origins。

**解決方案：**
使用 `https://script.google.com` 作為 Authorized JavaScript Origins（本專案已採用此設定）。

**相關討論：**
- [Stack Overflow: Invalid origin Uses a forbidden domain](https://stackoverflow.com/questions/65791839)
- [Google Issue Tracker #170740549](https://issuetracker.google.com/issues/170740549)
- [Google Developer Forums: Invalid Origin Error](https://discuss.google.dev/t/stuck-creating-oauth-client-id-app-script-invalid-origin-error-help-needed/183315)

---

### Q3: 出現 CORS 跨網域錯誤

**問題說明：**
GAS Web App **不支援 OPTIONS 預檢請求 (preflight)**，從外部網域直接呼叫 GAS 時會觸發 CORS 錯誤。

**解決方案：**
1. **推薦**：使用 `google.script.run` 內建呼叫（本專案已採用）
2. 或將 Content-Type 改為 `text/plain;charset=utf-8` 繞過預檢
3. 或使用 FormData 而非 JSON

**相關討論：**
- [Stack Overflow: CORS in Google Apps Script](https://stackoverflow.com/questions/79392832)
- [Medium: Struggling with CORS in Google Apps Script](https://diyavijay.medium.com/struggling-with-cors-in-google-apps-script-heres-the-fix-e3eec09f07dd)
- [Lambda IITH: Fixing CORS Errors in Google Apps Script](https://iith.dev/blog/app-script-cors/)

---

### Q4: 跨網域使用者登入後看不到 Email

**問題說明：**
在傳統 GAS「以我身分執行」模式下，無法取得不同網域使用者的 Email。

**解決方案：**
使用 GIS + JWT Token 驗證（本專案已採用此方案），前端取得 ID Token 後傳送到後端驗證，可準確取得跨網域使用者的 Email。

---

### Q5: 出現「未經驗證的應用程式」警告

**問題說明：**
OAuth 同意畫面設為 External 模式時，在通過 Google 審核前會看到此警告。

**解決方案：**
- 開發測試階段：點擊「進階」>「繼續前往」即可
- 正式上線：提交應用程式給 Google 審核

**相關文件：**
- [OAuth verification requirements](https://support.google.com/cloud/answer/9110914)

---

### Q6: One Tap 提示不出現

**可能原因：**
1. 使用者尚未登入 Google 帳號
2. 瀏覽器封鎖第三方 Cookie
3. 使用者曾關閉 One Tap 提示

**解決方案：**
- 確認 `google.accounts.id.prompt()` 已呼叫
- 檢查瀏覽器設定是否允許第三方 Cookie
- 使用 `google.accounts.id.prompt((notification) => console.log(notification))` 除錯

**相關文件：**
- [Display Google One Tap](https://developers.google.com/identity/gsi/web/guides/display-google-one-tap)

---

### Q7: Token 驗證失敗

**可能原因：**
1. Client ID 不符（前端與後端設定不一致）
2. Token 已過期
3. Token Info API 呼叫失敗

**解決方案：**
- 確認試算表中的 OAuth Client ID 與 GCP 設定一致
- 檢查 `validateIdToken` 函式的錯誤訊息
- 確認網路連線正常

**相關文件：**
- [Verify the Google ID token on your server side](https://developers.google.com/identity/gsi/web/guides/verify-google-id-token)

---

### Q8: GAS 網址經常變動導致設定失效

**問題說明：**
GAS 部署後的網址可能因重新部署而變動（例如 `script.googleusercontent.com` 網址改變）。

**解決方案：**
- 使用 `https://script.google.com` 作為 Authorized JavaScript Origins（不會變動）
- 部署時選擇「新增部署」而非「新增版本」，可保持網址不變

**相關討論：**
- [GitHub: Apps Script oauth2 scopes issues](https://github.com/google/google-api-javascript-client/issues/661)

---

## 📚 延伸學習資源

| 資源類型 | 連結 | 說明 |
| :--- | :--- | :--- |
| Codelab | [Sign in with Google button](https://codelabs.developers.google.com/codelabs/sign-in-with-google-button#0) | 實作登入按鈕 |
| Codelab | [One Tap prompt](https://codelabs.developers.google.com/codelabs/google-one-tap#0) | 實作 One Tap |
| 官方論壇 | [Google Workspace Developers](https://discuss.google.dev/c/google-workspace/20) | 官方社群討論 |
| Stack Overflow | [google-apps-script](https://stackoverflow.com/questions/tagged/google-apps-script) | 技術問答 |
| Reddit | [r/GoogleAppsScript](https://www.reddit.com/r/GoogleAppsScript/) | 非官方社群 |
| Issue Tracker | [Apps Script Issues](https://issuetracker.google.com/issues?q=status:open%20componentid:191640) | 問題回報 |

---

## 📖 相關文件

- [OAuth 2.0 認證申請與原理指南](./OAUTH_GUIDE.md)
- [README.md](../README.md)

---

## 🔄 版本資訊

| 日期 | 版本 | 變更內容 |
| :--- | :--- | :--- |
| 2026-07-22 | v1.0 | 初版建立 |
| 2026-07-22 | v1.1 | 新增 FAQ 與 GAS + GIS 整合相關資料來源 |

---

**最後更新：2026-07-22**
