"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logAuditAction = void 0;
const AuditLog_1 = require("../models/AuditLog");
const logAuditAction = async (userId, action, tableName, recordId, oldValue = null, newValue = null) => {
    try {
        await AuditLog_1.AuditLog.create({
            userId,
            action,
            tableName,
            recordId: recordId.toString(),
            oldValue: oldValue ? JSON.stringify(oldValue) : null,
            newValue: newValue ? JSON.stringify(newValue) : null,
            timestamp: new Date()
        });
    }
    catch (error) {
        console.error("Audit log failed:", error);
        // We don't throw here to avoid failing the main action just because audit log failed
    }
};
exports.logAuditAction = logAuditAction;
//# sourceMappingURL=logger.js.map