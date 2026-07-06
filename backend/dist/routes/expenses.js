"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Expense_1 = require("../models/Expense");
const auth_1 = require("../middleware/auth");
const auditLogger_1 = require("../utils/auditLogger");
const router = (0, express_1.Router)();
// GET all expenses (optional filters: party, category)
router.get("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const expenses = await Expense_1.Expense.findAll({ order: [["billDate", "DESC"]] });
        return res.json({ success: true, data: expenses });
    }
    catch (error) {
        next(error);
    }
});
// GET single expense by ID
router.get("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const expense = await Expense_1.Expense.findByPk(req.params.id);
        if (!expense)
            return res.status(404).json({ success: false, message: "Expense not found" });
        return res.json({ success: true, data: expense });
    }
    catch (error) {
        next(error);
    }
});
// POST create expense — auto-generate ID
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        // Find max existing expense number
        const all = await Expense_1.Expense.findAll({ attributes: ["id"] });
        let nextNum = 1;
        all.forEach(e => {
            const match = e.id.match(/^exp(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num >= nextNum)
                    nextNum = num + 1;
            }
        });
        const { id: _id, ...body } = req.body; // strip any incoming id
        const newExpense = await Expense_1.Expense.create({ ...body, id: `exp${nextNum}` });
        await (0, auditLogger_1.logAuditAction)(req, "Expense Created", `Created expense bill: "${newExpense.expenseNo || newExpense.id}" for party: "${newExpense.party}" (Total: ₹${newExpense.totalAmount})`, "Success");
        return res.status(201).json({ success: true, data: newExpense });
    }
    catch (error) {
        next(error);
    }
});
// PUT update expense
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const expense = await Expense_1.Expense.findByPk(req.params.id);
        if (!expense)
            return res.status(404).json({ success: false, message: "Expense not found" });
        const { id: _id, ...body } = req.body;
        await expense.update(body);
        await (0, auditLogger_1.logAuditAction)(req, "Expense Updated", `Updated expense bill: "${expense.expenseNo || expense.id}" for party: "${expense.party}" (Total: ₹${expense.totalAmount})`, "Success");
        return res.json({ success: true, data: expense });
    }
    catch (error) {
        next(error);
    }
});
// DELETE expense
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const expense = await Expense_1.Expense.findByPk(req.params.id);
        if (!expense)
            return res.status(404).json({ success: false, message: "Expense not found" });
        const billNo = expense.expenseNo || expense.id;
        const party = expense.party;
        const total = expense.totalAmount;
        await expense.destroy();
        await (0, auditLogger_1.logAuditAction)(req, "Expense Deleted", `Deleted expense bill: "${billNo}" of party: "${party}" (Total: ₹${total})`, "Success");
        return res.json({ success: true, message: "Expense deleted" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=expenses.js.map