"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Parcel_1 = require("../models/Parcel");
const Customer_1 = require("../models/Customer");
const ParcelCategory_1 = require("../models/ParcelCategory");
const router = (0, express_1.Router)();
console.log("📍 Parcels Routes Initialized");
// GET /api/parcels/categories - List all parcel categories
router.get("/categories", async (req, res) => {
    try {
        const categories = await ParcelCategory_1.ParcelCategory.findAll();
        res.json(categories);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch parcel categories" });
    }
});
router.get("/", async (req, res) => {
    try {
        const parcels = await Parcel_1.Parcel.findAll({
            include: [
                { model: Customer_1.Customer, as: 'sender', attributes: ['id', 'fullName', 'phone'] },
                { model: ParcelCategory_1.ParcelCategory, as: 'category' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(parcels);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch parcels" });
    }
});
// GET /api/parcels/customer/:senderIdentifier - List parcels for a specific customer (by ID or Phone)
router.get("/customer/:senderIdentifier", async (req, res) => {
    console.log(`[Parcels] Fetching for customer: ${req.params.senderIdentifier}`);
    try {
        let senderId = req.params.senderIdentifier;
        // Check if senderIdentifier is a phone number (large number or specific format)
        // Simple heuristic: if it's longer than 8 digits, assume it's a phone, or try to find customer by phone
        if (senderId.length > 6) {
            const customer = await Customer_1.Customer.findOne({ where: { phone: senderId } });
            if (customer) {
                senderId = customer.id.toString();
            }
            // If not found by phone, let it fail or try as ID (will likely fail if it's a big int)
        }
        const parcels = await Parcel_1.Parcel.findAll({
            where: { senderId: senderId },
            include: [
                { model: ParcelCategory_1.ParcelCategory, as: 'category' }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(parcels);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch customer parcels" });
    }
});
// POST /api/parcels - Create a new parcel booking
router.post("/", async (req, res) => {
    try {
        const { senderId, receiverName, receiverPhone, receiverAddress, parcelCategoryId, weight, pickupLocation, dropoffLocation, pickupLat, pickupLng, dropoffLat, dropoffLng, fare, notes } = req.body;
        // Generate a 4-digit OTP
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        const parcel = await Parcel_1.Parcel.create({
            senderId,
            receiverName,
            receiverPhone,
            receiverAddress,
            parcelCategoryId,
            weight,
            pickupLocation,
            dropoffLocation,
            pickupLat,
            pickupLng,
            dropoffLat,
            dropoffLng,
            fare,
            otp,
            notes,
            status: 'pending'
        });
        res.status(201).json(parcel);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create parcel booking" });
    }
});
// GET /api/parcels/:id - Get parcel details
router.get("/:id", async (req, res) => {
    try {
        const parcel = await Parcel_1.Parcel.findByPk(req.params.id, {
            include: [
                { model: Customer_1.Customer, as: 'sender' },
                { model: ParcelCategory_1.ParcelCategory, as: 'category' }
            ]
        });
        if (!parcel)
            return res.status(404).json({ error: "Parcel not found" });
        res.json(parcel);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch parcel details" });
    }
});
// PUT /api/parcels/:id/status - Update parcel status
router.put("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const parcel = await Parcel_1.Parcel.findByPk(req.params.id);
        if (!parcel)
            return res.status(404).json({ error: "Parcel not found" });
        await parcel.update({ status });
        res.json(parcel);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update parcel status" });
    }
});
exports.default = router;
//# sourceMappingURL=parcels.js.map