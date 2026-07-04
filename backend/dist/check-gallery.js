"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const database_1 = __importDefault(require("./config/database"));
const GalleryItem_1 = require("./models/GalleryItem");
async function main() {
    try {
        await database_1.default.authenticate();
        console.log("Database authenticated successfully!");
        // Find all gallery items
        const items = await GalleryItem_1.GalleryItem.findAll();
        console.log("Total Gallery Items in database:", items.length);
        items.forEach(item => {
            console.log(`- ID: ${item.id}, Title: ${item.title}, Project Association: ${item.projectAssociation}`);
        });
    }
    catch (error) {
        console.error("Error connecting to database:", error);
    }
    finally {
        await database_1.default.close();
    }
}
main();
//# sourceMappingURL=check-gallery.js.map