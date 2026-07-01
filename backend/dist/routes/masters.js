"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const City_1 = require("../models/City");
const LocationMaster_1 = require("../models/LocationMaster");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// --- Cities ---
// GET all cities
router.get("/cities", async (req, res, next) => {
    try {
        const cities = await City_1.City.findAll({
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: cities });
    }
    catch (error) {
        next(error);
    }
});
// POST create city
router.post("/cities", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const city = await City_1.City.create(req.body);
        return res.status(201).json({ success: true, data: city });
    }
    catch (error) {
        next(error);
    }
});
// DELETE city
router.delete("/cities/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const city = await City_1.City.findByPk(req.params.id);
        if (!city) {
            return res.status(404).json({ success: false, message: "City not found" });
        }
        await city.destroy();
        return res.json({ success: true, message: "City deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// --- Locations ---
// GET all locations (supports optional cityId filter)
router.get("/locations", async (req, res, next) => {
    try {
        const { cityId } = req.query;
        const whereClause = {};
        if (cityId) {
            whereClause.cityId = cityId;
        }
        const locations = await LocationMaster_1.LocationMaster.findAll({
            where: whereClause,
            include: [{ model: City_1.City, required: false }],
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: locations });
    }
    catch (error) {
        next(error);
    }
});
// POST create location
router.post("/locations", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const location = await LocationMaster_1.LocationMaster.create(req.body);
        return res.status(201).json({ success: true, data: location });
    }
    catch (error) {
        next(error);
    }
});
// DELETE location
router.delete("/locations/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const location = await LocationMaster_1.LocationMaster.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ success: false, message: "Location not found" });
        }
        await location.destroy();
        return res.json({ success: true, message: "Location deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=masters.js.map