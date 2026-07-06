"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const UserSessionLog_1 = require("../models/UserSessionLog");
const auth_1 = require("../middleware/auth");
const nodemailer_1 = __importDefault(require("nodemailer"));
const MailConfig_1 = require("../models/MailConfig");
const auditLogger_1 = require("../utils/auditLogger");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
// GET all user session logs
router.get("/logs/session", async (req, res, next) => {
    try {
        const logs = await UserSessionLog_1.UserSessionLog.findAll({
            order: [["createdAt", "DESC"]],
            limit: 100
        });
        return res.json({ success: true, data: logs });
    }
    catch (error) {
        next(error);
    }
});
// GET all users
router.get("/", async (req, res, next) => {
    try {
        const users = await User_1.User.findAll({
            order: [["name", "ASC"]]
        });
        // Mask passwords in listing
        const cleanUsers = users.map(u => {
            const uJson = u.toJSON();
            delete uJson.password;
            return uJson;
        });
        return res.json({ success: true, data: cleanUsers });
    }
    catch (error) {
        next(error);
    }
});
// POST create user
router.post("/", async (req, res, next) => {
    try {
        const { username, email, password, name, role } = req.body;
        const exists = await User_1.User.findOne({ where: { username } });
        if (exists) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }
        const newUser = await User_1.User.create(req.body);
        const userJson = newUser.toJSON();
        delete userJson.password;
        await (0, auditLogger_1.logAuditAction)(req, "User Created", `Created user profile: "${username}" (Name: ${name || username}, Role: ${role || 'Admin'})`, "Success");
        // Try sending user credentials email
        try {
            const config = await MailConfig_1.MailConfig.findByPk("default");
            if (config && email) {
                const subject = "JK Future Infra — Your Login Credentials";
                const bodyHtml = `
                    <div style="font-family:sans-serif;max-width:500px;margin:0 auto;padding:32px;border:1px solid #e2e8f0;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,0.05);">
                        <div style="text-align:center;margin-bottom:24px;">
                            <h2 style="color:#0f2b46;margin:0;font-size:22px;font-weight:700;">Account Created Successfully</h2>
                            <p style="color:#64748b;margin:6px 0 0 0;font-size:14px;">Welcome to JK Future Infra Administration Panel</p>
                        </div>
                        <div style="border-top:1px solid #e2e8f0;border-bottom:1px solid #e2e8f0;padding:20px 0;margin-bottom:24px;">
                            <p style="color:#334155;margin:0 0 12px 0;font-size:15px;">Dear <strong>${name || username}</strong>,</p>
                            <p style="color:#334155;margin:0 0 16px 0;font-size:14px;line-height:1.5;">Your administrative login profile has been successfully set up. Below are your credentials to access the portal:</p>
                            
                            <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0;">
                                <tr>
                                    <td style="padding:12px;font-weight:700;color:#64748b;width:35%;">Username:</td>
                                    <td style="padding:12px;color:#0f2b46;font-family:monospace;font-weight:600;">${username}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px;font-weight:700;color:#64748b;">Password:</td>
                                    <td style="padding:12px;color:#0f2b46;font-family:monospace;font-weight:600;">${password}</td>
                                </tr>
                                <tr>
                                    <td style="padding:12px;font-weight:700;color:#64748b;">System Role:</td>
                                    <td style="padding:12px;color:#0f2b46;">${role || 'Admin'}</td>
                                </tr>
                            </table>
                            
                            <div style="text-align:center;margin-top:24px;">
                                <a href="${req.headers.origin || 'http://localhost:5173'}" style="display:inline-block;padding:12px 24px;background-color:#0f2b46;color:#ffffff;text-decoration:none;border-radius:6px;font-weight:600;font-size:14px;box-shadow:0 4px 6px -1px rgba(15,43,70,0.25);">Login to Portal</a>
                            </div>
                        </div>
                        <p style="color:#ef4444;font-size:12px;margin:0 0 8px 0;font-weight:600;">⚠️ Security Notice:</p>
                        <p style="color:#64748b;font-size:12px;margin:0;line-height:1.4;">Please do not share these credentials with anyone. Upon logging in, we strongly recommend reviewing your profile settings.</p>
                        <div style="margin-top:32px;border-top:1px solid #e2e8f0;padding-top:16px;text-align:center;">
                            <p style="color:#94a3b8;font-size:11px;margin:0;">&copy; 2026 JK Future Infra. All rights reserved.</p>
                        </div>
                    </div>
                `;
                if (config.deliveryMode === "simulation") {
                    console.log("=========================================");
                    console.log(`✉️ MOCK USER LOGIN EMAIL SENT (SIMULATION MODE)`);
                    console.log(`To: ${email}`);
                    console.log(`Username: ${username}`);
                    console.log(`Password: ${password}`);
                    console.log("=========================================");
                    await (0, auditLogger_1.logAuditAction)(req, "Email Dispatch Simulated", `Simulated credentials email dispatch to "${email}" for new user: "${username}"`, "Success");
                }
                else {
                    const transporter = nodemailer_1.default.createTransport({
                        host: config.smtpHost,
                        port: config.smtpPort,
                        secure: config.smtpPort === 465,
                        auth: config.smtpUser ? { user: config.smtpUser, pass: config.smtpPass } : undefined,
                        tls: { rejectUnauthorized: false },
                        connectionTimeout: 10000,
                        greetingTimeout: 10000
                    });
                    await transporter.sendMail({
                        from: `"JK Future Infra" <${config.senderEmail || 'noreply@jkfutureinfra.com'}>`,
                        to: email,
                        subject: subject,
                        html: bodyHtml
                    });
                    await (0, auditLogger_1.logAuditAction)(req, "Email Dispatched", `Successfully sent credentials email to "${email}" for new user: "${username}"`, "Success");
                }
            }
        }
        catch (mailErr) {
            console.error("Failed to send user creation credentials email:", mailErr);
            await (0, auditLogger_1.logAuditAction)(req, "Email Dispatch Failure", `Failed to send credentials email to "${email}" for user "${username}": ${mailErr.message || mailErr}`, "Failed");
        }
        return res.status(201).json({ success: true, data: userJson });
    }
    catch (error) {
        next(error);
    }
});
// PUT update user
router.put("/:id", async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await user.update(req.body);
        const userJson = user.toJSON();
        delete userJson.password;
        await (0, auditLogger_1.logAuditAction)(req, "User Updated", `Updated user profile details for "${user.username}"`, "Success");
        return res.json({ success: true, data: userJson });
    }
    catch (error) {
        next(error);
    }
});
// DELETE user
router.delete("/:id", async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const username = user.username;
        await user.destroy();
        await (0, auditLogger_1.logAuditAction)(req, "User Deleted", `Deleted user profile: "${username}"`, "Success");
        return res.json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map