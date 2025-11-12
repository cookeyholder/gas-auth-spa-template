# Google Apps Script 專案範本

這是一個基於 Google Apps Script 的 Web 應用程式範本，具備使用者認證和權限管理功能。

## 專案特色

- ✅ **內建認證系統**：使用 GAS 內建的 Google 帳號認證
- ✅ **權限管理**：透過「帳號管理」工作表控制存取權限
- ✅ **動態網站參數**：透過「網站參數設定」工作表自訂網站資訊
- ✅ **未授權頁面**：優雅的未授權使用者引導介面
- ✅ **本地開發支援**：使用 clasp 進行本地開發和版本控制

## 檔案說明

- `Code.js`: 後端主要程式碼
- `index.html`: 已授權使用者的主頁面
- `unauthorized.html`: 未授權使用者的引導頁面
- `appsscript.json`: 專案設定檔
- `README.md`: 專案說明文件

## 核心功能

### 後端函式 (Code.js)

#### Web 應用程式
- `doGet(e)`: 處理 HTTP GET 請求，根據授權狀態返回不同頁面

#### 使用者認證
- `getCurrentUser()`: 取得目前使用者資訊（JSON 字串）
- `getUserEmail()`: 取得目前使用者的 Email
- `checkUserPermission(email, role)`: 檢查使用者權限

#### 網站參數管理
- `getWebsiteParameters()`: 取得所有網站參數（JSON 字串）
- `getWebsiteParameter(paramName)`: 取得特定參數值

#### 帳號管理
- `getAccountSheet()`: 取得或建立「帳號管理」工作表
- `initializeAccountSheet()`: 初始化帳號工作表結構
- `showAddAccountDialog()`: 顯示新增帳號對話框
- `searchAccounts(searchTerm)`: 搜尋帳號
- `showSearchAccountDialog()`: 顯示搜尋帳號對話框

### 工作表結構

#### 「帳號管理」工作表

| 欄位 | 說明 | 必填 |
|------|------|------|
| Email | 使用者的 Google 帳號 Email | ✓ |
| 姓名 | 使用者姓名 | ✓ |
| 角色 | admin/editor/viewer | ✓ |
| 群組 | 所屬群組 | |
| 狀態 | 啟用/停用 | ✓ |
| 建立時間 | 帳號建立時間 | |
| 最後更新 | 最後更新時間 | |
| 備註 | 其他說明 | |

#### 「網站參數設定」工作表

| 參數項目 | 預設值 | 說明 |
|---------|--------|------|
| 網站名稱 | 我的應用程式 | 顯示在網頁標題和介面上的網站名稱 |
| 網站網域 | (空白) | Google Workspace 網域（例如：example.com） |
| 客服單位名稱 | 系統管理員 | 客服或支援單位的名稱 |

**注意**：您可以自由添加更多參數列，系統會自動讀取所有參數。

## 快速開始

### 1. 部署 Web 應用程式

1. 開啟 Google 試算表
2. 點選「擴充功能」→「Apps Script」
3. 將專案檔案上傳或複製到編輯器中
4. 點選「部署」→「新增部署作業」
5. 選擇類型：「網頁應用程式」
6. 設定：
   - **執行身分**：選擇「我」
   - **具有存取權的使用者**：選擇「任何人」或「僅限網域內的使用者」
7. 點選「部署」
8. 複製 Web 應用程式的 URL

### 2. 設定帳號管理

1. 在試算表中，會自動建立「帳號管理」工作表（首次執行時）
2. 添加使用者帳號資訊：
   ```
   Email                    | 姓名   | 角色   | 群組 | 狀態
   user@example.com        | 張三   | admin  |      | 啟用
   editor@example.com      | 李四   | editor |      | 啟用
   viewer@example.com      | 王五   | viewer |      | 啟用
   ```
3. 確保「狀態」欄位設為「啟用」

### 3. 自訂網站參數（選用）

