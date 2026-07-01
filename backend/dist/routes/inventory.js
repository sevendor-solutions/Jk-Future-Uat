"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ShopInventory_1 = require("../models/ShopInventory");
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const Shop_1 = require("../models/Shop");
const auth_1 = require("../middleware/auth");
const logger_1 = require("../utils/logger");
const sequelize_1 = require("sequelize");
const validation_1 = require("../middleware/validation");
const image_1 = require("../utils/image");
const router = (0, express_1.Router)();
// Get shop inventory
router.get("/", async (req, res) => {
    try {
        const { shopId } = req.query;
        // user is optional here for public access
        const user = req.user;
        const targetShopId = shopId || (user ? user.shopId : null);
        console.log(`[Inventory] Fetching for shop: ${targetShopId}`);
        if (!targetShopId) {
            return res.status(400).json({ error: "shopId is required" });
        }
        // Public read access allowed for shop inventory
        const data = await ShopInventory_1.ShopInventory.findAll({
            where: { shopId: targetShopId },
            include: [{
                    model: Product_1.Product,
                    include: [{ model: Category_1.Category, as: 'category' }]
                }]
        });
        console.log(`[Inventory] Found ${data.length} items for shop ${targetShopId}`);
        // Map for easier frontend use
        const mapped = data.map(item => {
            const product = item.product?.toJSON() || {};
            return {
                id: item.id,
                productId: item.productId,
                name: product.name,
                image: (0, image_1.getFullImageUrl)(req, product.image),
                price: item.price,
                mrp: item.mrp,
                unit: item.unit,
                stockStatus: item.stockStatus,
                categoryId: product.categoryId,
                category: product.category?.name || 'Veg',
                shopId: item.shopId,
                isActive: item.isActive
            };
        });
        res.json(mapped);
    }
    catch (err) {
        console.error("Fetch inventory error:", err);
        res.status(500).json({ error: "Failed to fetch inventory" });
    }
});
// Update inventory item
router.put("/:id", auth_1.authenticate, (0, validation_1.validateRequest)({
    price: { type: 'number' },
    mrp: { type: 'number' },
    unit: { type: 'string' },
    stockStatus: { type: 'string' },
    isActive: { type: 'boolean' }
}), async (req, res) => {
    try {
        const user = req.user;
        const item = await ShopInventory_1.ShopInventory.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ error: "Inventory item not found" });
        const isAdmin = ['Super Admin', 'Admin', 'admin', 'Area Head'].includes(user.role || user.roleName);
        if (!isAdmin && user.shopId !== item.shopId) {
            return res.status(403).json({ error: "Access denied" });
        }
        const oldValues = item.toJSON();
        const { price, mrp, unit, stockStatus, isActive } = req.body;
        const updateData = {};
        if (price !== undefined)
            updateData.price = parseFloat(price);
        if (mrp !== undefined)
            updateData.mrp = mrp ? parseFloat(mrp) : null;
        if (unit !== undefined)
            updateData.unit = unit;
        if (stockStatus !== undefined)
            updateData.stockStatus = stockStatus;
        if (isActive !== undefined)
            updateData.isActive = isActive;
        await item.update(updateData);
        await (0, logger_1.logAuditAction)(user.id, 'UPDATE', 'shop_inventories', item.id, oldValues, item.toJSON());
        res.json(item);
    }
    catch (err) {
        console.error("Update inventory error:", err);
        res.status(500).json({ error: "Failed to update inventory" });
    }
});
// Sync templates to shop inventory
router.post("/sync", auth_1.authenticate, (0, validation_1.validateRequest)({
    shopId: { type: 'number', required: true },
    productIds: { type: 'array', required: true }
}), async (req, res) => {
    try {
        const { shopId, productIds } = req.body;
        const user = req.user;
        if (!shopId || !Array.isArray(productIds)) {
            return res.status(400).json({ error: "shopId and productIds are required" });
        }
        // 1. Remove items no longer in sync
        const itemsToRemove = await ShopInventory_1.ShopInventory.findAll({
            where: { shopId, productId: { [sequelize_1.Op.notIn]: productIds } }
        });
        for (const item of itemsToRemove) {
            await (0, logger_1.logAuditAction)(user.id, 'DELETE', 'shop_inventories', item.id, item.toJSON(), null);
            await item.destroy();
        }
        // 2. Find existing
        const existing = await ShopInventory_1.ShopInventory.findAll({
            where: { shopId, productId: { [sequelize_1.Op.in]: productIds } }
        });
        const existingProductIds = existing.map(e => e.productId);
        // 3. Add new
        const newProductIds = productIds.filter(id => !existingProductIds.includes(id));
        if (newProductIds.length > 0) {
            const templates = await Product_1.Product.findAll({ where: { id: newProductIds } });
            const additions = templates.map(t => ({
                shopId,
                productId: t.id,
                price: t.price,
                mrp: t.mrp,
                unit: t.unit,
                stockStatus: 'in_stock'
            }));
            const created = await ShopInventory_1.ShopInventory.bulkCreate(additions);
            for (const item of created) {
                await (0, logger_1.logAuditAction)(user.id, 'CREATE', 'shop_inventories', item.id, null, item.toJSON());
            }
        }
        res.json({ message: "Inventory synced successfully" });
    }
    catch (err) {
        console.error("Sync inventory error:", err);
        res.status(500).json({ error: "Failed to sync inventory" });
    }
});
// Get area-wise inventory for customers
router.get("/area/:areaId", async (req, res) => {
    try {
        const { areaId } = req.params;
        const { categoryId, shopCategory } = req.query;
        const whereClause = { isActive: true, stockStatus: 'in_stock' };
        const shopWhere = { areaId, isActive: true };
        if (shopCategory) {
            shopWhere.category = shopCategory;
        }
        const data = await ShopInventory_1.ShopInventory.findAll({
            where: whereClause,
            include: [
                {
                    model: Shop_1.Shop,
                    as: 'shop',
                    where: shopWhere,
                    attributes: ['id', 'shopName', 'address', 'category']
                },
                {
                    model: Product_1.Product,
                    as: 'product',
                    where: categoryId ? { categoryId } : {},
                    include: [{ model: Category_1.Category, as: 'category' }]
                }
            ],
            limit: 50,
            order: [['createdAt', 'DESC']]
        });
        // Map for easier frontend use
        const mapped = data.map(item => {
            const product = item.product?.toJSON() || {};
            const shop = item.shop?.toJSON() || {};
            return {
                id: item.id,
                productId: item.productId,
                name: product.name,
                image: (0, image_1.getFullImageUrl)(req, product.image),
                price: item.price,
                mrp: item.mrp,
                unit: item.unit,
                stockStatus: item.stockStatus,
                categoryId: product.categoryId,
                category: product.category?.name || 'Veg',
                shopId: item.shopId,
                shopName: shop.shopName,
                shopCategory: shop.category,
                isActive: item.isActive
            };
        });
        res.json(mapped);
    }
    catch (err) {
        console.error("Fetch area inventory error:", err);
        res.status(500).json({ error: "Failed to fetch area inventory" });
    }
});
exports.default = router;
//# sourceMappingURL=inventory.js.map