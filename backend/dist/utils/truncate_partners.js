"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const truncatePartners = async () => {
    try {
        await database_1.default.query('TRUNCATE TABLE "partners", "partner_documents" CASCADE;');
        console.log("✅ Partner tables truncated.");
    }
    catch (err) {
        console.error("❌ Failed to truncate:", err);
    }
    finally {
        await database_1.default.close();
    }
};
truncatePartners();
//# sourceMappingURL=truncate_partners.js.map