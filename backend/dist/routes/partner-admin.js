"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Partner_1 = require("../models/Partner");
const PartnerDocument_1 = require("../models/PartnerDocument");
const router = (0, express_1.Router)();
// Get All Partners (with filters)
router.get("/", async (req, res) => {
    try {
        const { status } = req.query;
        const whereClause = {};
        if (status) {
            whereClause.approvalStatus = status;
        }
        const partners = await Partner_1.Partner.findAll({
            where: whereClause,
            order: [['createdAt', 'DESC']]
        });
        res.json(partners);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch partners" });
    }
});
// Approve Partner
router.put("/:id/approve", async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await Partner_1.Partner.findByPk(id);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        partner.approvalStatus = 'approved';
        await partner.save();
        res.json({ message: "Partner approved successfully", partner });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to approve partner" });
    }
});
// Reject Partner
router.put("/:id/reject", async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const partner = await Partner_1.Partner.findByPk(id);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        partner.approvalStatus = 'rejected';
        partner.rejectionReason = reason || 'Documents invalid or incomplete.';
        await partner.save();
        res.json({ message: "Partner rejected", partner });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to reject partner" });
    }
});
// Toggle Partner Active Status
router.put("/:id/toggle-status", async (req, res) => {
    try {
        const { id } = req.params;
        const partner = await Partner_1.Partner.findByPk(id);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        partner.status = partner.status === 'active' ? 'inactive' : 'active';
        await partner.save();
        res.json({ message: "Partner status updated", partner });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to update status" });
    }
});
// Get Partner Documents
router.get("/:id/documents", async (req, res) => {
    try {
        const { id } = req.params;
        const docs = await PartnerDocument_1.PartnerDocument.findAll({
            where: { partnerId: id },
            order: [['createdAt', 'DESC']]
        });
        // Filter to keep only the latest document per type
        const latestDocs = [];
        const seenTypes = new Set();
        for (const doc of docs) {
            // Normalize type key to handle variations (e.g. "vehicle_rc" vs "Vehicle Rc")
            const normalizedType = doc.documentType.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!seenTypes.has(normalizedType)) {
                latestDocs.push(doc);
                seenTypes.add(normalizedType);
            }
        }
        res.json(latestDocs);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to fetch documents" });
    }
});
// Reject Specific Document
router.put("/document/:docId/reject", async (req, res) => {
    try {
        const { docId } = req.params;
        const { reason } = req.body;
        const doc = await PartnerDocument_1.PartnerDocument.findByPk(docId);
        if (!doc)
            return res.status(404).json({ message: "Document not found" });
        doc.status = 'rejected';
        doc.rejectionReason = reason || 'Invalid document';
        await doc.save();
        res.json({ success: true, message: "Document rejected", doc });
    }
    catch (err) {
        console.error("Doc rejection error:", err);
        res.status(500).json({ message: "Failed to reject document" });
    }
});
exports.default = router;
//# sourceMappingURL=partner-admin.js.map