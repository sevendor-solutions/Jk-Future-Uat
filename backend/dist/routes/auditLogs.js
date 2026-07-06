"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuditLog_1 = require("../models/AuditLog");
const auth_1 = require("../middleware/auth");
const auditLogger_1 = require("../utils/auditLogger");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
// GET all audit logs
router.get("/", async (req, res, next) => {
    try {
        const logs = await AuditLog_1.AuditLog.findAll({
            order: [["createdAt", "DESC"]],
            limit: 1000
        });
        // Map backend schema to what the frontend expects
        const frontendLogs = logs.map(l => ({
            id: l.id,
            timestamp: l.createdAt.toISOString(),
            user: l.user,
            role: l.role,
            action: l.action,
            details: l.details,
            ip: l.ip || "127.0.0.1",
            status: l.status
        }));
        return res.json({ success: true, data: frontendLogs });
    }
    catch (error) {
        next(error);
    }
});
// DELETE clear all audit logs
router.delete("/", async (req, res, next) => {
    try {
        await AuditLog_1.AuditLog.destroy({ where: {}, truncate: true });
        // Log the clear action
        await (0, auditLogger_1.logAuditAction)(req, "Clear Audit Logs", "Cleared system audit trail database table", "Success");
        return res.json({ success: true, message: "Audit logs cleared successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auditLogs.js.map