"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const logger_1 = require("../utils/logger");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
// Categories
router.get("/categories", async (req, res) => {
    try {
        const data = await Category_1.Category.findAll({ order: [['id', 'ASC']] });
        res.json(data);
    }
    catch (error) {
        console.error("Fetch categories error:", error);
        res.status(500).json({ error: "Failed to fetch categories" });
    }
});
router.post("/categories", auth_1.authenticate, (0, validation_1.validateRequest)({
    name: { type: 'string', required: true },
    description: { type: 'string' }
}), async (req, res) => {
    try {
        const user = req.user;
        const { name, description } = req.body;
        const newItem = await Category_1.Category.create({ name, description });
        await (0, logger_1.logAuditAction)(user.id, 'CREATE', 'categories', newItem.id, null, newItem.toJSON());
        res.status(201).json(newItem);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create category" });
    }
});
router.put("/categories/:id", auth_1.authenticate, (0, validation_1.validateRequest)({
    name: { type: 'string' },
    description: { type: 'string' }
}), async (req, res) => {
    try {
        const user = req.user;
        const item = await Category_1.Category.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ error: "Category not found" });
        const oldValues = item.toJSON();
        await item.update(req.body);
        await (0, logger_1.logAuditAction)(user.id, 'UPDATE', 'categories', item.id, oldValues, item.toJSON());
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update category" });
    }
});
router.delete("/categories/:id", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const item = await Category_1.Category.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ error: "Category not found" });
        await (0, logger_1.logAuditAction)(user.id, 'DELETE', 'categories', item.id, item.toJSON(), null);
        await item.destroy();
        res.json({ message: "Category deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete category" });
    }
});
// Master Catalog (Products)
router.get("/", async (req, res) => {
    try {
        const { categories } = req.query;
        // Strictly only templates (no shopId)
        const whereClause = { shopId: null };
        const data = await Product_1.Product.findAll({
            where: whereClause,
            include: [Category_1.Category]
        });
        const productsWithUrl = (data || []).map(p => {
            if (!p)
                return null;
            const product = p.toJSON ? p.toJSON() : p;
            if (product.image && typeof product.image === 'string' && !product.image.startsWith('http')) {
                const host = req.get('host');
                if (host) {
                    product.image = `${req.protocol}://${host}/uploads/${product.image}`;
                }
            }
            return product;
        }).filter(Boolean);
        res.json(productsWithUrl);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch master catalog" });
    }
});
router.post("/", auth_1.authenticate, upload_1.upload.single('image'), (0, validation_1.validateRequest)({
    name: { type: 'string', required: true },
    price: { type: 'number', required: true },
    categoryId: { type: 'number', required: true },
    mrp: { type: 'number' },
    unit: { type: 'string' }
}), async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = ['Super Admin', 'Admin', 'admin'].includes(user.role || user.roleName);
        if (!isAdmin)
            return res.status(403).json({ error: "Access denied" });
        const { name, price, categoryId, mrp, unit } = req.body;
        let imagePath = "";
        if (req.file)
            imagePath = req.file.filename;
        else if (req.body.image)
            imagePath = req.body.image;
        const newItem = await Product_1.Product.create({
            name,
            price: parseFloat(price),
            mrp: mrp ? parseFloat(mrp) : null,
            unit: unit || null,
            categoryId: categoryId ? parseInt(categoryId) : null,
            shopId: null, // Always null for templates
            image: imagePath
        });
        await (0, logger_1.logAuditAction)(user.id, 'CREATE', 'products', newItem.id, null, newItem.toJSON());
        res.status(201).json(newItem);
    }
    catch (err) {
        console.error("Create template error:", err);
        res.status(500).json({ error: "Failed to create master template" });
    }
});
router.put("/:id", auth_1.authenticate, upload_1.upload.single('image'), (0, validation_1.validateRequest)({
    name: { type: 'string' },
    price: { type: 'number' },
    categoryId: { type: 'number' },
    mrp: { type: 'number' },
    unit: { type: 'string' }
}), async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = ['Super Admin', 'Admin', 'admin'].includes(user.role || user.roleName);
        if (!isAdmin)
            return res.status(403).json({ error: "Access denied" });
        const product = await Product_1.Product.findOne({ where: { id: req.params.id, shopId: null } });
        if (!product)
            return res.status(404).json({ error: "Master product not found" });
        const oldValues = product.toJSON();
        const { name, price, categoryId, mrp, unit } = req.body;
        const updateData = {};
        if (name !== undefined)
            updateData.name = name;
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (mrp !== undefined)
            updateData.mrp = mrp ? parseFloat(mrp) : null;
        if (unit !== undefined)
            updateData.unit = unit;
        if (categoryId !== undefined)
            updateData.categoryId = categoryId ? parseInt(categoryId) : null;
        if (req.file)
            updateData.image = req.file.filename;
        await product.update(updateData);
        await (0, logger_1.logAuditAction)(user.id, 'UPDATE', 'products', product.id, oldValues, product.toJSON());
        res.json(product);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update master product" });
    }
});
router.delete("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = ['Super Admin', 'Admin', 'admin'].includes(user.role || user.roleName);
        if (!isAdmin)
            return res.status(403).json({ error: "Access denied" });
        const product = await Product_1.Product.findOne({ where: { id: req.params.id, shopId: null } });
        if (!product)
            return res.status(404).json({ error: "Master product not found" });
        await (0, logger_1.logAuditAction)(user.id, 'DELETE', 'products', product.id, product.toJSON(), null);
        await product.destroy();
        res.json({ message: "Master template deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete template" });
    }
});
exports.default = router;
//# sourceMappingURL=product.js.map