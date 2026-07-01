"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const JobApplication_1 = require("../models/JobApplication");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all job applications
router.get("/applications", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const applications = await JobApplication_1.JobApplication.findAll({
            order: [["date", "DESC"]]
        });
        return res.json({ success: true, data: applications });
    }
    catch (error) {
        next(error);
    }
});
// POST submit a job application
router.post("/apply", async (req, res, next) => {
    try {
        const newApplication = await JobApplication_1.JobApplication.create(req.body);
        return res.status(201).json({ success: true, data: newApplication });
    }
    catch (error) {
        next(error);
    }
});
// PUT update job application status
router.put("/applications/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const application = await JobApplication_1.JobApplication.findByPk(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        await application.update(req.body);
        return res.json({ success: true, data: application });
    }
    catch (error) {
        next(error);
    }
});
// DELETE job application
router.delete("/applications/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const application = await JobApplication_1.JobApplication.findByPk(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: "Application not found" });
        }
        await application.destroy();
        return res.json({ success: true, message: "Application deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=careers.js.map