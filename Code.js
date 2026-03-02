/**
 * 當試算表開啟時執行的函式
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu("自訂選單")
        .addItem("執行範例函式", "exampleFunction")
        .addSeparator()
        .addSubMenu(
            ui
                .createMenu("帳號管理")
                .addItem("初始化帳號工作表", "initializeAccountSheet")
                .addItem("查詢帳號", "showSearchAccountDialog")
        )
        .addToUi();
}

/**
 * 範例函式
 */
function exampleFunction() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getActiveSheet();

    Logger.log("目前試算表名稱: " + ss.getName());
    Logger.log("目前工作表名稱: " + sheet.getName());

    SpreadsheetApp.getUi().alert("執行完成！");
}

/**
 * 取得資料範例
 */
function getData() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const range = sheet.getDataRange();
    const values = range.getValues();

    return values;
}

/**
 * 寫入資料範例
 */
function writeData() {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = [
        ["姓名", "年齡", "城市"],
        ["張三", 25, "台北"],
        ["李四", 30, "台中"],
        ["王五", 28, "高雄"],
    ];
    const rows = data.length;
    const cols = data[0].length;

    sheet.getRange(1, 1, rows, cols).setValues(data);
}

// ==================== Web 應用程式 ====================

/**
 * 處理 GET 請求，顯示首頁 (SPA 架構)
 */
function doGet(e) {
    // 在 SPA 架構中，doGet 僅負責返回 HTML 框架
    // 所有的身分驗證都在前端載入後透過 JWT 進行
    return HtmlService.createHtmlOutputFromFile("index")
        .setTitle("載入中...")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME)
        .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

// ==================== 認證中介層 ====================

/**
 * 驗證 Google ID Token (JWT)
 * @param {string} token - 前端傳來的 ID Token
 * @return {Object} 解析後的 Token 內容
 * @throws 如果驗證失敗則拋出錯誤
 */
