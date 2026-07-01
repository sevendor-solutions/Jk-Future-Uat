"use strict";
const express = require("express");
const sql = require("mssql");
const config = require("../config");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
// in screen  Wise FIeld Map
router.get("/FieldDHOMfetch", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        const result = await request.query(`
      SELECT Txn_ID, APPNAME, APPKEY, FIELDNAME, FIELDID, DHOM
      FROM MAST_CONFIG_DHOM_INFO WITH (NOLOCK)
    `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.post("/FieldDHOMsave", authenticateToken, async (req, res) => {
    const records = req.body;
    if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: "Invalid data or empty array" });
    }
    try {
        await sql.connect(config);
        const transaction = new sql.Transaction();
        await transaction.begin();
        let hasErrors = false;
        const results = [];
        try {
            for (const record of records) {
                const { Txn_ID, DHOM } = record;
                try {
                    const request = new sql.Request(transaction);
                    request.input("Txn_ID", sql.Int, Txn_ID);
                    request.input("DHOM", sql.VarChar(10), DHOM);
                    request.input("CREATED_DATE", sql.DateTime, new Date());
                    request.input("USERID", sql.Int, req.user.userId);
                    await request.query(`
            UPDATE MAST_CONFIG_DHOM_INFO
            SET 
              DHOM = @DHOM,
              CREATED_DATE = CASE 
                WHEN ISNULL(CONVERT(VARCHAR, CREATED_DATE), '') = '' THEN @CREATED_DATE 
                ELSE CREATED_DATE 
              END,
              MODIFIED_DATE = CASE 
                WHEN ISNULL(CONVERT(VARCHAR, CREATED_DATE), '') <> '' THEN @CREATED_DATE 
                ELSE NULL 
              END,
USERID= CASE 
    WHEN USERID IS  NULL OR @USERID = '' OR @USERID = '0' THEN @USERID
    ELSE USERID
END,

MODIFIED_USERID = @USERID

            OUTPUT 
              inserted.Txn_ID,
              inserted.APPNAME,
              inserted.APPKEY,
              inserted.FIELDNAME,
              inserted.FIELDID,
              inserted.DHOM,
              inserted.CREATED_DATE,
              inserted.MODIFIED_DATE,
                inserted.USERID,
              inserted.MODIFIED_USERID,
              Getdate() AS AUDIT_DATE
            INTO Audit_MAST_CONFIG_DHOM_INFO 
              (Txn_ID, APPNAME, APPKEY, FIELDNAME, FIELDID, DHOM, CREATED_DATE, MODIFIED_DATE,USERID,MODIFIED_USERID, AUDIT_DATE)
            WHERE Txn_ID = @Txn_ID
          `);
                    results.push({ Txn_ID, status: "success" });
                }
                catch (innerErr) {
                    hasErrors = true;
                    results.push({
                        Txn_ID,
                        status: "error",
                        message: innerErr.message || "Unknown error",
                    });
                }
            }
            if (hasErrors) {
                await transaction.rollback();
                return res.status(400).json({
                    message: "One or more records failed",
                    results,
                });
            }
            await transaction.commit();
            res.json({
                message: "All records updated successfully",
                results,
            });
        }
        catch (err) {
            await transaction.rollback();
            console.error("Transaction error:", err);
            res.status(500).json({ error: err.message });
        }
    }
    catch (err) {
        console.error("Connection error:", err);
        res.status(500).json({ error: err.message });
    }
});
// in screen  Wise FIeld hide show
router.get('/field-configs', authenticateToken, async (req, res) => {
    const { pageId } = req.query;
    if (!pageId) {
        return res.status(400).json({ error: 'Missing pageId query parameter' });
    }
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('pageId', sql.VarChar, pageId);
        const result = await request.query(`
      SELECT FIELDID AS fieldId, FIELDNAME AS fieldName, DHOM
      FROM MAST_CONFIG_DHOM_INFO WITH (NOLOCK)
      WHERE APPKEY = @pageId
    `);
        res.json(result.recordset);
    }
    catch (error) {
        console.error('Error fetching field config:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// APP Groups Data Fetch
router.get("/getGroups", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query(`
      SELECT TXN_ID, GROUPNAME, GROUPDESCRIPTION, STATUS FROM APPS_GROUPS WITH (NOLOCK)
    `);
        res.status(200).json(result.recordset);
    }
    catch (err) {
        console.error("Error fetching groups:", err);
        res.status(500).json({ message: "Failed to fetch groups" });
    }
});
// APP Groups Save
router.post("/saveOrUpdateGroup", authenticateToken, async (req, res) => {
    const { id, groupName, description, status } = req.body;
    if (!groupName || !status) {
        return res.status(400).json({ message: "Group name and status are required" });
    }
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("groupName", sql.VarChar(100), groupName);
        request.input("description", sql.VarChar(255), description || "");
        request.input("status", sql.Char(1), status);
        if (id) {
            request.input("id", sql.Int, id);
            const result = await request.query(`
        UPDATE APPS_GROUPS
        SET GROUPNAME = @groupName,
            GROUPDESCRIPTION = @description,
            STATUS = @status
        WHERE TXN_ID = @id
      `);
            if (result.rowsAffected[0] === 0) {
                return res.status(404).json({ message: "Group not found for update" });
            }
            res.status(200).json({ message: "Group updated successfully" });
        }
        else {
            await request.query(`
        INSERT INTO APPS_GROUPS (GROUPNAME, GROUPDESCRIPTION, STATUS)
        VALUES (@groupName, @description, @status)
      `);
            res.status(200).json({ message: "Group saved successfully" });
        }
    }
    catch (err) {
        console.error("Error saving/updating group:", err);
        res.status(500).json({ message: "Failed to save/update the group" });
    }
});
// APP AUTORIZATION GROUPS DROPDOWN
router.get("/GROUPSDROPDOWN", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const result = await sql.query(`
      SELECT TXN_ID, GROUPNAME 
      FROM APPS_GROUPS 
      WHERE STATUS = 'A'  
    `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/APPSGRIDAPI", authenticateToken, async (req, res) => {
    const groupTxnId = req.query.groupTxnId;
    if (!groupTxnId) {
        return res.status(400).json({ error: "Missing groupTxnId parameter" });
    }
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('GROUP_TXN_ID', sql.Int, groupTxnId);
        const result = await request.query(`
      SELECT A.*, B.TXN_ID AUTHORIZATION_TXN_ID, B.PERMISSIONTYPE 
      FROM (
        SELECT 
          A.TXN_ID, A.APPNAME MODULE, 
          B.TXN_ID APPTXN_ID, B.APPID, B.APPNAME, B.STATUS
        FROM APPS (NOLOCK) A 
        JOIN APPS (NOLOCK) B ON A.TXN_ID = B.PARENT_APP_TXN_ID
        WHERE ISNULL(A.PARENT_APP_TXN_ID,'') = '' AND B.STATUS = 'A'
      ) A
      LEFT JOIN APPS_AUTHORIZATION (NOLOCK) B ON A.APPTXN_ID = B.APPS_TXN_ID AND B.GROUP_TXN_ID = @GROUP_TXN_ID
      ORDER BY A.TXN_ID, A.APPTXN_ID
    `);
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.post("/SAVE_DHOM_API_ENDPOINT", authenticateToken, async (req, res) => {
    const records = req.body;
    if (!Array.isArray(records) || records.length === 0) {
        return res.status(400).json({ error: "Invalid or empty input data." });
    }
    try {
        await sql.connect(config);
        const transaction = new sql.Transaction();
        await transaction.begin();
        const results = [];
        try {
            for (const item of records) {
                const { TXN_ID, APPTXN_ID, dhom, AUTHORIZATION_TXN_ID } = item;
                if (typeof TXN_ID !== "number" ||
                    typeof APPTXN_ID !== "number" ||
                    typeof dhom !== "string") {
                    throw new Error(`Invalid record format: ${JSON.stringify(item)}`);
                }
                const request = new sql.Request(transaction);
                if (AUTHORIZATION_TXN_ID && typeof AUTHORIZATION_TXN_ID === "number") {
                    // Update existing record
                    request.input("AUTHORIZATION_TXN_ID", sql.Int, AUTHORIZATION_TXN_ID);
                    request.input("TXN_ID", sql.Int, TXN_ID);
                    request.input("APPTXN_ID", sql.Int, APPTXN_ID);
                    request.input("DHOM", sql.VarChar(10), dhom);
                    await request.query(`
            UPDATE APPS_AUTHORIZATION
            SET
              APPS_TXN_ID = @APPTXN_ID,
              GROUP_TXN_ID = @TXN_ID,
              PERMISSIONTYPE = @DHOM,
              STATUS = 'A'
            WHERE
              TXN_ID = @AUTHORIZATION_TXN_ID
          `);
                    results.push({ AUTHORIZATION_TXN_ID, TXN_ID, APPTXN_ID, status: "updated" });
                }
                else {
                    // Insert new record
                    request.input("TXN_ID", sql.Int, TXN_ID);
                    request.input("APPTXN_ID", sql.Int, APPTXN_ID);
                    request.input("DHOM", sql.VarChar(10), dhom);
                    await request.query(`
            INSERT INTO APPS_AUTHORIZATION (
              APPS_TXN_ID,
              GROUP_TXN_ID,
              PERMISSIONTYPE,
              STATUS
            )
            VALUES (
              @APPTXN_ID,
              @TXN_ID,
              @DHOM,
              'A'
            )
          `);
                    results.push({ TXN_ID, APPTXN_ID, status: "inserted" });
                }
            }
            await transaction.commit();
            return res.status(200).json({
                message: "Records processed successfully",
                results,
            });
        }
        catch (err) {
            await transaction.rollback();
            console.error("Transaction failed:", err);
            return res.status(400).json({ error: err.message });
        }
    }
    catch (err) {
        console.error("DB connection failed:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
// router.post("/saveGroup", authenticateToken, async (req, res) => {
//   const { groupName, description, status } = req.body;
//   if (!groupName || !status) {
//     return res.status(400).json({ message: "Group name and status are required" });
//   }
//   try {
//     await sql.connect(config);
//     await sql.query`
//       INSERT INTO APPS_GROUPS (GROUPNAME, GROUPDESCRIPTION, STATUS)
//       VALUES (${groupName}, ${description || ""}, ${status})
//     `;
//     res.status(200).json({ message: "Group saved successfully" });
//   } catch (err) {
//     console.error("Error saving group:", err);
//     res.status(500).json({ message: "Failed to save group" });
//   }
// });
// // Update group by TXN_ID
// router.put("/updateGroup/:id", authenticateToken, async (req, res) => {
//   const groupId = req.params.id;
//   const { groupName, description, status } = req.body;
//   if (!groupName || !status) {
//     return res.status(400).json({ message: "Group name and status are required" });
//   }
//   try {
//     await sql.connect(config);
//     await sql.query`
//       UPDATE APPS_GROUPS
//       SET GROUPNAME = ${groupName}, GROUPDESCRIPTION = ${description || ""}, STATUS = ${status}
//       WHERE TXN_ID = ${groupId}
//     `;
//     res.status(200).json({ message: "Group updated successfully" });
//   } catch (err) {
//     console.error("Error updating group:", err);
//     res.status(500).json({ message: "Failed to update group" });
//   }
// });
module.exports = router;
//# sourceMappingURL=appconfig.js.map