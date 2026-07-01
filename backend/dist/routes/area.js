"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Area_1 = require("../models/Area");
const AuditLog_1 = require("../models/AuditLog");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Get all areas
router.get("/", async (req, res) => {
    try {
        const areas = await Area_1.Area.findAll({ include: ["headUser"] });
        res.json(areas);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch areas" });
    }
});
// Create area with Audit
router.post("/", auth_1.authenticateToken, (0, validation_1.validateRequest)({
    name: { type: 'string', required: true },
    serviceTypes: { type: 'array' },
    rangeKm: { type: 'number' },
    pincode: { type: 'string' }
}), async (req, res) => {
    try {
        const area = await Area_1.Area.create(req.body);
        // Audit Log
        const userId = req.user ? req.user.id : 0;
        await AuditLog_1.AuditLog.create({
            userId,
            action: "CREATE",
            tableName: "areas",
            recordId: area.id.toString(),
            oldValue: "",
            newValue: JSON.stringify(area)
        });
        res.status(201).json(area);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create area" });
    }
});
// Update area with Audit
router.put("/:id", auth_1.authenticateToken, (0, validation_1.validateRequest)({
    name: { type: 'string' },
    serviceTypes: { type: 'array' },
    rangeKm: { type: 'number' },
    pincode: { type: 'string' }
}), async (req, res) => {
    try {
        const area = await Area_1.Area.findByPk(req.params.id);
        if (!area)
            return res.status(404).json({ error: "Area not found" });
        const startState = JSON.stringify(area);
        await area.update(req.body);
        const endState = JSON.stringify(area);
        // Audit Log
        const userId = req.user ? req.user.id : 0;
        await AuditLog_1.AuditLog.create({
            userId,
            action: "UPDATE",
            tableName: "areas",
            recordId: area.id.toString(),
            oldValue: startState,
            newValue: endState
        });
        res.json(area);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update area" });
    }
});
// Delete area
router.delete("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const area = await Area_1.Area.findByPk(req.params.id);
        if (!area)
            return res.status(404).json({ error: "Area not found" });
        const startState = JSON.stringify(area);
        await area.destroy();
        // Audit Log
        const userId = req.user ? req.user.id : 0;
        await AuditLog_1.AuditLog.create({
            userId,
            action: "DELETE",
            tableName: "areas",
            recordId: req.params.id,
            oldValue: startState,
            newValue: ""
        });
        res.json({ message: "Area deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete area" });
    }
});
exports.default = router;
//# sourceMappingURL=area.js.map