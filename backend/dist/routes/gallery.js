"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GalleryItem_1 = require("../models/GalleryItem");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all gallery items
router.get("/", async (req, res, next) => {
    try {
        const { category } = req.query;
        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        const items = await GalleryItem_1.GalleryItem.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: items });
    }
    catch (error) {
        next(error);
    }
});
// POST create gallery item
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const newItem = await GalleryItem_1.GalleryItem.create(req.body);
        return res.status(201).json({ success: true, data: newItem });
    }
    catch (error) {
        next(error);
    }
});
// DELETE gallery item
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const item = await GalleryItem_1.GalleryItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }
        await item.destroy();
        return res.json({ success: true, message: "Gallery item deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// PUT update gallery item
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const item = await GalleryItem_1.GalleryItem.findByPk(req.params.id);
        if (!item) {
            return res.status(404).json({ success: false, message: "Gallery item not found" });
        }
        await item.update(req.body);
        return res.json({ success: true, data: item });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=gallery.js.map