"use strict";
const express = require("express");
const sql = require("mssql");
const config = require("../config");
const authenticateToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
router.get("/EmployeeCodefetch", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "C");
        const result = await request.execute("USP_EMPLOYEE_INDUCTION_PERSONAL");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/EmployeeBranchDropdown", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "L");
        const result = await request.execute("Usp_ALLMasterData");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/EmployeeBandDropdown", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(2), "CA");
        const result = await request.execute("Usp_ALLMasterData");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/EmployeeDepartmentDropdown", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "D");
        const result = await request.execute("Usp_ALLMasterData");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/EmployeeDesignationDropdown", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "V");
        const result = await request.execute("USP_EMPLOYEE_INDUCTION_PERSONAL");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/getLanguges", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "Z");
        const result = await request.execute("USP_LANGUAGES");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/getShift", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "S");
        const result = await request.execute("Usp_ALLMasterData");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.post('/FetchingCost', async (req, res) => {
    const prefix = (req.body.Prefix || '').toLowerCase().trim();
    const searchTerm = prefix === '' ? '%' : prefix;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('MCCI_Code', sql.VarChar(50), searchTerm);
        request.input('Flag', sql.VarChar(1), 'X');
        const result = await request.execute('USP_EMPLOYEE_ATTENDENCE');
        const employees = result.recordset || [];
        const filtered = searchTerm === '%'
            ? employees
            : employees.filter(emp => (emp.MCCI_Description || '').toLowerCase().includes(prefix) ||
                (emp.MCCI_Code || '').toLowerCase().includes(prefix));
        const mapped = filtered.slice(0, 10).map(emp => ({
            Name: emp.MCCI_Description,
            Code: emp.MCCI_Code
        }));
        res.json(mapped);
    }
    catch (error) {
        console.error('Error in GetReporting:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/ReportingEmployee', async (req, res) => {
    const prefix = (req.body.Prefix || '').toLowerCase().trim();
    const searchTerm = prefix === '' ? '%' : prefix;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('Eii_Emp_Code', sql.VarChar(50), searchTerm);
        request.input('Flag', sql.VarChar(2), 'RT');
        const result = await request.execute('USP_EMPLOYEE_INDUCTION_PERSONAL');
        const employees = result.recordset || [];
        const filtered = searchTerm === '%'
            ? employees
            : employees.filter(emp => (emp.EII_EMPLOYEE_NAME || '').toLowerCase().includes(prefix) ||
                (emp.EII_EMP_CODE || '').toLowerCase().includes(prefix));
        const mapped = filtered.slice(0, 10).map(emp => ({
            Name: emp.EII_EMPLOYEE_NAME,
            Code: emp.EII_EMP_CODE,
            Txn_Id: emp.EII_EMP_ID
        }));
        res.json(mapped);
    }
    catch (error) {
        console.error('Error in GetReporting:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/FetchingBlood', async (req, res) => {
    const prefix = (req.body.Prefix || '').toLowerCase().trim();
    const searchTerm = prefix === '' ? '%' : prefix;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('EII_EMP_CODE', sql.VarChar(50), searchTerm);
        request.input('Flag', sql.VarChar(2), 'BG');
        const result = await request.execute('USP_EMPLOYEE_INDUCTION_PERSONAL');
        const employees = result.recordset || [];
        const filtered = searchTerm === '%'
            ? employees
            : employees.filter(emp => (emp.Name || '').toLowerCase().includes(prefix) ||
                (emp.Txn_Id || '').toLowerCase().includes(prefix));
        const mapped = filtered.slice(0, 10).map(emp => ({
            Name: emp.Name,
            Code: emp.Txn_Id
        }));
        res.json(mapped);
    }
    catch (error) {
        console.error('Error in GetReporting:', error);
        res.status(500).json({ error: error.message });
    }
});
router.get("/getnationality", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "N");
        const result = await request.execute("usp_Nationality");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/getrelegion", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "R");
        const result = await request.execute("USP_HOLIDAYSLIST");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.get("/getpersonrelation", authenticateToken, async (req, res) => {
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Flag", sql.VarChar(1), "L");
        const result = await request.execute("USP_HOLIDAYSLIST");
        res.json(result.recordset);
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).json({ error: err.message });
    }
});
router.post('/FetchingCountry', async (req, res) => {
    const prefix = (req.body.Prefix || '').toLowerCase().trim();
    const searchTerm = prefix === '' ? '%' : prefix;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('MCI_NAME', sql.VarChar(50), searchTerm);
        request.input('Flag', sql.VarChar(2), 'CL');
        const result = await request.execute('USP_EMPLOYEE_INDUCTION_PERSONAL');
        const employees = result.recordset || [];
        const filtered = searchTerm === '%'
            ? employees
            : employees.filter(emp => (emp.MCI_Name || '').toLowerCase().includes(prefix) ||
                (emp.Txn_ID || '').toLowerCase().includes(prefix));
        const mapped = filtered.slice(0, 10).map(emp => ({
            Name: emp.MCI_Name,
            Code: emp.Txn_ID
        }));
        res.json(mapped);
    }
    catch (error) {
        console.error('Error in Fetching Country:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/Fetchingstate', async (req, res) => {
    const prefix = (req.body.Prefix || '').toLowerCase().trim();
    const countryCode = (req.body.CountryCode || '').trim();
    const searchTerm = prefix === '' ? '%' : prefix;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('MSI_NAME', sql.VarChar(50), searchTerm);
        request.input('MCI_TXN_ID', sql.VarChar(10), countryCode);
        request.input('Flag', sql.VarChar(2), 'SL');
        const result = await request.execute('USP_EMPLOYEE_INDUCTION_PERSONAL');
        const states = result.recordset || [];
        const filtered = searchTerm === '%'
            ? states
            : states.filter(state => (state.MSI_Name || '').toLowerCase().includes(prefix) ||
                (state.Txn_ID || '').toLowerCase().includes(prefix));
        const mapped = filtered.slice(0, 10).map(state => ({
            Name: state.MSI_Name,
            Code: state.Txn_ID
        }));
        res.json(mapped);
    }
    catch (error) {
        console.error('Error in Fetchingstate:', error);
        res.status(500).json({ error: error.message });
    }
});
router.post('/FetchingCountry', async (req, res) => {
    const prefix = (req.body.Prefix || '').toLowerCase().trim();
    const searchTerm = prefix === '' ? '%' : prefix;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input('MCI_NAME', sql.VarChar(50), searchTerm);
        request.input('Flag', sql.VarChar(2), 'CL');
        const result = await request.execute('USP_EMPLOYEE_INDUCTION_PERSONAL');
        const employees = result.recordset || [];
        const filtered = searchTerm === '%'
            ? employees
            : employees.filter(emp => (emp.MCI_Name || '').toLowerCase().includes(prefix) ||
                (emp.Txn_ID || '').toLowerCase().includes(prefix));
        const mapped = filtered.slice(0, 10).map(emp => ({
            Name: emp.MCI_Name,
            Code: emp.Txn_ID
        }));
        res.json(mapped);
    }
    catch (error) {
        console.error('Error in GetReporting:', error);
        res.status(500).json({ error: error.message });
    }
});
const upload = multer({ storage: multer.memoryStorage() });
router.post("/upload", upload.single("photo"), (req, res) => {
    const empCode = req.body.EmpCode || "unknown";
    const ext = path.extname(req.file.originalname);
    const pad = (n, w = 2) => n.toString().padStart(w, "0");
    const now = new Date();
    const timestamp = `${pad(now.getFullYear(), 4)}${pad(now.getMonth() + 1)}${pad(now.getDate())}_` +
        `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_` +
        `${pad(now.getMilliseconds(), 3)}`;
    const filename = `${empCode}_${timestamp}${ext}`;
    const savePath = path.join("uploads/profilepic", filename);
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFile(savePath, req.file.buffer, (err) => {
        if (err)
            return res.status(500).json({ error: "Saving failed" });
        res.json({ filePath: savePath });
    });
});
router.post("/signatureupload", upload.single("photo"), (req, res) => {
    const empCode = req.body.EmpCode || "unknown";
    const ext = path.extname(req.file.originalname);
    const pad = (n, w = 2) => n.toString().padStart(w, "0");
    const now = new Date();
    const timestamp = `${pad(now.getFullYear(), 4)}${pad(now.getMonth() + 1)}${pad(now.getDate())}_` +
        `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}_` +
        `${pad(now.getMilliseconds(), 3)}`;
    const filename = `${empCode}_${timestamp}${ext}`;
    const savePath = path.join("uploads/signature", filename);
    fs.mkdirSync(path.dirname(savePath), { recursive: true });
    fs.writeFile(savePath, req.file.buffer, (err) => {
        if (err)
            return res.status(500).json({ error: "Saving failed" });
        res.json({ filePath: savePath });
    });
});
router.post("/EmployeeCreate", authenticateToken, async (req, res) => {
    const { savedProfileFileName, savedSignatureFileName, EII_EMP_CODE, MBRI_ID, EII_FIRSTNAME, EII_LASTNAME, MDGI_ID, EII_PHONE_NO, EII_ALTPHONE_NO, EII_GENDER, EII_DEPARTMENT, EII_DESIGNATION, EII_JOIN_DATE, EII_JOBTYPE, EII_CONFIRMATION_DATE, MS_CODE, EII_EMAIL, EII_ALTEMAIL, costCenterCode, reportingToId, levelOneReportingId, levelTwoReportingId, EII_DOB, EII_CERTDOB, EII_Mark_of_Identification, EII_Ret_Date, EII_MARTIAL_STATUS, EII_Nationality, EII_Religion, EII_EMERGENCY_CONTACT_NAME, EII_EMERGENCY_CONTACT_RELATION, EII_EMERGENCY_CONTACT_NO, EII_PASSPORT_NO, EII_PASSPORT_EXPIRY_DATE, EII_PAN_NO, EII_PF, EII_ESI, EII_BANK_NAME, EII_BANK_Branch_Name, EII_BANK_AC_NO, EII_BANK_IFSC, EII_Aadhar_No, MLI_CODE } = req.body;
    try {
        await sql.connect(config);
        const request = new sql.Request();
        request.input("Eii_Image", sql.VarChar(sql.MAX), savedProfileFileName);
        request.input("EII_IMAGE_SIGN", sql.VarChar(sql.MAX), savedSignatureFileName);
        request.input("EII_EMP_CODE", sql.VarChar(30), EII_EMP_CODE);
        request.input("EII_FIRSTNAME", sql.VarChar(sql.MAX), EII_FIRSTNAME);
        request.input("EII_LASTNAME", sql.VarChar(sql.MAX), EII_LASTNAME);
        request.input("EII_GENDER", sql.VarChar(5), EII_GENDER);
        request.input("EII_PHONE_NO", sql.VarChar(20), EII_PHONE_NO);
        request.input("EII_ALTPHONE_NO", sql.VarChar(20), EII_ALTPHONE_NO);
        request.input("EII_EMAIL", sql.VarChar(sql.MAX), EII_EMAIL);
        request.input("EII_ALTEMAIL", sql.VarChar(sql.MAX), EII_ALTEMAIL);
        request.input("EII_DEPARTMENT", sql.VarChar(sql.MAX), EII_DEPARTMENT);
        request.input("EII_DESIGNATION", sql.VarChar(sql.MAX), EII_DESIGNATION);
        request.input("EII_JOBTYPE", sql.VarChar(50), EII_JOBTYPE);
        request.input("EII_JOIN_DATE", sql.Date, EII_JOIN_DATE);
        request.input("EII_CONFIRMATION_DATE", sql.Date, EII_CONFIRMATION_DATE);
        request.input("MBRI_ID", sql.Int, MBRI_ID);
        request.input("EII_REPORTING", sql.VarChar(sql.MAX), reportingToId);
        request.input("EII_REPORTING1", sql.VarChar(sql.MAX), levelOneReportingId);
        request.input("EII_REPORTING2", sql.VarChar(sql.MAX), levelTwoReportingId);
        request.input("Cost_Center", sql.VarChar(50), costCenterCode);
        request.input("MS_CODE", sql.VarChar(50), MS_CODE);
        request.input("UserID", sql.Int, req.user.userId);
        request.input("EII_DOB", sql.VarChar(100), EII_DOB);
        request.input("EII_CERTDOB", sql.Date, EII_CERTDOB);
        request.input("EII_Mark_of_Identification", sql.VarChar(sql.MAX), EII_Mark_of_Identification);
        request.input("EII_Ret_Date", sql.VarChar(50), EII_Ret_Date);
        request.input("EII_MARTIAL_STATUS", sql.VarChar(50), EII_MARTIAL_STATUS);
        request.input("EII_Nationality", sql.VarChar(50), EII_Nationality);
        request.input("EII_Religion", sql.VarChar(50), EII_Religion);
        request.input("EII_EMERGENCY_CONTACT_NAME", sql.VarChar(100), EII_EMERGENCY_CONTACT_NAME);
        request.input("EII_EMERGENCY_CONTACT_RELATION", sql.VarChar(50), EII_EMERGENCY_CONTACT_RELATION);
        request.input("EII_EMERGENCY_CONTACT_NO", sql.VarChar(20), EII_EMERGENCY_CONTACT_NO);
        request.input("EII_PASSPORT_NO", sql.VarChar(50), EII_PASSPORT_NO);
        request.input("EII_PASSPORT_EXPIRY_DATE", sql.Date, EII_PASSPORT_EXPIRY_DATE);
        request.input("EII_PAN_NO", sql.VarChar(20), EII_PAN_NO);
        request.input("EII_PF", sql.VarChar(50), EII_PF);
        request.input("EII_ESI", sql.VarChar(50), EII_ESI);
        request.input("EII_BANK_NAME", sql.VarChar(100), EII_BANK_NAME);
        request.input("EII_BANK_Branch_Name", sql.VarChar(100), EII_BANK_Branch_Name);
        request.input("EII_BANK_AC_NO", sql.VarChar(30), EII_BANK_AC_NO);
        request.input("EII_BANK_IFSC", sql.VarChar(20), EII_BANK_IFSC);
        request.input("EII_Aadhar_No", sql.VarChar(20), EII_Aadhar_No);
        request.input("MLI_CODE", sql.VarChar(sql.MAX), MLI_CODE);
        // 🔖 Flags
        request.input("Flag", sql.VarChar(1), "E");
        request.output("MSG", sql.VarChar(sql.MAX));
        const result = await request.execute("USP_EMPLOYEE_INDUCTION_PERSONAL");
        res.json({ message: result.output.msg, data: result.recordset });
    }
    catch (err) {
        console.error("Create error:", err);
        res.status(500).json({ error: err.message });
    }
});
// router.post("/upload", authenticateToken, upload.single("photo"), (req, res) => {
//   res.json({ filePath: req.file.path });
// });
module.exports = router;
//# sourceMappingURL=employee.js.map