"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const MarketingAgent_1 = require("../models/MarketingAgent");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all marketing agents
router.get("/", async (req, res, next) => {
    try {
        const agents = await MarketingAgent_1.MarketingAgent.findAll({
            order: [["name", "ASC"]]
        });
        return res.json({ success: true, data: agents });
    }
    catch (error) {
        next(error);
    }
});
// GET marketing agent by ID
router.get("/:id", async (req, res, next) => {
    try {
        const agent = await MarketingAgent_1.MarketingAgent.findByPk(req.params.id);
        if (!agent) {
            return res.status(404).json({ success: false, message: "Marketing agent not found" });
        }
        return res.json({ success: true, data: agent });
    }
    catch (error) {
        next(error);
    }
});
// POST create marketing agent
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        // Strip null/undefined id — let the @BeforeValidate hook auto-generate it
        const { id, ...agentData } = req.body;
        const newAgent = await MarketingAgent_1.MarketingAgent.create(agentData);
        return res.status(201).json({ success: true, data: newAgent });
    }
    catch (error) {
        next(error);
    }
});
// PUT update marketing agent
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const agent = await MarketingAgent_1.MarketingAgent.findByPk(req.params.id);
        if (!agent) {
            return res.status(404).json({ success: false, message: "Marketing agent not found" });
        }
        await agent.update(req.body);
        return res.json({ success: true, data: agent });
    }
    catch (error) {
        next(error);
    }
});
// DELETE marketing agent
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const agent = await MarketingAgent_1.MarketingAgent.findByPk(req.params.id);
        if (!agent) {
            return res.status(404).json({ success: false, message: "Marketing agent not found" });
        }
        await agent.destroy();
        return res.json({ success: true, message: "Marketing agent deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=marketingAgents.js.map