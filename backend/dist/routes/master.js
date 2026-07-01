"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const VehicleType_1 = require("../models/VehicleType");
const ServiceRate_1 = require("../models/ServiceRate");
const ParcelCategory_1 = require("../models/ParcelCategory");
const CancelReason_1 = require("../models/CancelReason");
const router = (0, express_1.Router)();
// Vehicle Types
router.get("/vehicle-types", async (req, res) => {
    const data = await VehicleType_1.VehicleType.findAll({ where: { active: true } });
    res.json(data);
});
// Create Vehicle Type
router.post("/vehicle-types", async (req, res) => {
    try {
        const { name, icon, baseFare, perKmRate, description, active } = req.body;
        const newItem = await VehicleType_1.VehicleType.create({
            name, icon, baseFare, perKmRate, description, active
        });
        res.status(201).json(newItem);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create vehicle type" });
    }
});
router.put("/vehicle-types/:id", async (req, res) => {
    try {
        const item = await VehicleType_1.VehicleType.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ error: "Vehicle Type not found" });
        await item.update(req.body);
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update vehicle type" });
    }
});
router.delete("/vehicle-types/:id", async (req, res) => {
    try {
        await VehicleType_1.VehicleType.destroy({ where: { id: req.params.id } });
        res.json({ message: "Vehicle Type deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete vehicle type" });
    }
});
// Service Rates
router.get("/service-rates", async (req, res) => {
    try {
        const { areaId } = req.query;
        const whereClause = {};
        // If areaId is specifically requested, we might want to filter, 
        // but generally we want all rates to sort them out on frontend or logic here.
        // For simplicity, let's return all and let frontend/logic handle overrides display.
        // Or if areaId is passed, maybe return global + that area's rates?
        // Let's return ALL for now to enable the matrix view on frontend.
        const data = await ServiceRate_1.ServiceRate.findAll();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch service rates" });
    }
});
router.post("/service-rates", async (req, res) => {
    try {
        const { serviceType, vehicleTypeId, areaId } = req.body;
        // Check for existing rate to avoid duplicates
        const existingRate = await ServiceRate_1.ServiceRate.findOne({
            where: {
                serviceType,
                vehicleTypeId,
                areaId: areaId || null
            }
        });
        if (existingRate) {
            await existingRate.update(req.body);
            return res.status(200).json(existingRate);
        }
        const newItem = await ServiceRate_1.ServiceRate.create(req.body);
        res.status(201).json(newItem);
    }
    catch (err) {
        console.error("Error creating/updating service rate:", err);
        res.status(500).json({ error: "Failed to create/update service rate" });
    }
});
router.put("/service-rates/:id", async (req, res) => {
    try {
        const rate = await ServiceRate_1.ServiceRate.findByPk(req.params.id);
        if (!rate)
            return res.status(404).json({ error: "Rate not found" });
        await rate.update(req.body);
        res.json(rate);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update service rate" });
    }
});
router.delete("/service-rates/:id", async (req, res) => {
    try {
        await ServiceRate_1.ServiceRate.destroy({ where: { id: req.params.id } });
        res.json({ message: "Service Rate deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete service rate" });
    }
});
// Parcel Categories
router.get("/parcel-categories", async (req, res) => {
    const data = await ParcelCategory_1.ParcelCategory.findAll();
    res.json(data);
});
router.post("/parcel-categories", async (req, res) => {
    try {
        const { name, icon, weightLimit, description } = req.body;
        const newItem = await ParcelCategory_1.ParcelCategory.create({
            name, icon, weightLimit, description
        });
        res.status(201).json(newItem);
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to create parcel category" });
    }
});
router.put("/parcel-categories/:id", async (req, res) => {
    try {
        const item = await ParcelCategory_1.ParcelCategory.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ error: "Category not found" });
        await item.update(req.body);
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update parcel category" });
    }
});
router.delete("/parcel-categories/:id", async (req, res) => {
    try {
        await ParcelCategory_1.ParcelCategory.destroy({ where: { id: req.params.id } });
        res.json({ message: "Category deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete parcel category" });
    }
});
// Cancel Reasons
router.get("/cancel-reasons", async (req, res) => {
    try {
        const data = await CancelReason_1.CancelReason.findAll();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch cancel reasons" });
    }
});
router.post("/cancel-reasons", async (req, res) => {
    try {
        const { reason, active } = req.body;
        const newItem = await CancelReason_1.CancelReason.create({ reason, active });
        res.status(201).json(newItem);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create cancel reason" });
    }
});
router.put("/cancel-reasons/:id", async (req, res) => {
    try {
        const item = await CancelReason_1.CancelReason.findByPk(req.params.id);
        if (!item)
            return res.status(404).json({ error: "Reason not found" });
        await item.update(req.body);
        res.json(item);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to update cancel reason" });
    }
});
router.delete("/cancel-reasons/:id", async (req, res) => {
    try {
        await CancelReason_1.CancelReason.destroy({ where: { id: req.params.id } });
        res.json({ message: "Reason deleted" });
    }
    catch (err) {
        res.status(500).json({ error: "Failed to delete cancel reason" });
    }
});
exports.default = router;
//# sourceMappingURL=master.js.map