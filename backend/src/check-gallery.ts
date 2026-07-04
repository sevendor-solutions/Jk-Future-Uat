import "reflect-metadata";
import sequelize from "./config/database";
import { GalleryItem } from "./models/GalleryItem";

async function main() {
  try {
    await sequelize.authenticate();
    console.log("Database authenticated successfully!");
    
    // Find all gallery items
    const items = await GalleryItem.findAll();
    console.log("Total Gallery Items in database:", items.length);
    items.forEach(item => {
      console.log(`- ID: ${item.id}, Title: ${item.title}, Project Association: ${item.projectAssociation}`);
    });
  } catch (error) {
    console.error("Error connecting to database:", error);
  } finally {
    await sequelize.close();
  }
}

main();
