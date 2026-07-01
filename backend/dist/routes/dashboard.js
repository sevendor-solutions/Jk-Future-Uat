"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = require("../models/Order");
const Shop_1 = require("../models/Shop");
const User_1 = require("../models/User");
const AuditLog_1 = require("../models/AuditLog");
const auth_1 = require("../middleware/auth");
const sequelize_1 = require("sequelize");
const router = (0, express_1.Router)();
router.get("/stats", auth_1.authenticate, async (req, res) => {
    try {
        const user = req.user;
        const role = user.role;
        const areaId = user.areaId;
        const shopId = user.shopId;
        let orderWhere = {};
        let shopWhere = {};
        let userWhere = {};
        if (role === 'Area Head') {
            orderWhere.areaId = areaId;
            shopWhere.areaId = areaId;
            userWhere.areaId = areaId;
        }
        else if (role === 'Shop Owner') {
            orderWhere.shopId = shopId;
            // Shop owner stats are mostly about their orders
        }
        const totalOrders = await Order_1.Order.count({ where: orderWhere });
        const activeDeliveries = await Order_1.Order.count({
            where: {
                ...orderWhere,
                status: { [sequelize_1.Op.notIn]: ['Delivered', 'Cancelled'] }
            }
        });
        const totalShops = await Shop_1.Shop.count({ where: shopWhere });
        const totalUsers = await User_1.User.count({ where: userWhere });
        const deliveredOrders = await Order_1.Order.findAll({
            where: {
                ...orderWhere,
                status: 'Delivered'
            }
        });
        const totalRevenue = deliveredOrders.reduce((sum, order) => sum + Number(order.amount), 0);
        // Recent Activity
        const recentActivity = await AuditLog_1.AuditLog.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']]
        });
        const stats = {
            totalOrders,
            activeDeliveries,
            totalShops,
            totalUsers,
            totalRevenue,
            pendingOrders: await Order_1.Order.count({ where: { ...orderWhere, status: 'Pending' } })
        };
        res.json({ stats, recentActivity });
    }
    catch (err) {
        console.error("Dashboard stats error:", err);
        res.status(500).json({ error: "Failed to fetch dashboard statistics" });
    }
});
exports.default = router;
//# sourceMappingURL=dashboard.js.map