function validateIdToken(token) {
    if (!token) throw new Error("缺少 Token");

    // 取得我們自己的 Client ID 以進行比對
    const clientId = getWebsiteParameter("OAuth Client ID");

    // 呼叫 Google 提供的驗證 API (Token Info)
    // 這是最簡單且安全的方法，省去處理 RSA 公鑰與簽章驗證的複雜度
    const response = UrlFetchApp.fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`
    );
    const result = JSON.parse(response.getContentText());

    if (response.getResponseCode() !== 200 || result.error) {
        throw new Error("Token 驗證失敗: " + (result.error_description || "無效的 Token"));
    }

    // 驗證 Audience (必須與我們的 Client ID 相符)
    // 注意：如果是開發環境尚未設定 Client ID，我們會顯示警告但暫時放行（或強制要求設定）
    if (clientId && result.aud !== clientId) {
        throw new Error("Token 的對象不符 (Audience mismatch)");
    }

    // 驗證 Issuer
    if (result.iss !== "accounts.google.com" && result.iss !== "https://accounts.google.com") {
        throw new Error("無效的 Issuer");
    }

    // 驗證是否過期 (Token Info API 通常已經幫我們檢查過了，但雙重確認無礙)
    const now = Math.floor(Date.now() / 1000);
    if (result.exp < now) {
        throw new Error("Token 已過期");
    }

    return result;
}

/**
 * 檢查 Email 是否符合存取權限 (網域與白名單)
 * @param {string} email - 要檢查的 Email
 * @return {Object} 包含成功與否以及使用者資料 (如果成功)
 */
function checkEmailPermission(email) {
    if (!email) return { success: false, reason: "缺少 Email" };

    // 1. 取得網站網域設定
    const websiteDomain = getWebsiteParameter("網站網域");

    // 2. 如果有設定網站網域，先檢查網域 (不分大小寫)
    if (websiteDomain && websiteDomain.trim() !== "") {
        const userDomain = email.split("@")[1];
        if (userDomain.toLowerCase() !== websiteDomain.toLowerCase()) {
            return { success: false, reason: `僅限使用 @${websiteDomain} 的帳號登入` };
        }
    }

    // 3. 檢查白名單 (帳號管理工作表)
    const user = getUserFromSheet(email);
    if (!user) {
        return { success: false, reason: "您的帳號尚未被授權存取此應用程式" };
    }

    // 4. 檢查帳號狀態
    if (user["狀態"] !== "啟用") {
        return { success: false, reason: "您的帳號已被停用，請聯絡管理員" };
    }

    return { success: true, user: user };
}
/**
 * 權限檢查中介層：驗證 Token 並確認角色是否符合要求
 * @param {string} token - 前端傳來的 ID Token
 * @param {string|string[]} requiredRoles - 允許的角色（單一字串或陣列）
 * @return {Object} 包含成功與否及使用者資料
 */
function verifyRole(token, requiredRoles) {
    try {
        // 1. 驗證 Token 合法性
        const decodedToken = validateIdToken(token);
        const email = decodedToken.email;

        // 2. 檢查 Email 存取權限與網域
        const permResult = checkEmailPermission(email);
        if (!permResult.success) {
            throw new Error(permResult.reason);
        }

        const user = permResult.user;

        // 3. 檢查角色權限
        if (requiredRoles) {
            const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
            if (!roles.includes(user["角色"])) {
                throw new Error(`權限不足：您的角色是 ${user["角色"]}，無法執行此操作`);
            }
        }

        return { success: true, user: user };
    } catch (e) {
        Logger.log(`權限驗證失敗: ${e.message}`);
        throw e; // 重新拋出錯誤讓前端抓到
    }
}
/**
 * 受保護的範例 API：取得角色專屬資料
 * @param {string} token - 前端傳來的 ID Token
 * @return {string} JSON 字串
 */
function getProtectedData(token) {
    try {
        // 驗證 Token (不限角色，只要合法即可)
        const result = verifyRole(token, null);
        const user = result.user;

        // 根據角色回傳不同資料
        let data = "";
        if (user["角色"] === "admin" || user["角色"] === "管理員") {
            data = "這是管理員專屬的系統統計資料...";
        } else if (user["角色"] === "teacher" || user["角色"] === "導師") {
            data = "這是導師專屬的班級學生名單...";
        } else {
            data = "這是學生個人的成績與作業資訊...";
        }

        return JSON.stringify({
            status: "success",
            data: data
        });
    } catch (e) {
        return JSON.stringify({
            status: "error",
            message: e.message
        });
    }
}

/**
 * 登入 API：前端傳入 Token，後端回傳使用者身分
...
 * @param {string} token - 前端傳來的 ID Token
 * @return {string} 包含結果的 JSON 字串
 */
function loginWithToken(token) {
    try {
        const result = verifyRole(token, null); // 登入時不限角色，只要在白名單內即可
        return JSON.stringify({
            status: "success",
            user: result.user
        });
    } catch (e) {
        return JSON.stringify({
            status: "error",
            message: e.message
        });
    }
}

/**
 * 從試算表取得指定 Email 的使用者資料
...
 * @param {string} email - 使用者 Email
 * @return {Object|null} 使用者物件，不存在則返回 null
 */
function getUserFromSheet(email) {
    const sheet = getAccountSheet();
    if (!sheet) return null;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol = headers.indexOf("Email");

    if (emailCol === -1) return null;

    for (let i = 1; i < data.length; i++) {
        if (data[i][emailCol].toString().trim().toLowerCase() === email.toLowerCase()) {
            const userObj = {};
            headers.forEach((header, index) => {
                userObj[header] = data[i][index];
            });
            return userObj;
        }
    }
    return null;
}

// ==================== 帳號管理功能 ====================

/**
 * 取得目前使用者資訊
 * @return {string|null} 使用者物件的 JSON 字串，如果不存在則返回 null
 */
function getCurrentUser() {
    const userEmail = Session.getActiveUser().getEmail();
    const sheet = getAccountSheet();

    if (!sheet) {
        Logger.log("帳號管理工作表不存在");
        return null;
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol = headers.indexOf("Email");

    // 檢查 Email 欄位是否存在
    if (emailCol === -1) {
        Logger.log("找不到 Email 欄位");
        return null;
    }

    // 尋找使用者
    for (let i = 1; i < data.length; i++) {
        Logger.log("檢查 email: " + data[i][emailCol]);
        if (data[i][emailCol] === userEmail) {
            // 建立使用者物件
            const userObj = {};
            headers.forEach((header, index) => {
                const value = data[i][index];
                userObj[header] = value;
            });

            // 直接回傳 JSON 字串
            return JSON.stringify(userObj);
        }
    }

    // 使用者不存在於帳號工作表中
    Logger.log("使用者 " + userEmail + " 不在帳號管理工作表中");
    return null;
}

/**
 * 取得目前使用者的 Email
 * @return {string} 使用者的 Email
 */
function getUserEmail() {
    const email = Session.getActiveUser().getEmail();
    Logger.log("使用者 Email: " + email);
    return email;
}

/**
 * 取得網站參數設定
 * @param {string} paramName - 參數項目名稱（例如：「網站名稱」或「網站網域」）
 * @return {string} 參數內容，如果找不到則返回預設值
 */
function getWebsiteParameter(paramName) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName("網站參數設定");

        // 如果工作表不存在，建立並初始化
        if (!sheet) {
            sheet = ss.insertSheet("網站參數設定");
            const headers = [["參數項目", "參數內容", "參數說明"]];
            const defaultData = [
                ["網站名稱", "我的應用程式", "顯示在網頁標題列的網站名稱"],
                ["網站網域", "", "Google Workspace 網域（例如：example.com）"],
                ["客服單位名稱", "系統管理員", "客服或支援單位的名稱"],
                ["OAuth Client ID", "", "Google Cloud Console 產生的 OAuth 2.0 用戶端 ID"],
            ];
            sheet.getRange(1, 1, 1, 3).setValues(headers);
            sheet.getRange(2, 1, defaultData.length, 3).setValues(defaultData);
            sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
            sheet.autoResizeColumns(1, 3);
            Logger.log("已建立「網站參數設定」工作表");
        }

        const data = sheet.getDataRange().getValues();

        // 從第二行開始查找（第一行是標題）
        for (let i = 1; i < data.length; i++) {
            if (data[i][0] === paramName) {
                Logger.log(`取得參數 ${paramName}: ${data[i][1]}`);
                return data[i][1];
            }
        }

        // 如果找不到參數，返回預設值
        Logger.log(`找不到參數 ${paramName}，使用預設值`);
        if (paramName === "網站名稱") return "我的應用程式";
        if (paramName === "網站網域") return "";
        return "";
    } catch (error) {
        Logger.log("取得網站參數時發生錯誤: " + error);
        if (paramName === "網站名稱") return "我的應用程式";
        if (paramName === "網站網域") return "";
        return "";
    }
}

/**
 * 取得所有網站參數（供前端使用）
 * 從「網站參數設定」工作表讀取所有參數，以「參數項目」為 key，「參數內容」為 value
 * @return {string} JSON 字串
 */
function getWebsiteParameters() {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        let sheet = ss.getSheetByName("網站參數設定");

        // 如果工作表不存在，建立並初始化
        if (!sheet) {
            sheet = ss.insertSheet("網站參數設定");
            const headers = [["參數項目", "參數內容", "參數說明"]];
            const defaultData = [
                ["網站名稱", "我的應用程式", "顯示在網頁標題列的網站名稱"],
                ["網站網域", "", "Google Workspace 網域（例如：example.com）"],
                ["客服單位名稱", "系統管理員", "客服或支援單位的名稱"],
                ["OAuth Client ID", "", "Google Cloud Console 產生的 OAuth 2.0 用戶端 ID"],
            ];
            sheet.getRange(1, 1, 1, 3).setValues(headers);
            sheet.getRange(2, 1, defaultData.length, 3).setValues(defaultData);
            sheet.getRange(1, 1, 1, 3).setFontWeight("bold");
            sheet.autoResizeColumns(1, 3);
            Logger.log("已建立「網站參數設定」工作表");
        }

        const data = sheet.getDataRange().getValues();
        const params = {};

        // 從第二行開始讀取（第一行是標題）
        // 以「參數項目」(第0欄) 為 key，「參數內容」(第1欄) 為 value
        for (let i = 1; i < data.length; i++) {
            const paramKey = data[i][0];
            const paramValue = data[i][1];

            // 只處理有參數名稱的列
            if (paramKey && paramKey.toString().trim() !== "") {
                params[paramKey] = paramValue;
                Logger.log(`載入參數: ${paramKey} = ${paramValue}`);
            }
        }

        Logger.log("所有網站參數已載入: " + JSON.stringify(params));
        return JSON.stringify(params);
    } catch (error) {
        Logger.log("取得網站參數時發生錯誤: " + error);
        // 返回預設值
        return JSON.stringify({
            網站名稱: "我的應用程式",
            網站網域: "",
            客服單位名稱: "系統管理員",
        });
    }
}

/**
 * 取得或建立帳號工作表
 */
function getAccountSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("帳號管理");

    if (!sheet) {
        sheet = ss.insertSheet("帳號管理");
        initializeAccountSheet(false); // 自動建立時不顯示訊息
    }

    return sheet;
}

/**
 * 初始化帳號工作表
 * @param {boolean} showAlert - 是否顯示完成訊息，預設為 true
 */
function initializeAccountSheet(showAlert = true) {
    const sheet = getAccountSheet();
    const headers = [
        "Email",
        "姓名",
        "人員編號",
        "部門單位",
        "群組",
        "狀態",
        "備註",
    ];

    // 清除工作表所有內容
    sheet.clear();

    // 設定整個工作表的字體大小為 12
    sheet.getDataRange().setFontSize(12);

    // 設定標題列
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet
        .getRange(1, 1, 1, headers.length)
        .setBackground("#4285f4")
        .setFontColor("#ffffff")
        .setFontWeight("bold");

    // 凍結標題列
    sheet.setFrozenRows(1);

    // 設定欄位寬度
    sheet.setColumnWidth(1, 200); // Email
    sheet.setColumnWidth(2, 120); // 姓名
    sheet.setColumnWidth(3, 120); // 人員編號
    sheet.setColumnWidth(4, 150); // 部門單位
    sheet.setColumnWidth(5, 120); // 群組
    sheet.setColumnWidth(6, 80); // 狀態
    sheet.setColumnWidth(7, 200); // 備註

    // 刪除多餘的欄位（從第9欄開始到最後一欄）
    const maxColumns = sheet.getMaxColumns();
    if (maxColumns > headers.length) {
        sheet.deleteColumns(headers.length + 1, maxColumns - headers.length);
    }

    // 只在手動執行時顯示訊息
    if (showAlert) {
        SpreadsheetApp.getUi().alert("帳號工作表初始化完成！");
    }
}

/**
 * 搜尋帳號
 * @param {string} searchTerm - 搜尋關鍵字
 * @return {Array}
 */
function searchAccounts(searchTerm) {
    const sheet = getAccountSheet();
    const data = sheet.getDataRange().getValues();
    const results = [];

    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (
            row.some((cell) =>
                cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
        ) {
            results.push({
                email: row[0],
                name: row[1],
                employeeId: row[2],
                department: row[3],
                group: row[4],
                status: row[5],
            });
        }
    }

    return results;
}

/**
 * 顯示搜尋帳號對話框
 */
function showSearchAccountDialog() {
    const ui = SpreadsheetApp.getUi();

    const response = ui.prompt(
        "搜尋帳號",
        "請輸入搜尋關鍵字 (Email、姓名等):",
        ui.ButtonSet.OK_CANCEL
    );

    if (response.getSelectedButton() !== ui.Button.OK) return;

    const results = searchAccounts(response.getResponseText());

    if (results.length === 0) {
        ui.alert("找不到符合的帳號");
        return;
    }

    let message = `找到 ${results.length} 個帳號:\n\n`;
    results.forEach((account) => {
        message += `Email: ${account.email}\n`;
        message += `姓名: ${account.name}\n`;
        message += `人員編號: ${account.employeeId || "(未設定)"}\n`;
        message += `部門單位: ${account.department || "(未設定)"}\n`;
        message += `群組: ${account.group || "(未設定)"}\n`;
        message += `狀態: ${account.status}\n`;
        message += "---\n";
    });

    ui.alert("搜尋結果", message, ui.ButtonSet.OK);
}

/**
 * 開發階段測試函式：模擬身分驗證流程
 * 可在 Apps Script 編輯器中手動執行
 */
function testAuthScenarios() {
    const mockEmail = "student@example.com";
    Logger.log(`[測試] 模擬帳號: ${mockEmail}`);

    const result = checkEmailPermission(mockEmail);
    if (result.success) {
        Logger.log("✅ 權限檢查通過");
        Logger.log("使用者資料: " + JSON.stringify(result.user));
    } else {
        Logger.log("❌ 權限檢查失敗: " + result.reason);
    }
}
