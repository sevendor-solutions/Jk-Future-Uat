"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Document_1 = require("../models/Document");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all documents
router.get("/", async (req, res, next) => {
    try {
        const { category, projectAssociation } = req.query;
        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        if (projectAssociation) {
            whereClause.projectAssociation = projectAssociation;
        }
        const docs = await Document_1.Document.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: docs });
    }
    catch (error) {
        next(error);
    }
});
// GET single document by ID
router.get("/:id", async (req, res, next) => {
    try {
        const doc = await Document_1.Document.findByPk(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }
        return res.json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
});
// POST create document
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const newDoc = await Document_1.Document.create(req.body);
        return res.status(201).json({ success: true, data: newDoc });
    }
    catch (error) {
        next(error);
    }
});
// PUT update document
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const doc = await Document_1.Document.findByPk(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }
        await doc.update(req.body);
        return res.json({ success: true, data: doc });
    }
    catch (error) {
        next(error);
    }
});
// DELETE document
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const doc = await Document_1.Document.findByPk(req.params.id);
        if (!doc) {
            return res.status(404).json({ success: false, message: "Document not found" });
        }
        await doc.destroy();
        return res.json({ success: true, message: "Document deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=documents.js.map