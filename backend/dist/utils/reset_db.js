"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = __importDefault(require("../config/database"));
const seeder_1 = require("./seeder");
async function reset() {
    try {
        console.log("⚠️ Forcing Database Reset (dropping all old tables)...");
        await database_1.default.sync({ force: true });
        console.log("🔥 Database schema recreated!");
        // Seed new data
        await (0, seeder_1.seedDatabase)();
        console.log("🚀 Database reset and seed completed successfully!");
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Error during database reset:", error);
        process.exit(1);
    }
}
reset();
//# sourceMappingURL=reset_db.js.map