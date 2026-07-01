"use strict";
const express = require("express");
const sql = require("mssql");
const config = require("../config");
const authenticateToken = require("../middleware/auth");
const router = express.Router();
router.post("/leaveMasterSave", authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        await sql.connect(config);
        // Map fields you expect from frontend to your DB columns
        // Adjust these columns if your table schema differs
        const query = `
      INSERT INTO dbo.Mast_Leave_Info (
        MLI_Name, MLI_Code, MLI_Leaves_Month, MLI_Leaves_Year,
        MLI_Gender, MLI_MinLeaves, MLI_GapLeaves,
        MLI_MaxApp_Month, MLI_MaxApp_Year,
        MLI_MaxLeaves_CarryFrwd, MLI_MaxLeaves_Payment,
        UserID, LatModifiedUser, ModifiedDate, LastModifiedDate,
        Mli_Month_CarryForward, Mli_Year_CarryForward,
        MLI_MaxAccum, MLI_Encash_Reserve, MLI_AutoCredit,
        MLI_CarriedForward, MLI_EnCashable, MLI_Credit,
        MLI_MaxLeavesTakenAtaTime, MLI_Sandwich,
        MLI_NoOfTimes_Can_Apply_In_Year,
        MLI_NoOfYears_Comp_To_Encashable, Min_Encashable_Leaves,
        Expiredays, ChkAllowcompoff, ChkCompoffavailable,
        Nooftimesapplicable, Mingapbetweenleaves,
        SickLeave_certificate, Credit_Days
      )
      VALUES (
        @MLI_Name, @MLI_Code, @MLI_Leaves_Month, @MLI_Leaves_Year,
        @MLI_Gender, @MLI_MinLeaves, @MLI_GapLeaves,
        @MLI_MaxApp_Month, @MLI_MaxApp_Year,
        @MLI_MaxLeaves_CarryFrwd, @MLI_MaxLeaves_Payment,
        @UserID, @LatModifiedUser, @ModifiedDate, @LastModifiedDate,
        @Mli_Month_CarryForward, @Mli_Year_CarryForward,
        @MLI_MaxAccum, @MLI_Encash_Reserve, @MLI_AutoCredit,
        @MLI_CarriedForward, @MLI_EnCashable, @MLI_Credit,
        @MLI_MaxLeavesTakenAtaTime, @MLI_Sandwich,
        @MLI_NoOfTimes_Can_Apply_In_Year,
        @MLI_NoOfYears_Comp_To_Encashable, @Min_Encashable_Leaves,
        @Expiredays, @ChkAllowcompoff, @ChkCompoffavailable,
        @Nooftimesapplicable, @Mingapbetweenleaves,
        @SickLeave_certificate, @Credit_Days
      )
    `;
        const request = new sql.Request();
        // Bind parameters safely
        request.input("MLI_Name", sql.VarChar, data.MLI_Name || null);
        request.input("MLI_Code", sql.VarChar, data.MLI_Code || null);
        request.input("MLI_Leaves_Month", sql.Int, data.MLI_Leaves_Month || 0);
        request.input("MLI_Leaves_Year", sql.Int, data.MLI_Leaves_Year || 0);
        request.input("MLI_Gender", sql.VarChar, data.MLI_Gender || null);
        request.input("MLI_MinLeaves", sql.Int, data.MLI_MinLeaves || 0);
        request.input("MLI_GapLeaves", sql.Int, data.MLI_GapLeaves || 0);
        request.input("MLI_MaxApp_Month", sql.Int, data.MLI_MaxApp_Month || 0);
        request.input("MLI_MaxApp_Year", sql.Int, data.MLI_MaxApp_Year || 0);
        request.input("MLI_MaxLeaves_CarryFrwd", sql.Int, data.MLI_MaxLeaves_CarryFrwd || 0);
        request.input("MLI_MaxLeaves_Payment", sql.Int, data.MLI_MaxLeaves_Payment || 0);
        request.input("UserID", sql.VarChar, data.UserID || null);
        request.input("LatModifiedUser", sql.VarChar, data.LatModifiedUser || null);
        request.input("ModifiedDate", sql.DateTime, data.ModifiedDate ? new Date(data.ModifiedDate) : new Date());
        request.input("LastModifiedDate", sql.DateTime, data.LastModifiedDate ? new Date(data.LastModifiedDate) : new Date());
        request.input("Mli_Month_CarryForward", sql.Int, data.Mli_Month_CarryForward || 0);
        request.input("Mli_Year_CarryForward", sql.Int, data.Mli_Year_CarryForward || 0);
        request.input("MLI_MaxAccum", sql.Int, data.MLI_MaxAccum || 0);
        request.input("MLI_Encash_Reserve", sql.Int, data.MLI_Encash_Reserve || 0);
        request.input("MLI_AutoCredit", sql.Char(1), data.MLI_AutoCredit || "N");
        request.input("MLI_CarriedForward", sql.Char(1), data.MLI_CarriedForward || "N");
        request.input("MLI_EnCashable", sql.Char(1), data.MLI_EnCashable || "N");
        request.input("MLI_Credit", sql.Int, data.MLI_Credit || 0);
        request.input("MLI_MaxLeavesTakenAtaTime", sql.Int, data.MLI_MaxLeavesTakenAtaTime || 0);
        request.input("MLI_Sandwich", sql.Char(1), data.MLI_Sandwich || "N");
        request.input("MLI_NoOfTimes_Can_Apply_In_Year", sql.Int, data.MLI_NoOfTimes_Can_Apply_In_Year || 0);
        request.input("MLI_NoOfYears_Comp_To_Encashable", sql.Int, data.MLI_NoOfYears_Comp_To_Encashable || 0);
        request.input("Min_Encashable_Leaves", sql.Int, data.Min_Encashable_Leaves || 0);
        request.input("Expiredays", sql.Int, data.Expiredays || 0);
        request.input("ChkAllowcompoff", sql.Char(1), data.ChkAllowcompoff || "N");
        request.input("ChkCompoffavailable", sql.Char(1), data.ChkCompoffavailable || "N");
        request.input("Nooftimesapplicable", sql.Int, data.Nooftimesapplicable || 0);
        request.input("Mingapbetweenleaves", sql.Int, data.Mingapbetweenleaves || 0);
        request.input("SickLeave_certificate", sql.Char(1), data.SickLeave_certificate || "N");
        request.input("Credit_Days", sql.Int, data.Credit_Days || 0);
        await request.query(query);
        res.status(200).json({ message: "Leave info saved successfully!" });
    }
    catch (err) {
        console.error("Error inserting leave info:", err);
        res.status(500).json({ message: "Failed to save leave info" });
    }
});
// router.post("/leaveMasterSave", authenticateToken, async (req, res) => {
//   const data = req.body;
//   try {
//     await sql.connect(config);
// //      MLI_Name: formData.MLI_Name,
// //   MLI_Code: formData.MLI_Code,
//    const result = await sql.query`
//       INSERT INTO dbo.Mast_Leave_Info (
//         MLI_Name, MLI_Code
//       )
//       VALUES (
//         ${data.MLI_Name}, ${data.MLI_Code}
//       )
//     `;
//     // const result = await sql.query`
//     //   INSERT INTO dbo.Mast_Leave_Info (
//     //     MLI_Name, MLI_Code, MLI_Leaves_Month, MLI_Leaves_Year,
//     //     MLI_Gender, MLI_MinLeaves, MLI_GapLeaves,
//     //     MLI_MaxApp_Month, MLI_MaxApp_Year,
//     //     MLI_MaxLeaves_CarryFrwd, MLI_MaxLeaves_Payment,
//     //     UserID, LatModifiedUser, ModifiedDate, LastModifiedDate,
//     //     Mli_Month_CarryForward, Mli_Year_CarryForward,
//     //     MLI_MaxAccum, MLI_Encash_Reserve, MLI_AutoCredit,
//     //     MLI_CarriedForward, MLI_EnCashable, MLI_Credit,
//     //     MLI_MaxLeavesTakenAtaTime, MLI_Sandwich,
//     //     MLI_NoOfTimes_Can_Apply_In_Year,
//     //     MLI_NoOfYears_Comp_To_Encashable, Min_Encashable_Leaves,
//     //     Expiredays, ChkAllowcompoff, ChkCompoffavailable,
//     //     Nooftimesapplicable, Mingapbetweenleaves,
//     //     SickLeave_certificate, Credit_Days
//     //   )
//     //   VALUES (
//     //     ${data.MLI_Name}, ${data.MLI_Code}, ${data.MLI_Leaves_Month}, ${data.MLI_Leaves_Year},
//     //     ${data.MLI_Gender}, ${data.MLI_MinLeaves}, ${data.MLI_GapLeaves},
//     //     ${data.MLI_MaxApp_Month}, ${data.MLI_MaxApp_Year},
//     //     ${data.MLI_MaxLeaves_CarryFrwd}, ${data.MLI_MaxLeaves_Payment},
//     //     ${data.UserID}, ${data.LatModifiedUser}, ${data.ModifiedDate}, ${data.LastModifiedDate},
//     //     ${data.Mli_Month_CarryForward}, ${data.Mli_Year_CarryForward},
//     //     ${data.MLI_MaxAccum}, ${data.MLI_Encash_Reserve}, ${data.MLI_AutoCredit},
//     //     ${data.MLI_CarriedForward}, ${data.MLI_EnCashable}, ${data.MLI_Credit},
//     //     ${data.MLI_MaxLeavesTakenAtaTime}, ${data.MLI_Sandwich},
//     //     ${data.MLI_NoOfTimes_Can_Apply_In_Year},
//     //     ${data.MLI_NoOfYears_Comp_To_Encashable}, ${data.Min_Encashable_Leaves},
//     //     ${data.Expiredays}, ${data.ChkAllowcompoff}, ${data.ChkCompoffavailable},
//     //     ${data.Nooftimesapplicable}, ${data.Mingapbetweenleaves},
//     //     ${data.SickLeave_certificate}, ${data.Credit_Days}
//     //   )
//     // `;
//     res.status(200).json({ message: "Leave info saved successfully!" });
//   } catch (err) {
//     console.error("Error inserting leave info:", err);
//     res.status(500).json({ message: "Failed to save leave info" });
//   }
// });
module.exports = router;
//# sourceMappingURL=Leaves.js.map