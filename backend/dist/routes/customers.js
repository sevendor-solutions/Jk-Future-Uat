"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Customer_1 = require("../models/Customer");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all customers
router.get("/", auth_1.authenticateToken, async (req, res) => {
    try {
        const customers = await Customer_1.Customer.findAll({
            order: [['createdAt', 'DESC']]
        });
        res.json(customers);
    }
    catch (err) {
        console.error("Fetch customers error:", err);
        res.status(500).json({ error: "Failed to fetch customers" });
    }
});
// GET single customer
router.get("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findByPk(req.params.id);
        if (!customer)
            return res.status(404).json({ message: "Customer not found" });
        res.json(customer);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch customer" });
    }
});
// DELETE customer
router.delete("/:id", auth_1.authenticateToken, async (req, res) => {
    try {
        const customer = await Customer_1.Customer.findByPk(req.params.id);
        if (!customer)
            return res.status(404).json({ message: "Customer not found" });
        await customer.destroy();
        res.json({ message: "Customer account deleted successfully" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete customer" });
    }
});
exports.default = router;
//# sourceMappingURL=customers.js.map