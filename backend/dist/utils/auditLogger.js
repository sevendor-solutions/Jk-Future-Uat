"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditAction = void 0;
const AuditLog_1 = require("../models/AuditLog");
const logAuditAction = async (req, action, details, status = "Success", fallbackUser) => {
    try {
        const username = req?.user?.username || fallbackUser?.username || "System/Guest";
        const role = req?.user?.role || fallbackUser?.role || "Guest";
        let ip = "127.0.0.1";
        if (req) {
            ip = req.ip ||
                req.headers["x-forwarded-for"] ||
                req.socket.remoteAddress ||
                "127.0.0.1";
        }
        await AuditLog_1.AuditLog.create({
            user: username,
            role: role,
            action: action,
            details: details,
            ip: typeof ip === "string" ? ip : String(ip),
            status: status
        });
        console.log(`[AUDIT LOG] ${action} - User: ${username} - Status: ${status} - Details: ${details}`);
    }
    catch (err) {
        console.error("❌ Failed to write system audit log:", err);
    }
};
exports.logAuditAction = logAuditAction;
//# sourceMappingURL=auditLogger.js.map