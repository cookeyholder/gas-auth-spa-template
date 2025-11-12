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
 * 處理 GET 請求，顯示首頁
 */
function doGet(e) {
    // 取得目前使用者的 Email
    const userEmail = Session.getActiveUser().getEmail();

    // 檢查使用者是否已登入 Google 帳號
    if (!userEmail) {
        // 使用者未登入，顯示未授權頁面
        return HtmlService.createHtmlOutputFromFile("unauthorized")
            .setTitle("需要授權")
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
            .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    }

    // 取得網站網域設定
    const websiteDomain = getWebsiteParameter("網站網域");

    // 如果網站網域為空白，表示所有已登入的 Google 帳號都可以使用
    if (!websiteDomain || websiteDomain.trim() === "") {
        // 允許所有已登入的使用者訪問
        return HtmlService.createHtmlOutputFromFile("index")
            .setTitle("首頁")
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
            .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    }

    // 如果有設定網站網域，則檢查使用者是否在帳號管理表中
    const user = getCurrentUser();

    if (!user) {
        // 使用者未在帳號管理表中，顯示未授權頁面
        return HtmlService.createHtmlOutputFromFile("unauthorized")
            .setTitle("需要授權")
            .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
            .setSandboxMode(HtmlService.SandboxMode.IFRAME);
    }

    // 使用者已授權，顯示主頁面
    return HtmlService.createHtmlOutputFromFile("index")
        .setTitle("首頁")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
        .setSandboxMode(HtmlService.SandboxMode.IFRAME);
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
