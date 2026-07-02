"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const City_1 = require("../models/City");
const LocationMaster_1 = require("../models/LocationMaster");
const PropertyType_1 = require("../models/PropertyType");
const Facing_1 = require("../models/Facing");
const Amenity_1 = require("../models/Amenity");
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
// --- Property Types ---
// GET all property types
router.get("/property-types", async (req, res, next) => {
    try {
        const types = await PropertyType_1.PropertyType.findAll({
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: types });
    }
    catch (error) {
        next(error);
    }
});
// POST create property type
router.post("/property-types", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const type = await PropertyType_1.PropertyType.create(req.body);
        return res.status(201).json({ success: true, data: type });
    }
    catch (error) {
        next(error);
    }
});
// DELETE property type
router.delete("/property-types/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const type = await PropertyType_1.PropertyType.findByPk(req.params.id);
        if (!type) {
            return res.status(404).json({ success: false, message: "Property Type not found" });
        }
        await type.destroy();
        return res.json({ success: true, message: "Property Type deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// --- Facings ---
// GET all facings
router.get("/facings", async (req, res, next) => {
    try {
        const facings = await Facing_1.Facing.findAll({
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: facings });
    }
    catch (error) {
        next(error);
    }
});
// POST create facing
router.post("/facings", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const facing = await Facing_1.Facing.create(req.body);
        return res.status(201).json({ success: true, data: facing });
    }
    catch (error) {
        next(error);
    }
});
// DELETE facing
router.delete("/facings/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const facing = await Facing_1.Facing.findByPk(req.params.id);
        if (!facing) {
            return res.status(404).json({ success: false, message: "Facing not found" });
        }
        await facing.destroy();
        return res.json({ success: true, message: "Facing deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
// --- Amenities ---
// GET all amenities
router.get("/amenities", async (req, res, next) => {
    try {
        const amenities = await Amenity_1.Amenity.findAll({
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: amenities });
    }
    catch (error) {
        next(error);
    }
});
// POST create amenity
router.post("/amenities", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const amenity = await Amenity_1.Amenity.create(req.body);
        return res.status(201).json({ success: true, data: amenity });
    }
    catch (error) {
        next(error);
    }
});
// DELETE amenity
router.delete("/amenities/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const amenity = await Amenity_1.Amenity.findByPk(req.params.id);
        if (!amenity) {
            return res.status(404).json({ success: false, message: "Amenity not found" });
        }
        await amenity.destroy();
        return res.json({ success: true, message: "Amenity deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=masters.js.map