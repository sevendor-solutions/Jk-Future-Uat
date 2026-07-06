import { Router } from "express";
import { Expense } from "../models/Expense";
import { authenticateToken } from "../middleware/auth";
import { logAuditAction } from "../utils/auditLogger";

const router = Router();

// GET all expenses (optional filters: party, category)
router.get("/", authenticateToken, async (req, res, next) => {
    try {
        const expenses = await Expense.findAll({ order: [["billDate", "DESC"]] });
        return res.json({ success: true, data: expenses });
    } catch (error) {
        next(error);
    }
});

// GET single expense by ID
router.get("/:id", authenticateToken, async (req, res, next) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
        return res.json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
});

// POST create expense — auto-generate ID
router.post("/", authenticateToken, async (req, res, next) => {
    try {
        // Find max existing expense number
        const all = await Expense.findAll({ attributes: ["id"] });
        let nextNum = 1;
        all.forEach(e => {
            const match = e.id.match(/^exp(\d+)$/);
            if (match) {
                const num = parseInt(match[1], 10);
                if (num >= nextNum) nextNum = num + 1;
            }
        });
        const { id: _id, ...body } = req.body; // strip any incoming id
        const newExpense = await Expense.create({ ...body, id: `exp${nextNum}` });
        
        await logAuditAction(req, "Expense Created", `Created expense bill: "${newExpense.expenseNo || newExpense.id}" for party: "${newExpense.party}" (Total: ₹${newExpense.totalAmount})`, "Success");
        
        return res.status(201).json({ success: true, data: newExpense });
    } catch (error) {
        next(error);
    }
});

// PUT update expense
router.put("/:id", authenticateToken, async (req, res, next) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
        const { id: _id, ...body } = req.body;
        await expense.update(body);
        
        await logAuditAction(req, "Expense Updated", `Updated expense bill: "${expense.expenseNo || expense.id}" for party: "${expense.party}" (Total: ₹${expense.totalAmount})`, "Success");
        
        return res.json({ success: true, data: expense });
    } catch (error) {
        next(error);
    }
});

// DELETE expense
router.delete("/:id", authenticateToken, async (req, res, next) => {
    try {
        const expense = await Expense.findByPk(req.params.id);
        if (!expense) return res.status(404).json({ success: false, message: "Expense not found" });
        const billNo = expense.expenseNo || expense.id;
        const party = expense.party;
        const total = expense.totalAmount;
        await expense.destroy();
        
        await logAuditAction(req, "Expense Deleted", `Deleted expense bill: "${billNo}" of party: "${party}" (Total: ₹${total})`, "Success");
        
        return res.json({ success: true, message: "Expense deleted" });
    } catch (error) {
        next(error);
    }
});

export default router;
