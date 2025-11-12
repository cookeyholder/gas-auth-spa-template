# Google Apps Script 專案

這是一個基本的 Google Apps Script 專案範本。

## 檔案說明

- `Code.js`: 主要程式碼檔案
- `appsscript.json`: 專案設定檔

## 功能

- `onOpen()`: 當試算表開啟時自動建立自訂選單
- `exampleFunction()`: 範例函式，顯示試算表和工作表名稱
- `getData()`: 取得工作表中的所有資料
- `writeData()`: 寫入範例資料到工作表

## 使用方式

1. 開啟 Google 試算表
2. 點選「擴充功能」→「Apps Script」
3. 將程式碼複製到編輯器中
4. 儲存並執行函式

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

## Google Identity Services 設定

本專案使用 Google Identity Services 進行使用者認證。如果您要啟用前端的 Google Sign-In 功能，需要進行以下設定：

### 取得 Google Client ID 的步驟

#### 1. 前往 Google Cloud Console

訪問 [Google Cloud Console](https://console.cloud.google.com/)

#### 2. 建立新專案（如果還沒有）

1. 在頁面上方點選「Select a Project」
2. 點選「NEW PROJECT」
3. 輸入專案名稱（例如：「GAS Template」）
4. 點選「CREATE」
5. 等待專案建立完成

#### 3. 啟用必要的 APIs

1. 在左側選單中點選「APIs & Services」→「Library」
2. 搜尋「Google+ API」
3. 點選結果中的「Google+ API」
4. 點選「ENABLE」按鈕
5. 等待啟用完成

#### 4. 建立 OAuth 2.0 認證憑證

1. 在左側選單中點選「APIs & Services」→「Credentials」
2. 點選「+ CREATE CREDENTIALS」按鈕
3. 選擇「OAuth client ID」
4. 如果提示需要配置 OAuth 同意畫面，先點選「CONFIGURE CONSENT SCREEN」：
   - 選擇「External」用戶類型
   - 點選「CREATE」
   - 填寫必要資訊（App name、User support email 等）
   - 點選「SAVE AND CONTINUE」直到完成
5. 回到 Credentials 頁面，再次點選「+ CREATE CREDENTIALS」→「OAuth client ID」
6. 選擇應用程式類型為「Web application」
7. 在「Authorized JavaScript origins」中添加：
   - `https://script.google.com`
   - `https://script.googleusercontent.com`
8. 點選「CREATE」

#### 5. 複製 Client ID

1. 在 Credentials 頁面找到您剛建立的 OAuth 2.0 Client ID
2. 點選該項目以查看詳細資訊
3. 複製「Client ID」值

### 在專案中使用 Client ID

1. 開啟 `index.html` 檔案
2. 找到以下行：
   ```javascript
   client_id: 'YOUR_GOOGLE_CLIENT_ID', // 需要替換為實際的 Client ID
   ```
3. 將 `YOUR_GOOGLE_CLIENT_ID` 替換為您複製的 Client ID：
   ```javascript
   client_id: '1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
   ```
4. 儲存檔案並執行 `clasp push` 上傳變更

### 完整工作流程範例

```bash
# 1. 登入
clasp login

# 2. 複製已存在的專案（使用指令碼 ID）
clasp clone "1a2b3c4d5e6f7g8h9i0j"

# 3. 進入專案資料夾
cd 我的專案

# 4. 編輯程式碼（使用編輯器修改檔案）

# 5. 設定 Google Client ID（在 index.html 中）

# 6. 上傳變更
clasp push

# 7. 在瀏覽器中查看
clasp open
```
