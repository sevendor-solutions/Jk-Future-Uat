"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Enquiry_1 = require("../models/Enquiry");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all enquiries
router.get("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const enquiries = await Enquiry_1.Enquiry.findAll({
            order: [["date", "DESC"]]
        });
        return res.json({ success: true, data: enquiries });
    }
    catch (error) {
        next(error);
    }
});
// POST submit a new enquiry
router.post("/", async (req, res, next) => {
    try {
        const newEnquiry = await Enquiry_1.Enquiry.create(req.body);
        return res.status(201).json({ success: true, data: newEnquiry });
    }
    catch (error) {
        next(error);
    }
});
// PUT update enquiry status and/or notes
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const enquiry = await Enquiry_1.Enquiry.findByPk(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found" });
        }
        await enquiry.update(req.body);
        return res.json({ success: true, data: enquiry });
    }
    catch (error) {
        next(error);
    }
});
// DELETE enquiry
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const enquiry = await Enquiry_1.Enquiry.findByPk(req.params.id);
        if (!enquiry) {
            return res.status(404).json({ success: false, message: "Enquiry not found" });
        }
        await enquiry.destroy();
        return res.json({ success: true, message: "Enquiry deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=enquiries.js.map