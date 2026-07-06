"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Project_1 = require("../models/Project");
const auth_1 = require("../middleware/auth");
const auditLogger_1 = require("../utils/auditLogger");
const router = (0, express_1.Router)();
// GET all projects (supports filtering by isMarketing, category, status)
router.get("/", async (req, res, next) => {
    try {
        const { isMarketing, category, status } = req.query;
        const whereClause = {};
        if (isMarketing !== undefined) {
            whereClause.isMarketing = isMarketing === "true";
        }
        if (category) {
            whereClause.category = category;
        }
        if (status) {
            whereClause.status = status;
        }
        const projects = await Project_1.Project.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: projects });
    }
    catch (error) {
        next(error);
    }
});
// GET single project by ID
router.get("/:id", async (req, res, next) => {
    try {
        const project = await Project_1.Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        return res.json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
});
// POST create project
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const newProject = await Project_1.Project.create(req.body);
        const screenLabel = newProject.isMarketing ? "Marketing Listing" : "Project";
        await (0, auditLogger_1.logAuditAction)(req, `${screenLabel} Created`, `Created ${screenLabel.toLowerCase()} "${newProject.name}" (ID: ${newProject.id})`, "Success");
        return res.status(201).json({ success: true, data: newProject });
    }
    catch (error) {
        next(error);
    }
});
// PUT update project
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const project = await Project_1.Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        await project.update(req.body);
        const screenLabel = project.isMarketing ? "Marketing Listing" : "Project";
        await (0, auditLogger_1.logAuditAction)(req, `${screenLabel} Updated`, `Updated ${screenLabel.toLowerCase()} "${project.name}" (ID: ${project.id})`, "Success");
        return res.json({ success: true, data: project });
    }
    catch (error) {
        next(error);
    }
});
// DELETE project
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const project = await Project_1.Project.findByPk(req.params.id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }
        const name = project.name;
        const id = project.id;
        const screenLabel = project.isMarketing ? "Marketing Listing" : "Project";
        await project.destroy();
        await (0, auditLogger_1.logAuditAction)(req, `${screenLabel} Deleted`, `Deleted ${screenLabel.toLowerCase()} "${name}" (ID: ${id})`, "Success");
        return res.json({ success: true, message: "Project deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=projects.js.map