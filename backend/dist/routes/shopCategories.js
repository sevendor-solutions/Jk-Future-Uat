"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ShopCategory_1 = require("../models/ShopCategory");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get All Categories (Public for Registration)
router.get("/", async (req, res) => {
    try {
        const categories = await ShopCategory_1.ShopCategory.findAll();
        res.json(categories);
    }
    catch (error) {
        res.status(500).json({ message: "Failed to fetch categories" });
    }
});
// Create Category (Admin/Area Head)
router.post("/", auth_1.authenticate, (0, auth_1.authorize)(["manage_shop_categories"]), async (req, res) => {
    try {
        const { name, description } = req.body;
        const newCat = await ShopCategory_1.ShopCategory.create({ name, description });
        res.status(201).json(newCat);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create category" });
    }
});
// Delete Category
router.delete("/:id", auth_1.authenticate, (0, auth_1.authorize)(["manage_shop_categories"]), async (req, res) => {
    try {
        await ShopCategory_1.ShopCategory.destroy({ where: { id: req.params.id } });
        res.json({ message: "Category deleted" });
    }
    catch (error) {
        res.status(500).json({ message: "Failed to delete category" });
    }
});
exports.default = router;
//# sourceMappingURL=shopCategories.js.map