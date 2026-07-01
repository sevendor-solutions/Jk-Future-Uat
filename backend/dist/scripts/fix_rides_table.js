"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
async function fixRidesTable() {
    try {
        console.log('🔧 Dropping rides table to fix schema mismatch...');
        // Drop the rides table and related tables that depend on it
        await database_1.default.query('DROP TABLE IF EXISTS ride_tracking CASCADE;');
        await database_1.default.query('DROP TABLE IF EXISTS scheduled_rides CASCADE;');
        await database_1.default.query('DROP TABLE IF EXISTS rides CASCADE;');
        console.log('✅ Tables dropped successfully');
        console.log('🔄 Now restart your server to recreate tables with correct schema');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error fixing rides table:', error);
        process.exit(1);
    }
}
fixRidesTable();
//# sourceMappingURL=fix_rides_table.js.map