"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const database_1 = __importDefault(require("../config/database")); // Ensure this initializes the models
const User_1 = require("../models/User");
const VehicleType_1 = require("../models/VehicleType");
const ServiceRate_1 = require("../models/ServiceRate");
const ParcelCategory_1 = require("../models/ParcelCategory");
const Order_1 = require("../models/Order");
const Product_1 = require("../models/Product");
const Category_1 = require("../models/Category");
const LoginHistory_1 = require("../models/LoginHistory");
const backupDir = path_1.default.join(__dirname, "../../backups");
if (!fs_1.default.existsSync(backupDir)) {
    fs_1.default.mkdirSync(backupDir, { recursive: true });
}
const backupDatabase = async () => {
    try {
        await database_1.default.authenticate();
        console.log("Database connected. Starting backup...");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const backupFile = path_1.default.join(backupDir, `backup-${timestamp}.json`);
        const data = {
            users: await User_1.User.findAll(),
            vehicleTypes: await VehicleType_1.VehicleType.findAll(),
            serviceRates: await ServiceRate_1.ServiceRate.findAll(),
            parcelCategories: await ParcelCategory_1.ParcelCategory.findAll(),
            orders: await Order_1.Order.findAll(),
            products: await Product_1.Product.findAll(),
            categories: await Category_1.Category.findAll(),
            loginHistory: await LoginHistory_1.LoginHistory.findAll(),
        };
        fs_1.default.writeFileSync(backupFile, JSON.stringify(data, null, 2));
        console.log(`Backup successful! Saved to: ${backupFile}`);
        // Optional: Implement logic to keep only last N backups
    }
    catch (error) {
        console.error("Backup failed:", error);
    }
    finally {
        await database_1.default.close();
    }
};
backupDatabase();
//# sourceMappingURL=backup.js.map