"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Shop_1 = require("../models/Shop");
const Area_1 = require("../models/Area");
const auth_1 = require("../middleware/auth");
const Product_1 = require("../models/Product");
const ShopInventory_1 = require("../models/ShopInventory");
const sequelize_1 = require("sequelize");
const logger_1 = require("../utils/logger");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
async function syncProductsForShop(shopId, templateIds, userId) {
    if (!Array.isArray(templateIds))
        return;
    // 1. Remove inventory items that are no longer selected
    const itemsToRemove = await ShopInventory_1.ShopInventory.findAll({
        where: {
            shopId,
            productId: { [sequelize_1.Op.notIn]: templateIds }
        }
    });
    for (const item of itemsToRemove) {
        await (0, logger_1.logAuditAction)(userId, 'DELETE', 'shop_inventories', item.id, item.toJSON(), null);
        await item.destroy();
    }
    // 2. Find existing inventory items to avoid duplicates
    const existingItems = await ShopInventory_1.ShopInventory.findAll({
        where: { shopId, productId: { [sequelize_1.Op.in]: templateIds } }
    });
    const existingProductIds = existingItems.map(p => p.productId);
    // 3. Add new inventory items from templates
    const newProductIds = templateIds.filter(id => !existingProductIds.includes(id));
    if (newProductIds.length > 0) {
        const templates = await Product_1.Product.findAll({ where: { id: newProductIds } });
        const additions = templates.map(t => ({
            shopId: shopId,
            productId: t.id,
            price: t.price,
            mrp: t.mrp,
            unit: t.unit,
            stockStatus: 'in_stock'
        }));
        const created = await ShopInventory_1.ShopInventory.bulkCreate(additions);
        for (const item of created) {
            await (0, logger_1.logAuditAction)(userId, 'CREATE', 'shop_inventories', item.id, null, item.toJSON());
        }
    }
}
const registerShopSchema = {
    shopName: { type: 'string', required: true },
    ownerName: { type: 'string', required: true },
    phone: { type: 'string', required: true },
    email: { type: 'string', required: true },
    areaId: { type: 'number', required: true },
    category: { type: 'string', required: true },
    address: { type: 'string', required: true },
    commissionRate: { type: 'number' }
};
router.post("/register", auth_1.authenticate, (0, validation_1.validateRequest)(registerShopSchema), async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = ['Super Admin', 'Admin', 'admin'].includes(user.role || user.roleName);
        const isAreaHead = (user.role || user.roleName) === 'Area Head';
        if (!isAdmin && !isAreaHead) {
            return res.status(403).json({ error: "Access denied" });
        }
        let { shopName, ownerName, phone, email, areaId, category, address, latitude, longitude, productIds, accountHolder, accountNumber, bankName, ifscCode, gstin, fssai, commissionRate } = req.body;
        if (isAreaHead)
            areaId = user.areaId;
        const newShop = await Shop_1.Shop.create({
            shopName,
            ownerName,
            phone,
            email,
            areaId: Number(areaId),
            category,
            address,
            latitude: latitude ? parseFloat(latitude) : null,
            longitude: longitude ? parseFloat(longitude) : null,
            accountHolder,
            accountNumber,
            bankName,
            ifscCode,
            gstin,
            fssai,
            commissionRate: commissionRate ? parseFloat(commissionRate) : 0
        });
        // Initialize Shop Inventory
        if (productIds && Array.isArray(productIds) && productIds.length > 0) {
            const templates = await Product_1.Product.findAll({ where: { id: productIds } });
            const initialInventory = templates.map(t => ({
                shopId: newShop.id,
                productId: t.id,
                price: t.price,
                mrp: t.mrp,
                unit: t.unit,
                stockStatus: 'in_stock'
            }));
            const created = await ShopInventory_1.ShopInventory.bulkCreate(initialInventory);
            for (const item of created) {
                await (0, logger_1.logAuditAction)(user.id, 'CREATE', 'shop_inventories', item.id, null, item.toJSON());
            }
        }
        res.status(201).json(newShop);
    }
    catch (err) {
        console.error("Shop registration failed:", err);
        res.status(500).json({ error: "Failed to register shop" });
    }
});
// Get Shops (Public for customers, filtered for Area Heads when authenticated)
router.get("/", async (req, res) => {
    try {
        const { areaId, searchTerm, category } = req.query;
        const user = req.user; // May be undefined for public access
        const whereClause = { isActive: true }; // Only show active shops by default
        // If user is authenticated and is Area Head, filter by their area
        if (user && user.role === "Area Head" && user.areaId) {
            whereClause.areaId = user.areaId;
        }
        else if (areaId) {
            // Admin or query parameter filtering
            whereClause.areaId = areaId;
        }
        if (category) {
            whereClause.category = category;
        }
        if (searchTerm) {
            whereClause[sequelize_1.Op.or] = [
                { shopName: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                { ownerName: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } },
                { phone: { [sequelize_1.Op.iLike]: `%${searchTerm}%` } }
            ];
        }
        const shops = await Shop_1.Shop.findAll({
            where: whereClause,
            include: [{ model: Area_1.Area, as: 'area' }],
            order: [['createdAt', 'DESC']]
        });
        res.json(shops);
    }
    catch (err) {
        console.error("Fetch shops error:", err);
        res.status(500).json({ message: "Failed to fetch shops", error: String(err) });
    }
});
// Get My Shop (For Shop Owner)
router.get("/my-shop", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const { User } = require('../models/User');
        const dbUser = await User.findByPk(user.id);
        if (!dbUser) {
            return res.status(404).json({ error: "User not found" });
        }
        let shop = null;
        // Priority 1: Check shopId field
        if (dbUser.shopId) {
            shop = await Shop_1.Shop.findByPk(dbUser.shopId);
        }
        // Priority 2: Fallback to email
        if (!shop && dbUser.email) {
            shop = await Shop_1.Shop.findOne({ where: { email: dbUser.email } });
        }
        // Priority 3: Fallback to shop name if it matches owner name? No, just email/id
        if (!shop) {
            return res.status(404).json({ error: "No shop linked to this account." });
        }
        res.json(shop);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch my shop" });
    }
});
// Update Shop Status
router.put("/:id/status", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const { status } = req.body;
        const shop = await Shop_1.Shop.findByPk(req.params.id);
        if (!shop)
            return res.status(404).json({ error: "Shop not found" });
        if (status === 'approved' && shop.pendingData) {
            try {
                const pending = JSON.parse(shop.pendingData);
                await shop.update({
                    ...pending,
                    status,
                    pendingData: null // Clear after applying
                });
                // Sync products if templateIds were pending
                if (pending.templateIds) {
                    await syncProductsForShop(shop.id, pending.templateIds, user.id);
                }
            }
            catch (e) {
                console.error("Failed to parse pending data", e);
                await shop.update({ status });
            }
        }
        else {
            await shop.update({ status });
        }
        res.json(shop);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update shop status" });
    }
});
// Get Single Shop (Admin/Area Head/Owner)
router.get("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const shop = await Shop_1.Shop.findByPk(req.params.id, { include: [Area_1.Area] });
        if (!shop)
            return res.status(404).json({ error: "Shop not found" });
        // Access Control
        const user = req.user;
        // Area Head can only view shops in their area
        if (user.role === 'Area Head' && String(shop.areaId) !== String(user.areaId)) {
            return res.status(403).json({ error: "Access denied: Shop not in your area" });
        }
        res.json(shop);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch shop" });
    }
});
// Update Shop Details
router.put("/:id", auth_1.authenticate, (0, validation_1.validateRequest)({
    shopName: { type: 'string' },
    ownerName: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string' },
    areaId: { type: 'number' },
    category: { type: 'string' },
    address: { type: 'string' }
}), async (req, res) => {
    try {
        const user = req.user;
        const { shopName, ownerName, phone, email, address, latitude, longitude, category, accountHolder, accountNumber, bankName, ifscCode, gstin, fssai, commissionRate } = req.body;
        const shop = await Shop_1.Shop.findByPk(req.params.id);
        if (!shop)
            return res.status(404).json({ error: "Shop not found" });
        // Area Head Access Control
        if (user.role === 'Area Head' && String(shop.areaId) !== String(user.areaId)) {
            return res.status(403).json({ error: "Access denied: You can only update shops in your area" });
        }
        // Logic: If Admin/AreaHead updates, update directly.
        // If Shop Owner updates, store in pendingData and wait for approval.
        if (user.role === 'Shop Owner') {
            const pendingFields = {
                shopName, ownerName, phone, email, address, latitude, longitude, category,
                accountHolder, accountNumber, bankName, ifscCode, gstin, fssai,
                templateIds: req.body.templateIds
            };
            await shop.update({
                pendingData: JSON.stringify(pendingFields),
                status: 'pending'
            });
            return res.json(shop);
        }
        // Admin/Area Head direct update
        await shop.update({
            shopName, ownerName, phone, email, address, latitude, longitude, category,
            accountHolder, accountNumber, bankName, ifscCode, gstin, fssai,
            commissionRate: commissionRate ? parseFloat(commissionRate) : shop.commissionRate,
            status: req.body.status || shop.status
        });
        // Immediate sync for Admin/Area Head
        if (req.body.templateIds) {
            await syncProductsForShop(shop.id, req.body.templateIds, user.id);
        }
        res.json(shop);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update shop details" });
    }
});
// Delete Shop (Only for Rejected/Cleanup)
router.delete("/:id", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'Super Admin' && user.role !== 'admin') {
            return res.status(403).json({ error: "Access denied" });
        }
        const shop = await Shop_1.Shop.findByPk(req.params.id);
        if (!shop)
            return res.status(404).json({ error: "Shop not found" });
        await shop.destroy();
        res.json({ message: "Shop deleted successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete shop" });
    }
});
// Toggle shop active/inactive status and sync with user
router.put("/:id/toggle-active", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const isAdmin = ['Super Admin', 'Admin', 'admin'].includes(user.role);
        const isAreaHead = user.role === 'Area Head';
        if (!isAdmin && !isAreaHead) {
            return res.status(403).json({ error: "Access denied" });
        }
        const shop = await Shop_1.Shop.findByPk(req.params.id);
        if (!shop)
            return res.status(404).json({ error: "Shop not found" });
        // Area Head can only toggle shops in their area
        if (isAreaHead && shop.areaId !== user.areaId) {
            return res.status(403).json({ error: "Access denied: You can only manage shops in your area" });
        }
        // Toggle the shop's active status
        const newStatus = !shop.isActive;
        await shop.update({ isActive: newStatus });
        // Find and update the associated shop owner user
        const { User } = await Promise.resolve().then(() => __importStar(require("../models/User")));
        const shopOwner = await User.findOne({ where: { shopId: shop.id } });
        if (shopOwner) {
            const userStatus = newStatus ? 'active' : 'inactive';
            await shopOwner.update({ status: userStatus });
        }
        res.json({
            message: `Shop ${newStatus ? 'activated' : 'deactivated'} successfully`,
            shop,
            userUpdated: !!shopOwner
        });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to toggle shop status" });
    }
});
exports.default = router;
//# sourceMappingURL=shops.js.map