1. 會自動建立「網站參數設定」工作表
2. 修改參數內容：
   - **網站名稱**：改為您的應用程式名稱（例如：「ABC 公司管理系統」）
   - **網站網域**：如果使用 Google Workspace，填入您的網域（例如：「abc.com」）
   - **客服單位名稱**：修改為您的客服單位名稱（例如：「資訊部」）
3. 可以新增更多自訂參數

### 4. 測試應用程式

1. 使用授權的帳號訪問 Web 應用程式 URL
2. 應該會看到主頁面並顯示使用者資訊
3. 使用未授權的帳號訪問，會看到引導頁面並可切換帳號

## 部署與管理

### 1. 安裝 clasp

首先，全域安裝 `@google/clasp` 套件：

```bash
npm install -g @google/clasp
```

### 2. 登入您的 Google 帳戶

在終端機執行以下命令並按照提示完成授權：

```bash
clasp login
```

這會開啟瀏覽器讓您授權 clasp 存取您的 Google 帳戶。

### 3. 下載已存在的 GAS 專案 (clasp pull)

如果您要下載一個已存在的 Google Apps Script 專案，請按照以下步驟：

#### 方法 1：使用專案 ID（推薦）

1. 首先，在已建立的 GAS 專案資料夾中初始化 clasp：
   ```bash
   clasp clone <SCRIPT_ID>
   ```
   
   其中 `<SCRIPT_ID>` 是您的 GAS 專案 ID。取得專案 ID 的方式：
   - 打開 Google Apps Script 編輯器
   - 點選左側「專案設定」
   - 複製「指令碼 ID」

2. 或者，如果您已經有一個本地資料夾配置了 `.clasp.json`，可以直接執行：
   ```bash
   clasp pull
   ```
   
   這會從遠端 GAS 專案下載最新的程式碼到本地。

#### 方法 2：建立新專案

如果要建立新的 GAS 專案並立即連結：

```bash
clasp create --type sheets --title "我的專案"
```

### 4. 上傳本地變更到 GAS

編輯完成後，將本地程式碼上傳到 Google Apps Script：

```bash
clasp push
```

### 5. 常用 clasp 命令

| 命令 | 說明 |
|------|------|
| `clasp login` | 登入 Google 帳戶 |
| `clasp logout` | 登出 Google 帳戶 |
| `clasp create [options]` | 建立新的 GAS 專案 |
| `clasp clone <SCRIPT_ID>` | 複製已存在的 GAS 專案 |
| `clasp pull` | 下載遠端程式碼到本地 |
| `clasp push` | 上傳本地程式碼到遠端 |
| `clasp status` | 查看同步狀態 |
| `clasp open` | 在瀏覽器中打開 GAS 編輯器 |
| `clasp deployments` | 列出所有部署版本 |
| `clasp deploy` | 部署新版本 |

## 認證機制說明

本專案使用 **Google Apps Script 內建的認證機制**，無需額外設定 OAuth Client ID。

### 運作方式

1. **自動 Google 登入**
   - 使用者訪問 Web 應用程式時，GAS 會自動要求 Google 登入
   - 使用 `Session.getActiveUser()` 取得已登入的使用者資訊

2. **授權檢查**
   - `doGet()` 函式會檢查使用者是否在「帳號管理」工作表中
   - 已授權使用者：顯示 `index.html` 主頁面
   - 未授權使用者：顯示 `unauthorized.html` 引導頁面

3. **權限層級**
   - **admin**：管理員，擁有所有權限
   - **editor**：編輯者，可以編輯內容
   - **viewer**：檢視者，只能檢視內容

### 優點

- ✅ 無需設定 OAuth Client ID
- ✅ 無需處理前端登入流程
- ✅ GAS 自動處理認證和 token 管理
- ✅ 與 Google Workspace 完美整合

### 完整工作流程範例

