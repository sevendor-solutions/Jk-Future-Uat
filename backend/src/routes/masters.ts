import { Router } from "express";
import { City } from "../models/City";
import { LocationMaster } from "../models/LocationMaster";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// --- Cities ---

// GET all cities
router.get("/cities", async (req, res, next) => {
    try {
        const cities = await City.findAll({
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: cities });
    } catch (error) {
        next(error);
    }
});

// POST create city
router.post("/cities", authenticateToken, async (req, res, next) => {
    try {
        const city = await City.create(req.body);
        return res.status(201).json({ success: true, data: city });
    } catch (error) {
        next(error);
    }
});

// DELETE city
router.delete("/cities/:id", authenticateToken, async (req, res, next) => {
    try {
        const city = await City.findByPk(req.params.id);
        if (!city) {
            return res.status(404).json({ success: false, message: "City not found" });
        }
        await city.destroy();
        return res.json({ success: true, message: "City deleted successfully" });
    } catch (error) {
        next(error);
    }
});


// --- Locations ---

// GET all locations (supports optional cityId filter)
router.get("/locations", async (req, res, next) => {
    try {
        const { cityId } = req.query;
        const whereClause: any = {};
        if (cityId) {
            whereClause.cityId = cityId;
        }

        const locations = await LocationMaster.findAll({
            where: whereClause,
            include: [{ model: City, required: false }],
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: locations });
    } catch (error) {
        next(error);
    }
});

// POST create location
router.post("/locations", authenticateToken, async (req, res, next) => {
    try {
        const location = await LocationMaster.create(req.body);
        return res.status(201).json({ success: true, data: location });
    } catch (error) {
        next(error);
    }
});

// DELETE location
router.delete("/locations/:id", authenticateToken, async (req, res, next) => {
    try {
        const location = await LocationMaster.findByPk(req.params.id);
        if (!location) {
            return res.status(404).json({ success: false, message: "Location not found" });
        }
        await location.destroy();
        return res.json({ success: true, message: "Location deleted successfully" });
    } catch (error) {
        next(error);
    }
});

export default router;
