"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_1 = require("../models/Order");
const OrderItem_1 = require("../models/OrderItem");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.get("/", auth_1.authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        const whereClause = {};
        if (user.areaId && user.username !== 'admin') {
            whereClause.areaId = user.areaId;
        }
        const orders = await Order_1.Order.findAll({
            where: whereClause,
            include: [OrderItem_1.OrderItem],
            order: [["createdAt", "DESC"]]
        });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});
router.post("/", async (req, res) => {
    try {
        const { items, ...orderData } = req.body;
        const newOrder = await Order_1.Order.create(orderData);
        if (items && Array.isArray(items) && items.length > 0) {
            const orderItems = items.map((item) => ({
                ...item,
                orderId: newOrder.id
            }));
            await OrderItem_1.OrderItem.bulkCreate(orderItems);
        }
        // Refetch to return full object including items
        const fullOrder = await Order_1.Order.findByPk(newOrder.id, { include: [OrderItem_1.OrderItem] });
        res.status(201).json(fullOrder);
    }
    catch (err) {
        console.error("Order creation error:", err);
        res.status(500).json({ error: "Failed to create order" });
    }
});
router.get("/:id", async (req, res) => {
    try {
        const order = await Order_1.Order.findByPk(req.params.id, { include: [OrderItem_1.OrderItem] });
        if (order)
            res.json(order);
        else
            res.status(404).json({ message: "Order not found" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch order" });
    }
});
// Partner specific: Get available orders in their area
router.get("/available/:areaId", async (req, res) => {
    try {
        const { areaId } = req.params;
        const orders = await Order_1.Order.findAll({
            where: {
                areaId,
                status: 'Pending',
                partnerId: null
            },
            include: [OrderItem_1.OrderItem],
            order: [["createdAt", "DESC"]]
        });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch available orders" });
    }
});
// Partner accepts an order
router.post("/:id/accept", async (req, res) => {
    try {
        const { id } = req.params;
        const { partnerId } = req.body;
        const order = await Order_1.Order.findByPk(id);
        if (!order)
            return res.status(404).json({ message: "Order not found" });
        if (order.partnerId)
            return res.status(400).json({ message: "Order already accepted by another partner" });
        order.partnerId = partnerId;
        order.status = 'Accepted';
        await order.save();
        res.json({ success: true, order });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to accept order" });
    }
});
// Update Order Status (Picked Up, Delivered, etc.)
router.put("/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const order = await Order_1.Order.findByPk(id);
        if (!order)
            return res.status(404).json({ message: "Order not found" });
        order.status = status;
        // If delivered, maybe add logic for earnings here
        if (status === 'Delivered') {
            // Mock earning logic: +50 to partner wallet
            if (order.partnerId) {
                const { User } = require("../models/User");
                const partner = await User.findByPk(order.partnerId);
                if (partner) {
                    partner.walletBalance = (Number(partner.walletBalance) || 0) + 50;
                    await partner.save();
                }
            }
        }
        await order.save();
        res.json({ success: true, status: order.status });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update status" });
    }
});
// Customer specific: Get their order history
router.get("/customer/:phone", async (req, res) => {
    try {
        const { phone } = req.params;
        const orders = await Order_1.Order.findAll({
            where: { customerPhone: phone },
            include: [OrderItem_1.OrderItem],
            order: [["createdAt", "DESC"]],
            limit: 20
        });
        res.json(orders);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch customer orders" });
    }
});
exports.default = router;
//# sourceMappingURL=order.js.map