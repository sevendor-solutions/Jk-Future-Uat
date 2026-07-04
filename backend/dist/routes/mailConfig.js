"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MailConfig_1 = require("../models/MailConfig");
const auth_1 = require("../middleware/auth");
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
// GET mail config (finds or creates default)
router.get("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        let config = await MailConfig_1.MailConfig.findByPk("default");
        if (!config) {
            config = await MailConfig_1.MailConfig.create({
                id: "default",
                deliveryMode: "simulation",
                triggerWindowDays: 5,
                sendBeforeDays: 1,
                smtpHost: "smtp.mailtrap.io",
                smtpPort: 2525,
                smtpUser: "",
                smtpPass: "",
                senderEmail: "noreply@jkfutureinfra.com",
                emailSubject: "Reminder: Scheduled Site Visit for {projectName}",
                emailTemplate: "Hello {customerName},\n\nThis is a friendly reminder that you have a scheduled site visit for {projectName} on {visitDate} at {visitTime}.\n\nLocation: {location}\n\nOur property consultant {assignedAgent} will guide you.\n\nWarm regards,\nJK Future Infra Team"
            });
        }
        return res.json({ success: true, data: config });
    }
    catch (error) {
        next(error);
    }
});
// PUT update mail config
router.put("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        let config = await MailConfig_1.MailConfig.findByPk("default");
        if (!config) {
            config = await MailConfig_1.MailConfig.create({ id: "default", ...req.body });
        }
        else {
            await config.update(req.body);
        }
        return res.json({ success: true, data: config });
    }
    catch (error) {
        next(error);
    }
});
// POST send test email
router.post("/test", auth_1.authenticateToken, async (req, res, next) => {
    const { toEmail } = req.body;
    if (!toEmail) {
        return res.status(400).json({ success: false, message: "Recipient email is required" });
    }
    try {
        const config = await MailConfig_1.MailConfig.findByPk("default");
        if (!config) {
            return res.status(404).json({ success: false, message: "Mail configuration not found" });
        }
        const subject = "JK Future Infra - SMTP Test Email";
        const body = `SMTP configurations are working perfectly!\n\nDetails:\nHost: ${config.smtpHost}\nPort: ${config.smtpPort}\nSender: ${config.senderEmail}\nMode: ${config.deliveryMode}`;
        if (config.deliveryMode === "simulation") {
            console.log("=========================================");
            console.log(`✉️ MOCK TEST EMAIL SENT (SIMULATION MODE)`);
            console.log(`To: ${toEmail}`);
            console.log(`Subject: ${subject}`);
            console.log(`Body:\n${body}`);
            console.log("=========================================");
            return res.json({
                success: true,
                message: "Test email simulated successfully. Check server logs."
            });
        }
        // SMTP mode
        const transporter = nodemailer_1.default.createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: config.smtpPort === 465,
            auth: config.smtpUser ? {
                user: config.smtpUser,
                pass: config.smtpPass
            } : undefined
        });
        await transporter.sendMail({
            from: config.senderEmail,
            to: toEmail,
            subject: subject,
            text: body
        });
        return res.json({ success: true, message: `Test email sent successfully to ${toEmail}!` });
    }
    catch (error) {
        console.error("SMTP Test failed:", error);
        return res.status(500).json({
            success: false,
            message: `SMTP Connection test failed: ${error.message || error}`
        });
    }
});
exports.default = router;
//# sourceMappingURL=mailConfig.js.map