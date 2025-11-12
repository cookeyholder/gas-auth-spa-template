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
                .addItem("檢查權限", "checkPermissions")
                .addItem("初始化帳號工作表", "initializeAccountSheet")
                .addItem("新增帳號", "showAddAccountDialog")
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
    return HtmlService.createHtmlOutputFromFile("index")
        .setTitle("首頁")
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
 * 驗證 Google ID Token（簡化版本）
 * 在實際應用中應該使用 Google API 進行驗證
 * @param {string} token - Google ID Token
 * @return {Object} 驗證結果 {success: boolean, message: string}
 */
function verifyGoogleToken(token) {
    try {
        // 注意：在實際應用中，應該使用 Google 的驗證 API
        // 例如：https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=TOKEN

        // 這是一個簡化版本，實際上應該：
        // 1. 解析 JWT
        // 2. 驗證簽名
        // 3. 檢查過期時間

        Logger.log("收到 Google ID Token 進行驗證");
        Logger.log("Token (前50字):" + token.substring(0, 50) + "...");

        // 簡單驗證：token 不能為空
        if (!token || token.length === 0) {
            return {
                success: false,
                message: "Token 無效或為空",
            };
        }

        // 重新檢查使用者
        const currentUser = getCurrentUser();
        if (currentUser) {
            return {
                success: true,
                message: "使用者已驗證",
            };
        } else {
            return {
                success: false,
                message: "使用者帳號未被授權",
            };
        }
    } catch (error) {
        Logger.log("Token 驗證出錯: " + error);
        return {
            success: false,
            message: "Token 驗證失敗: " + error,
        };
    }
}

/**
 * 檢查使用者權限
 * @param {string} email - 使用者 email
 * @param {string} requiredRole - 需要的角色 (admin/editor/viewer)
 * @return {boolean}
 */
function checkUserPermission(email, requiredRole = "viewer") {
    const sheet = getAccountSheet();
    if (!sheet) return false;

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const emailCol = headers.indexOf("Email");
    const roleCol = headers.indexOf("角色");
    const statusCol = headers.indexOf("狀態");

    for (let i = 1; i < data.length; i++) {
        if (data[i][emailCol] === email && data[i][statusCol] === "啟用") {
            const userRole = data[i][roleCol];
            const roleHierarchy = { admin: 3, editor: 2, viewer: 1 };
            return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
        }
    }
    return false;
}

/**
 * 檢查目前使用者權限
 */
function checkPermissions() {
    const user = getCurrentUser();
    const ui = SpreadsheetApp.getUi();

    const isAdmin = checkUserPermission(user.email, "admin");
    const isEditor = checkUserPermission(user.email, "editor");
    const isViewer = checkUserPermission(user.email, "viewer");

    let message = `Email: ${user.email}\n\n權限狀態:\n`;
    message += `管理員: ${isAdmin ? "✓" : "✗"}\n`;
    message += `編輯者: ${isEditor ? "✓" : "✗"}\n`;
    message += `檢視者: ${isViewer ? "✓" : "✗"}`;

    ui.alert("權限檢查", message, ui.ButtonSet.OK);
}

/**
 * 取得或建立帳號工作表
 */
function getAccountSheet() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName("帳號管理");

    if (!sheet) {
        sheet = ss.insertSheet("帳號管理");
        initializeAccountSheet();
    }

    return sheet;
}

/**
 * 初始化帳號工作表
 */
function initializeAccountSheet() {
    const sheet = getAccountSheet();
    const headers = [
        "Email",
        "姓名",
        "角色",
        "群組",
        "狀態",
        "建立時間",
        "最後更新",
        "備註",
    ];

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
    sheet.setColumnWidth(3, 100); // 角色
    sheet.setColumnWidth(4, 120); // 群組
    sheet.setColumnWidth(5, 80); // 狀態
    sheet.setColumnWidth(6, 150); // 建立時間
    sheet.setColumnWidth(7, 150); // 最後更新
    sheet.setColumnWidth(8, 200); // 備註

    SpreadsheetApp.getUi().alert("帳號工作表初始化完成！");
}

/**
 * 顯示新增帳號對話框
 */
function showAddAccountDialog() {
    const ui = SpreadsheetApp.getUi();

    // 檢查權限
    const currentUser = getCurrentUser();
    if (!checkUserPermission(currentUser.email, "admin")) {
        ui.alert("權限不足", "只有管理員可以新增帳號", ui.ButtonSet.OK);
        return;
    }

    // 確保帳號工作表存在
    const sheet = getAccountSheet();

    // 切換到帳號工作表
    SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);

    ui.alert(
        "新增帳號",
        "請直接在「帳號管理」工作表中新增一列資料。\n\n" +
            "欄位說明：\n" +
            "• Email: 使用者的電子郵件\n" +
            "• 姓名: 使用者姓名\n" +
            "• 角色: admin/editor/viewer\n" +
            "• 群組: 所屬群組（選填）\n" +
            "• 狀態: 啟用/停用\n" +
            "• 建立時間: 自動記錄當前時間\n" +
            "• 最後更新: 自動記錄當前時間\n" +
            "• 備註: 其他說明（選填）",
        ui.ButtonSet.OK
    );
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
                role: row[2],
                group: row[3],
                status: row[4],
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
        message += `角色: ${account.role}\n`;
        message += `群組: ${account.group || "(未設定)"}\n`;
        message += `狀態: ${account.status}\n`;
        message += "---\n";
    });

    ui.alert("搜尋結果", message, ui.ButtonSet.OK);
}
