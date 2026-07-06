"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ExpenseCategory_1 = require("../models/ExpenseCategory");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all expense categories
router.get("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const categories = await ExpenseCategory_1.ExpenseCategory.findAll({ order: [["name", "ASC"]] });
        return res.json({ success: true, data: categories });
    }
    catch (error) {
        next(error);
    }
});
// POST create expense category
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const all = await ExpenseCategory_1.ExpenseCategory.findAll({ attributes: ["id"] });
        let nextNum = 1;
        all.forEach(c => {
            const match = c.id.match(/^ec(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num >= nextNum)
                    nextNum = num + 1;
            }
        });
        const { id: _id, ...body } = req.body;
        const newCat = await ExpenseCategory_1.ExpenseCategory.create({ ...body, id: `ec${nextNum}` });
        return res.status(201).json({ success: true, data: newCat });
    }
    catch (error) {
        next(error);
    }
});
// DELETE expense category
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const cat = await ExpenseCategory_1.ExpenseCategory.findByPk(req.params.id);
        if (!cat)
            return res.status(404).json({ success: false, message: "Category not found" });
        await cat.destroy();
        return res.json({ success: true, message: "Category deleted" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=expenseCategories.js.map