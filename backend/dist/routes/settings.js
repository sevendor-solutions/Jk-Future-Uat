"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const SystemSetting_1 = require("../models/SystemSetting");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all system settings
router.get("/", auth_1.authenticate, async (req, res) => {
    try {
        const settings = await SystemSetting_1.SystemSetting.findAll();
        res.json(settings);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch settings" });
    }
});
// Get settings by group (e.g., 'google_maps')
router.get("/group/:groupName", auth_1.authenticate, async (req, res) => {
    try {
        const settings = await SystemSetting_1.SystemSetting.findAll({
            where: { group: req.params.groupName }
        });
        res.json(settings);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch group settings" });
    }
});
// Update or Create settings (Bulk)
router.post("/upsert", auth_1.authenticate, async (req, res) => {
    try {
        const { settings } = req.body; // Array of { key, value, group, description }
        if (!Array.isArray(settings)) {
            return res.status(400).json({ message: "Invalid settings format. Expected an array." });
        }
        for (const s of settings) {
            await SystemSetting_1.SystemSetting.upsert({
                key: s.key,
                value: s.value,
                group: s.group,
                description: s.description
            });
        }
        res.json({ success: true, message: "Settings updated successfully" });
    }
    catch (err) {
        console.error("Settings upsert error:", err);
        res.status(500).json({ error: "Failed to update settings" });
    }
});
// Get a single setting by key
router.get("/:key", async (req, res) => {
    try {
        const setting = await SystemSetting_1.SystemSetting.findOne({
            where: { key: req.params.key }
        });
        if (setting) {
            res.json(setting);
        }
        else {
            res.status(404).json({ message: "Setting not found" });
        }
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch setting" });
    }
});
exports.default = router;
//# sourceMappingURL=settings.js.map