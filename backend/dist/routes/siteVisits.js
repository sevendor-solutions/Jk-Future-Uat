"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SiteVisit_1 = require("../models/SiteVisit");
const MailConfig_1 = require("../models/MailConfig");
const Project_1 = require("../models/Project");
const auth_1 = require("../middleware/auth");
const nodemailer_1 = __importDefault(require("nodemailer"));
const router = (0, express_1.Router)();
// GET all site visits
router.get("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const visits = await SiteVisit_1.SiteVisit.findAll({
            order: [["visitDate", "ASC"], ["visitTime", "ASC"]]
        });
        return res.json({ success: true, data: visits });
    }
    catch (error) {
        next(error);
    }
});
// POST schedule new site visit
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const newVisit = await SiteVisit_1.SiteVisit.create(req.body);
        return res.status(201).json({ success: true, data: newVisit });
    }
    catch (error) {
        next(error);
    }
});
// PUT update site visit details
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const visit = await SiteVisit_1.SiteVisit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ success: false, message: "Site visit not found" });
        }
        await visit.update(req.body);
        return res.json({ success: true, data: visit });
    }
    catch (error) {
        next(error);
    }
});
// DELETE delete/cancel site visit
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const visit = await SiteVisit_1.SiteVisit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ success: false, message: "Site visit not found" });
        }
        await visit.destroy();
        return res.json({ success: true, message: "Site visit deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// Helper to replace placeholders
const compileTemplate = (template, variables) => {
    let result = template;
    for (const key in variables) {
        result = result.replace(new RegExp(`{${key}}`, 'g'), variables[key]);
    }
    return result;
};
// POST process reminders for all pending site visits
router.post("/process-reminders", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const config = await MailConfig_1.MailConfig.findByPk("default") || await MailConfig_1.MailConfig.create({
            id: "default",
            deliveryMode: "simulation"
        });
        const pendingVisits = await SiteVisit_1.SiteVisit.findAll({
            where: { emailStatus: "Pending" }
        });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let sentCount = 0;
        let skippedCount = 0;
        let failedCount = 0;
        // Set up SMTP transporter if smtp mode
        let transporter = null;
        if (config.deliveryMode === "smtp") {
            transporter = nodemailer_1.default.createTransport({
                host: config.smtpHost,
                port: config.smtpPort,
                secure: config.smtpPort === 465,
                auth: config.smtpUser ? {
                    user: config.smtpUser,
                    pass: config.smtpPass
                } : undefined
            });
        }
        for (const visit of pendingVisits) {
            const visitDate = new Date(visit.visitDate);
            visitDate.setHours(0, 0, 0, 0);
            const diffTime = visitDate.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            // Check if it's already today or in the past (too late for a reminder)
            if (diffDays < config.sendBeforeDays) {
                await visit.update({ emailStatus: "Skipped" });
                skippedCount++;
                continue;
            }
            // Check if it's outside the tracking window (more than 5 days out)
            if (diffDays > config.triggerWindowDays) {
                // Do nothing: keep Pending for later checks
                continue;
            }
            // If it falls exactly on the target reminder day (e.g. 1 day before)
            if (diffDays === config.sendBeforeDays) {
                try {
                    // Fetch location details
                    let location = "At the project site";
                    const project = await Project_1.Project.findByPk(visit.projectAssociation);
                    if (project) {
                        location = project.location;
                    }
                    const vars = {
                        customerName: visit.customerName,
                        projectName: visit.projectName,
                        visitDate: visit.visitDate,
                        visitTime: visit.visitTime,
                        assignedAgent: visit.assignedAgent || "Our Property Relations Advisor",
                        location: location
                    };
                    const compiledSubject = compileTemplate(config.emailSubject, vars);
                    const compiledBody = compileTemplate(config.emailTemplate, vars);
                    if (config.deliveryMode === "simulation") {
                        console.log("=========================================");
                        console.log(`✉️ SIMULATED SITE VISIT EMAIL REMINDER`);
                        console.log(`To: ${visit.customerEmail} (${visit.customerName})`);
                        console.log(`Subject: ${compiledSubject}`);
                        console.log(`Body:\n${compiledBody}`);
                        console.log("=========================================");
                        await visit.update({
                            emailStatus: "Sent",
                            emailSentDate: new Date().toISOString()
                        });
                        sentCount++;
                    }
                    else if (transporter) {
                        await transporter.sendMail({
                            from: config.senderEmail,
                            to: visit.customerEmail,
                            subject: compiledSubject,
                            text: compiledBody
                        });
                        await visit.update({
                            emailStatus: "Sent",
                            emailSentDate: new Date().toISOString()
                        });
                        sentCount++;
                    }
                }
                catch (err) {
                    console.error(`Failed to send email to ${visit.customerEmail}:`, err);
                    await visit.update({ emailStatus: "Failed" });
                    failedCount++;
                }
            }
        }
        return res.json({
            success: true,
            data: {
                totalProcessed: pendingVisits.length,
                sent: sentCount,
                skipped: skippedCount,
                failed: failedCount
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// POST manually send/re-send email immediately (bypass date check)
router.post("/:id/send-now", auth_1.authenticateToken, async (req, res, next) => {
    let visit = null;
    try {
        visit = await SiteVisit_1.SiteVisit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ success: false, message: "Site visit not found" });
        }
        const config = await MailConfig_1.MailConfig.findByPk("default") || await MailConfig_1.MailConfig.create({
            id: "default",
            deliveryMode: "simulation"
        });
        let location = "At the project site";
        const project = await Project_1.Project.findByPk(visit.projectAssociation);
        if (project) {
            location = project.location;
        }
        const vars = {
            customerName: visit.customerName,
            projectName: visit.projectName,
            visitDate: visit.visitDate,
            visitTime: visit.visitTime,
            assignedAgent: visit.assignedAgent || "Our Property Relations Advisor",
            location: location
        };
        const compiledSubject = compileTemplate(config.emailSubject, vars);
        const compiledBody = compileTemplate(config.emailTemplate, vars);
        if (config.deliveryMode === "simulation") {
            console.log("=========================================");
            console.log(`✉️ MANUAL SIMULATED SITE VISIT EMAIL REMINDER`);
            console.log(`To: ${visit.customerEmail} (${visit.customerName})`);
            console.log(`Subject: ${compiledSubject}`);
            console.log(`Body:\n${compiledBody}`);
            console.log("=========================================");
            await visit.update({
                emailStatus: "Sent",
                emailSentDate: new Date().toISOString()
            });
            return res.json({ success: true, message: "Email simulated successfully." });
        }
        else {
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
                to: visit.customerEmail,
                subject: compiledSubject,
                text: compiledBody
            });
            await visit.update({
                emailStatus: "Sent",
                emailSentDate: new Date().toISOString()
            });
            return res.json({ success: true, message: `Email sent successfully to ${visit.customerEmail}!` });
        }
    }
    catch (error) {
        console.error("Manual send failed:", error);
        await visit?.update({ emailStatus: "Failed" });
        return res.status(500).json({ success: false, message: `Send failed: ${error.message || error}` });
    }
});
exports.default = router;
//# sourceMappingURL=siteVisits.js.map