"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = __importDefault(require("../config/database"));
const Area_1 = require("../models/Area");
const saveManualArea = async () => {
    try {
        console.log("🔌 Connecting to database...");
        await database_1.default.authenticate();
        console.log("✅ Database connected successfully!");
        // Synced model check
        await Area_1.Area.sync();
        const zoneName = "Downtown Central Zone";
        // Check if area already exists
        const existing = await Area_1.Area.findOne({ where: { name: zoneName } });
        if (existing) {
            console.log(`⚠️ Area '${zoneName}' already exists in database.`);
            console.log("Details:", JSON.stringify(existing, null, 2));
            process.exit(0);
        }
        console.log(`🌱 Creating new Area: '${zoneName}'...`);
        const newArea = await Area_1.Area.create({
            name: zoneName,
            status: Area_1.AreaStatus.ACTIVE,
            pincode: "560001",
            rangeKm: 7.5,
            description: "Primary commercial zone covering downtown and central business districts.",
            serviceTypes: ["parcel", "ride", "shop"],
            coordinates: [
                { lat: 12.971598, lng: 77.594562 },
                { lat: 12.978598, lng: 77.599562 },
                { lat: 12.975598, lng: 77.605562 },
                { lat: 12.971598, lng: 77.594562 } // Closed polygon loop
            ]
        });
        console.log("🎉 Area created successfully!");
        console.log("Created Record:", JSON.stringify(newArea, null, 2));
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Failed to save manual area zone:", error);
        process.exit(1);
    }
};
saveManualArea();
//# sourceMappingURL=save_manual_area.js.map