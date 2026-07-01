"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const database_1 = __importDefault(require("../config/database"));
const Partner_1 = require("../models/Partner");
const runSync = async () => {
    try {
        await database_1.default.authenticate();
        console.log("Database connected.");
        await Partner_1.Partner.sync({ alter: true });
        console.log("Partner table synced successfully (alter: true).");
        process.exit(0);
    }
    catch (error) {
        console.error("Sync failed:", error);
        process.exit(1);
    }
};
runSync();
//# sourceMappingURL=sync_partner.js.map