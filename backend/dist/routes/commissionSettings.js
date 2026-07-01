"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CommissionSettings_1 = require("../models/CommissionSettings");
const Shop_1 = require("../models/Shop");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get global commission settings
router.get("/global", async (req, res) => {
    try {
        let settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: null } });
        // Create default global settings if they don't exist
        if (!settings) {
            settings = await CommissionSettings_1.CommissionSettings.create({
                areaId: null,
                handlingFee: 10,
                baseDeliveryFee: 40,
                baseDeliveryKmRange: 5,
                perKmFee: 15,
                minimumOrderAmount: 100,
                shopCommission: 12,
                surgeMultiplier: 1.0,
                platformFee: 2,
                deliveryCutPercentage: 25
            });
        }
        res.json(settings);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch global settings" });
    }
});
// Get settings for a specific area (falls back to global if no area-specific settings)
router.get("/area/:areaId", async (req, res) => {
    try {
        const { areaId } = req.params;
        // Try to get area-specific settings
        let settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: parseInt(areaId) } });
        // If no area-specific settings, fall back to global
        if (!settings) {
            settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: null } });
        }
        if (!settings) {
            return res.status(404).json({ success: false, message: "No settings found" });
        }
        res.json({ ...settings.toJSON(), isAreaSpecific: settings.areaId !== null });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch area settings" });
    }
});
// Get settings for a specific shop (hierarchy: Shop Commission > Area/Global Fees)
router.get("/shop/:shopId", async (req, res) => {
    try {
        const { shopId } = req.params;
        const shop = await Shop_1.Shop.findByPk(shopId);
        if (!shop) {
            return res.status(404).json({ success: false, message: "Shop not found" });
        }
        // 1. Get the base settings (Area or Global)
        let baseSettings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: shop.areaId } });
        let baseType = 'area';
        if (!baseSettings) {
            baseSettings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: null } });
            baseType = 'global';
        }
        if (!baseSettings) {
            return res.status(404).json({ success: false, message: "No base settings found" });
        }
        // 2. Look for shop-specific override (specifically for commission)
        const shopOverride = await CommissionSettings_1.CommissionSettings.findOne({ where: { shopId: parseInt(shopId) } });
        // 3. Construct the merged object
        const finalSettings = {
            ...baseSettings.toJSON(),
            source: shopOverride ? 'shop' : baseType, // If shop override exists, source is shop
            isShopSpecific: shopOverride !== null,
            isAreaSpecific: baseSettings.areaId !== null
        };
        // 4. If shop-specific commission exists, override ONLY that field
        if (shopOverride) {
            finalSettings.shopCommission = shopOverride.shopCommission;
        }
        res.json(finalSettings);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to fetch shop settings" });
    }
});
// Update global settings (Super Admin only)
router.put("/global", auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        if (user.role !== 'Super Admin' && user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const { handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee, minimumOrderAmount, shopCommission, surgeMultiplier, platformFee, deliveryCutPercentage } = req.body;
        let settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: null } });
        if (settings) {
            await settings.update({
                handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee,
                minimumOrderAmount, shopCommission, surgeMultiplier, platformFee,
                deliveryCutPercentage
            });
        }
        else {
            settings = await CommissionSettings_1.CommissionSettings.create({
                areaId: null,
                handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee,
                minimumOrderAmount, shopCommission, surgeMultiplier, platformFee,
                deliveryCutPercentage
            });
        }
        res.json({ success: true, message: "Global settings updated successfully", data: settings });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update global settings" });
    }
});
// Update area-specific settings (Super Admin or Area Head)
router.put("/area/:areaId", auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { areaId } = req.params;
        // Check permissions
        const isSuperAdmin = user.role === 'Super Admin' || user.role === 'admin';
        const isAreaHead = user.role === 'Area Head' && user.areaId === parseInt(areaId);
        if (!isSuperAdmin && !isAreaHead) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const { handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee, minimumOrderAmount, shopCommission, surgeMultiplier, platformFee, deliveryCutPercentage } = req.body;
        let settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: parseInt(areaId) } });
        if (settings) {
            await settings.update({
                handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee,
                minimumOrderAmount, shopCommission, surgeMultiplier, platformFee,
                deliveryCutPercentage
            });
        }
        else {
            settings = await CommissionSettings_1.CommissionSettings.create({
                areaId: parseInt(areaId),
                handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee,
                minimumOrderAmount, shopCommission, surgeMultiplier, platformFee,
                deliveryCutPercentage
            });
        }
        res.json({ success: true, message: "Area settings updated successfully", data: settings });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update area settings" });
    }
});
// Delete area-specific settings (reset to global)
router.delete("/area/:areaId", auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { areaId } = req.params;
        const isSuperAdmin = user.role === 'Super Admin' || user.role === 'admin';
        const isAreaHead = user.role === 'Area Head' && user.areaId === parseInt(areaId);
        if (!isSuperAdmin && !isAreaHead) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { areaId: parseInt(areaId) } });
        if (settings) {
            await settings.destroy();
            res.json({ success: true, message: "Area settings deleted, now using global settings" });
        }
        else {
            res.json({ success: true, message: "No area-specific settings to delete" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete area settings" });
    }
});
// Update shop-specific settings (Super Admin or Shop Owner/Area Head for that shop)
router.put("/shop/:shopId", auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { shopId } = req.params;
        const shop = await Shop_1.Shop.findByPk(shopId);
        if (!shop)
            return res.status(404).json({ success: false, message: "Shop not found" });
        // Permissions: Super Admin, Area Head (if shop in area), or Shop Owner (if it's their shop)
        const isSuperAdmin = user.role === 'Super Admin' || user.role === 'admin';
        const isAreaHead = user.role === 'Area Head' && user.areaId === shop.areaId;
        const isShopOwner = (user.role === 'Shop Owner' || user.roleName === 'Shop Owner') && user.shopId === parseInt(shopId);
        if (!isSuperAdmin && !isAreaHead && !isShopOwner) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const { handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee, minimumOrderAmount, shopCommission, surgeMultiplier, platformFee, deliveryCutPercentage } = req.body;
        let settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { shopId: parseInt(shopId) } });
        if (settings) {
            await settings.update({
                handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee,
                minimumOrderAmount, shopCommission, surgeMultiplier, platformFee,
                deliveryCutPercentage
            });
        }
        else {
            settings = await CommissionSettings_1.CommissionSettings.create({
                shopId: parseInt(shopId),
                areaId: shop.areaId, // Keep areaId for reference if needed
                handlingFee, baseDeliveryFee, baseDeliveryKmRange, perKmFee,
                minimumOrderAmount, shopCommission, surgeMultiplier, platformFee,
                deliveryCutPercentage
            });
        }
        res.json({ success: true, message: "Shop settings updated successfully", data: settings });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to update shop settings" });
    }
});
// Delete shop-specific settings (reset to area/global)
router.delete("/shop/:shopId", auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const { shopId } = req.params;
        const shop = await Shop_1.Shop.findByPk(shopId);
        if (!shop)
            return res.status(404).json({ success: false, message: "Shop not found" });
        const isSuperAdmin = user.role === 'Super Admin' || user.role === 'admin';
        const isAreaHead = user.role === 'Area Head' && user.areaId === shop.areaId;
        if (!isSuperAdmin && !isAreaHead) {
            return res.status(403).json({ success: false, message: "Access denied" });
        }
        const settings = await CommissionSettings_1.CommissionSettings.findOne({ where: { shopId: parseInt(shopId) } });
        if (settings) {
            await settings.destroy();
            res.json({ success: true, message: "Shop settings deleted, now using area/global defaults" });
        }
        else {
            res.json({ success: true, message: "No shop-specific settings to delete" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Failed to delete shop settings" });
    }
});
exports.default = router;
//# sourceMappingURL=commissionSettings.js.map