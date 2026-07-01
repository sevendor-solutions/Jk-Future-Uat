"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const init_db_1 = require("../utils/init_db");
const runSeed = async () => {
    try {
        await database_1.default.sync({ alter: true });
        await (0, init_db_1.seedDatabase)();
        process.exit(0);
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
};
runSeed();
//# sourceMappingURL=seed_rbac.js.map