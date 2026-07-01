"use strict";
const express = require("express");
const sql = require("mssql");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config = require("../config");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
module.exports = router;
function encryptPasswordMD5Base64(plainText) {
    const md5Hash = crypto.createHash("md5").update(plainText, "utf8").digest();
    return Buffer.from(md5Hash).toString("base64");
}
//POST /Login
router.post("/Login", async (req, res) => {
    const { employeeId, password } = req.body;
    const clientIp = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress;
    try {
        await sql.connect(config);
        const encryptedPassword = encryptPasswordMD5Base64(password.trim());
        // Check if username exists
        const userCheckRequest = new sql.Request();
        userCheckRequest.input("UserName", sql.VarChar(50), employeeId.trim());
        const userExistsResult = await userCheckRequest.query(`SELECT Ustatus FROM Mast_User_Privileges WITH (NOLOCK) WHERE UserName = @UserName`);
        if (userExistsResult.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Invalid UserName.",
            });
        }
        const userStatus = userExistsResult.recordset[0].Ustatus;
        if (userStatus === "I") {
            return res.status(401).json({
                success: false,
                message: "User is Inactive. You cannot login.",
            });
        }
        const passwordCheckRequest = new sql.Request();
        passwordCheckRequest.input("UserName", sql.VarChar(50), employeeId.trim());
        passwordCheckRequest.input("Password", sql.VarChar(50), encryptedPassword);
        const passwordCheckResult = await passwordCheckRequest.query(`SELECT Txn_ID, UserName, Password, MBRI_ID, EII_EMP_ID,GROUP_TXN_ID
       FROM Mast_User_Privileges WITH (NOLOCK)
       WHERE UserName = @UserName
         AND Password COLLATE Latin1_General_CS_AS = @Password`);
        if (passwordCheckResult.recordset.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Password Incorrect! Please Enter Valid Password.",
            });
        }
        const user = passwordCheckResult.recordset[0];
        // Generate JWT token
        const token = jwt.sign({
            userId: user.Txn_ID,
            username: user.UserName,
            GROUPTXN_ID: user.GROUP_TXN_ID
        }, process.env.JWT_SECRET, { expiresIn: "1h" });
        return res.json({
            success: true,
            message: "Login successful",
            token,
            user,
        });
    }
    catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({
            success: false,
            error: "Internal server error",
        });
    }
});
// POST /LogOut
const tokenBlacklist = new Set();
router.post("/LogOut", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Uid", sql.Int, req.user.userId);
        const result = await request.execute("Usp_Login_Attendence");
        const token = req.headers.authorization.split(" ")[1];
        tokenBlacklist.add(token);
        res.json({
            success: true,
            message: "Logout successful"
        });
    }
    catch (error) {
        console.error("Logout error:", error);
        res.status(500).json({ success: false, message: "Logout failed" });
    }
});
router.post("/menu", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const groupTxnId = req.user.GROUPTXN_ID;
        const request = new sql.Request();
        request.input("GroupTxnId", sql.Int, groupTxnId);
        const mainResult = await request.query(`

 SELECT 
        TXN_ID,
        APPNAME AS Label,
        APP_ICON AS Icon,
        COLOR
      FROM APPS (NOLOCK)
      WHERE PARENT_APP_TXN_ID IS NULL
        AND TXN_ID IN (
          SELECT b.PARENT_APP_TXN_ID FROM APPS_AUTHORIZATION(NOLOCK) a 
		  join APPS(NOLOCK) b on a.APPS_TXN_ID=b.TXN_ID WHERE GROUP_TXN_ID = @GroupTxnId AND PERMISSIONTYPE = 'D'
        )
      ORDER BY TXN_ID

    `);
        const subResult = await request.query(`
      SELECT 
        a.TXN_ID, 
        a.APPNAME AS Label, 
        a.APPID, 
        a.STATUS, 
        a.PARENT_APP_TXN_ID, 
        a.APP_ICON AS Icon, 
        a.[ACTION], 
        a.[COLOR]
      FROM APPS (NOLOCK) a
      INNER JOIN APPS_AUTHORIZATION (NOLOCK) b ON a.TXN_ID = b.APPS_TXN_ID
      WHERE b.GROUP_TXN_ID = @GroupTxnId
        AND b.PERMISSIONTYPE = 'D'
        AND a.PARENT_APP_TXN_ID IS NOT NULL
      ORDER BY a.TXN_ID
    `);
        // Map subItems by parent ID
        const subItemsMap = {};
        subResult.recordset.forEach(item => {
            if (!subItemsMap[item.PARENT_APP_TXN_ID]) {
                subItemsMap[item.PARENT_APP_TXN_ID] = [];
            }
            subItemsMap[item.PARENT_APP_TXN_ID].push({
                id: item.TXN_ID.toString(),
                label: item.Label,
                action: item.ACTION,
                cardKey: item.APPID,
                icon: item.Icon,
                color: item.COLOR,
            });
        });
        const menu = mainResult.recordset.map(main => ({
            id: main.TXN_ID.toString(),
            label: main.Label,
            icon: main.Icon,
            color: main.COLOR,
            subItems: subItemsMap[main.TXN_ID] || [],
        }));
        res.json(menu);
    }
    catch (error) {
        console.error("Error fetching menu:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
module.exports = router;
//# sourceMappingURL=login.js.map