"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShopCategory_1 = require("../models/ShopCategory");
const router = (0, express_1.Router)();
// Get All Categories
router.get("/", async (req, res) => {
    try {
        const categories = await ShopCategory_1.ShopCategory.findAll();
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});
// Create Category
router.post("/", async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCat = await ShopCategory_1.ShopCategory.create({ name, description });
        res.status(201).json(newCat);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create category" });
    }
});
// Delete Category
router.delete("/:id", async (req, res) => {
    try {
        await ShopCategory_1.ShopCategory.destroy({ where: { id: req.params.id } });
        res.json({ message: "Category deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});
exports.default = router;
//# sourceMappingURL=shop-category.js.map