```bash
# 1. 登入 Google 帳戶
clasp login

# 2. 複製已存在的專案（使用指令碼 ID）
clasp clone "1a2b3c4d5e6f7g8h9i0j"

# 3. 進入專案資料夾
cd gasTemplate

# 4. 編輯程式碼（使用您喜歡的編輯器）
code .  # 或使用其他編輯器

# 5. 上傳變更到 GAS
clasp push

# 6. 在瀏覽器中查看
clasp open

# 7. 部署 Web 應用程式
# 在 GAS 編輯器中：部署 → 新增部署作業 → 網頁應用程式
```

## 常見問題 (FAQ)

### Q1: 如何新增授權使用者？

**A:** 在「帳號管理」工作表中新增一列，填入使用者的 Email、姓名、角色等資訊，並將「狀態」設為「啟用」。

### Q2: 使用者看到未授權頁面怎麼辦？

**A:** 確認以下事項：
1. 使用者的 Email 已加入「帳號管理」工作表
2. 「狀態」欄位為「啟用」
3. Email 地址完全正確（包括大小寫）
4. 使用者重新整理頁面

### Q3: 如何修改網站名稱？

**A:** 在「網站參數設定」工作表中，修改「網站名稱」列的「參數內容」欄位。頁面會自動載入新的名稱。

### Q4: 為什麼切換帳號按鈕沒反應？

**A:** 
1. 檢查瀏覽器 Console 是否有錯誤訊息
2. 確認網站參數已正確載入
3. 確認您的 GAS 專案已正確部署
4. 嘗試清除瀏覽器快取後重新整理

### Q5: 如何設定只允許特定網域的使用者登入？

**A:** 
1. 在「網站參數設定」工作表中填入「網站網域」（例如：abc.com）
2. 在部署 Web 應用程式時，選擇「僅限網域內的使用者」
3. 未授權頁面會自動顯示需要使用該網域的帳號登入

### Q6: 本地修改後如何更新到線上？

**A:** 執行 `clasp push` 即可上傳變更。注意：如果是 Web 應用程式的部署，可能需要建立新版本的部署。

### Q7: 如何查看執行紀錄和錯誤訊息？

**A:** 
1. 方法 1：在 GAS 編輯器中點選「執行」→「查看執行紀錄」
2. 方法 2：使用 `clasp logs` 指令查看最近的紀錄
3. 方法 3：在瀏覽器開發者工具的 Console 查看前端錯誤

## 自訂擴充

### 添加新的網站參數

在「網站參數設定」工作表中新增一列：

```
參數項目          | 參數內容              | 參數說明
公司電話          | 02-1234-5678         | 客服電話
營業時間          | 週一至週五 9:00-18:00 | 服務時間
```

在前端 JavaScript 中使用：

```javascript
google.script.run
    .withSuccessHandler(function(paramsJson) {
        const params = JSON.parse(paramsJson);
        const phone = params['公司電話'];
        const hours = params['營業時間'];
        // 使用參數...
    })
    .getWebsiteParameters();
```

### 修改頁面樣式

所有樣式都在 HTML 檔案的 `<style>` 標籤中，可以直接修改：

- **背景顏色**：修改 `body` 的 `background` 屬性
- **按鈕顏色**：修改 `.button` 的 `background` 屬性
- **字體**：修改 `body` 的 `font-family` 屬性

### 添加新的權限檢查

在 `Code.js` 中使用 `checkUserPermission()` 函式：

```javascript
function myProtectedFunction() {
    const userEmail = Session.getActiveUser().getEmail();
    
    // 檢查是否為管理員
    if (!checkUserPermission(userEmail, 'admin')) {
        throw new Error('權限不足');
    }
    
    // 執行受保護的操作...
}
```

## 安全性建議

1. **定期審查帳號**：定期檢查「帳號管理」工作表，移除不再需要的帳號
2. **最小權限原則**：給予使用者最低必要的權限（viewer < editor < admin）
3. **監控存取記錄**：定期查看執行紀錄，注意異常活動
4. **保護試算表**：限制試算表的編輯權限，只允許管理員編輯
5. **定期更新**：保持專案更新，修復已知的安全問題

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！

## 聯絡資訊

如有問題，請透過 GitHub Issues 聯絡。
