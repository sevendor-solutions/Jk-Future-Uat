"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedDatabase = void 0;
const Role_1 = require("../models/Role");
const User_1 = require("../models/User");
const Permission_1 = require("../models/Permission");
const Menu_1 = require("../models/Menu");
const UserGroup_1 = require("../models/UserGroup");
const Category_1 = require("../models/Category");
const VehicleType_1 = require("../models/VehicleType");
const ParcelCategory_1 = require("../models/ParcelCategory");
const SystemSetting_1 = require("../models/SystemSetting");
const CancelReason_1 = require("../models/CancelReason");
const ShopCategory_1 = require("../models/ShopCategory");
const bcrypt_1 = __importDefault(require("bcrypt"));
const seedDatabase = async () => {
    try {
        console.log("🌱 Starting Database Seeding...");
        // 1. Create Roles
        const [superAdminRole] = await Role_1.Role.findOrCreate({ where: { name: "Super Admin" }, defaults: { description: "Full access to everything" } });
        const [adminRole] = await Role_1.Role.findOrCreate({ where: { name: "Admin" }, defaults: { description: "Administrative access" } });
        const [areaHeadRole] = await Role_1.Role.findOrCreate({ where: { name: "Area Head" }, defaults: { description: "Access to area wise rates change" } });
        const [shopOwnerRole] = await Role_1.Role.findOrCreate({ where: { name: "Shop Owner" }, defaults: { description: "Access to shop management" } });
        // Remove deprecated roles if they exist
        await Role_1.Role.destroy({ where: { name: ["Delivery Partner", "Customer"] } });
        // 2. Create User Groups
        await UserGroup_1.UserGroup.findOrCreate({ where: { name: "Administration" } });
        await UserGroup_1.UserGroup.findOrCreate({ where: { name: "Logistics" } });
        // 2b. Create Default Categories (Unified for Shops and Products)
        const defaultCats = [
            "Grocery", "Fruits & Vegetables", "Restaurant", "Pharmacy",
            "Pet Supplies", "Electronics", "Stationery", "Other"
        ];
        for (const catName of defaultCats) {
            await Category_1.Category.findOrCreate({
                where: { name: catName },
                defaults: { name: catName, description: `Default ${catName} category` }
            });
            // Also seed ShopCategory as the user requested "Master" in web
            await ShopCategory_1.ShopCategory.findOrCreate({
                where: { name: catName },
                defaults: { name: catName, description: `Global Shop Category for ${catName}` }
            });
        }
        // 3. Create Default Menus (Dynamic Screens)
        const menus = [
            { title: "Dashboard", path: "/", icon: "LayoutDashboard", order: 1, permissionCode: "view_dashboard" },
            { title: "Orders", path: "/orders", icon: "ShoppingBag", order: 2, permissionCode: "view_orders" },
            { title: "Products", path: "/products", icon: "Package", order: 3, permissionCode: "manage_products" },
            { title: "Shop Inventory", path: "/shop-inventory", icon: "Box", order: 4, permissionCode: "manage_inventory" },
            { title: "Product Categories", path: "/categories", icon: "Layers", order: 5, permissionCode: "manage_product_categories" },
            { title: "Shop Categories", path: "/admin/shop-categories", icon: "LayoutGrid", order: 6, permissionCode: "manage_shop_categories" },
            // Services & Rates
            { title: "Vehicle Types", path: "/vehicles", icon: "Bike", order: 7, permissionCode: "manage_vehicles" },
            { title: "Service Rates", path: "/rate-management", icon: "Tag", order: 8, permissionCode: "manage_rates" },
            // Logistics & Parcels
            { title: "Parcel Deliveries", path: "/parcels", icon: "Package", order: 10, permissionCode: "view_parcels" },
            { title: "Send a Parcel", path: "/send-parcel", icon: "PlusCircle", order: 11, permissionCode: "manage_parcels" },
            // Marketing & Finance
            { title: "Marketing", path: "/marketing", icon: "Megaphone", order: 9, permissionCode: "manage_marketing" },
            { title: "Commission", path: "/commission", icon: "DollarSign", order: 9, permissionCode: "manage_commission" },
            // People
            { title: "Users", path: "/users", icon: "Users", order: 11, permissionCode: "manage_users" },
            { title: "Roles", path: "/roles", icon: "Shield", order: 12, permissionCode: "manage_roles" },
            { title: "Customers", path: "/customers", icon: "Users", order: 13, permissionCode: "view_customers" },
            { title: "Delivery Partners", path: "/partners", icon: "Truck", order: 14, permissionCode: "view_partners" },
            { title: "Shop Partners", path: "/admin/shops", icon: "Store", order: 15, permissionCode: "view_shops" },
            // Geo-Fencing
            { title: "Areas & Zones", path: "/areas", icon: "Map", order: 16, permissionCode: "manage_areas" },
            // Masters
            { title: "Cancel Reasons", path: "/cancel-reasons", icon: "ShieldAlert", order: 17, permissionCode: "manage_reasons" },
            // Shop Owner specific
            { title: "My Shop", path: "/my-shop", icon: "Store", order: 20, permissionCode: "manage_my_shop" },
            // System
            { title: "Reports", path: "/reports", icon: "BarChart3", order: 18, permissionCode: "view_reports" },
            { title: "Settings", path: "/settings", icon: "Settings", order: 19, permissionCode: "manage_settings" },
        ];
        // Cleanup: Remove old/duplicate menus
        await Menu_1.Menu.destroy({ where: { path: ['/rates', '/register-shop'] } });
        await Menu_1.Menu.destroy({ where: { title: 'Area Pricing' } });
        for (const m of menus) {
            // Upsert (Create or Update) to ensure permissionCode is set even if menu exists
            const menu = await Menu_1.Menu.findOne({ where: { path: m.path } });
            if (menu) {
                await menu.update(m);
            }
            else {
                await Menu_1.Menu.create(m);
            }
        }
        // 4. Create Permissions (based on menus for now)
        for (const m of menus) {
            const [perm] = await Permission_1.Permission.findOrCreate({
                where: { code: m.permissionCode },
                defaults: { name: m.title, description: `Access to ${m.title}` }
            });
            // Assign everything to Super Admin and Admin
            await superAdminRole.$add("permission", perm);
            await adminRole.$add("permission", perm);
            // Assign permissions to Area Head
            // They need: Dashboard, Shops, Products, Categories, Orders, Areas details, Reports?
            const areaHeadPerms = [
                "view_dashboard",
                "view_shops",
                "manage_products",
                "manage_product_categories",
                "manage_shop_categories",
                "view_orders",
                "manage_areas", // Maybe read-only? But code is one.
                "manage_rates",
                "manage_inventory",
                "view_parcels",
                "manage_parcels",
                "manage_reasons"
            ];
            if (areaHeadPerms.includes(m.permissionCode)) {
                const [areaHeadRole] = await Role_1.Role.findOrCreate({ where: { name: "Area Head" } });
                await areaHeadRole.$add("permission", perm);
            }
            // Assign permissions to Shop Owner
            const shopOwnerPerms = [
                "manage_my_shop",
                "view_dashboard",
                "view_orders",
                "manage_inventory"
            ];
            if (shopOwnerPerms.includes(m.permissionCode)) {
                const [shopOwnerRole] = await Role_1.Role.findOrCreate({ where: { name: "Shop Owner" } });
                await shopOwnerRole.$add("permission", perm);
            }
        }
        // 5. Create Default User (admin / admin)
        const hashedPassword = await bcrypt_1.default.hash("admin", 10);
        const [adminUser, created] = await User_1.User.findOrCreate({
            where: { username: "admin" },
            defaults: {
                password: hashedPassword,
                status: User_1.UserStatus.ACTIVE,
                fullName: "Super Administrator",
                roleId: superAdminRole.id
            }
        });
        // Ensure admin always has the correct Role ID even if existed before
        if (!created && adminUser.roleId !== superAdminRole.id) {
            adminUser.roleId = superAdminRole.id;
            await adminUser.save();
            console.log("Updated Admin user role.");
        }
        // 6. Create Template Products
        const { Product } = await Promise.resolve().then(() => __importStar(require("../models/Product")));
        const groceryCat = await Category_1.Category.findOne({ where: { name: "Grocery" } });
        const restaurantCat = await Category_1.Category.findOne({ where: { name: "Restaurant" } });
        if (groceryCat) {
            await Product.findOrCreate({
                where: { name: "Milk", shopId: null },
                defaults: { name: "Milk", price: 60, categoryId: groceryCat.id, image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200" }
            });
            await Product.findOrCreate({
                where: { name: "Bread", shopId: null },
                defaults: { name: "Bread", price: 40, categoryId: groceryCat.id, image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=200" }
            });
        }
        if (restaurantCat) {
            await Product.findOrCreate({
                where: { name: "Biryani", shopId: null },
                defaults: { name: "Biryani", price: 250, categoryId: restaurantCat.id, image: "https://images.unsplash.com/photo-1589302168068-964692490451?w=200" }
            });
        }
        // 7. Create Default Vehicle Types for Rides
        const vehicleTypes = [
            { name: 'Bike', icon: 'bike', baseFare: 20, perKmRate: 6, description: 'Quick and affordable bike rides', active: true },
            { name: 'Auto', icon: 'auto', baseFare: 30, perKmRate: 9, description: 'Comfortable auto rickshaw rides', active: true },
            { name: 'Car', icon: 'car', baseFare: 50, perKmRate: 12, description: 'Comfortable sedan car rides', active: true },
            { name: 'Car UL', icon: 'car_ul', baseFare: 80, perKmRate: 15, description: 'Premium car rides', active: true },
        ];
        for (const vt of vehicleTypes) {
            await VehicleType_1.VehicleType.findOrCreate({
                where: { name: vt.name },
                defaults: vt
            });
        }
        // 8. System Settings
        await SystemSetting_1.SystemSetting.findOrCreate({
            where: { key: "GOOGLE_MAPS_API_KEY" },
            defaults: {
                key: "GOOGLE_MAPS_API_KEY",
                value: "YOUR_GOOGLE_MAPS_API_KEY",
                group: "google_maps",
                description: "API Key for Google Maps integration across all platforms"
            }
        });
        // 8b. Parcel Categories
        const parcelCategories = [
            { name: 'Small', description: 'Fits in a handbag (e.g. keys, phone, documents)', icon: 'box', weightLimit: 2 },
            { name: 'Medium', description: 'Fits in a backpack (e.g. laptop, small parcel)', icon: 'box', weightLimit: 5 },
            { name: 'Large', description: 'Fits in a carry bag (e.g. shoes, multiple items)', icon: 'box', weightLimit: 10 },
            { name: 'Extra Large', description: 'Fits on a bike back seat (e.g. big box, groceries)', icon: 'box', weightLimit: 20 },
        ];
        for (const cat of parcelCategories) {
            await ParcelCategory_1.ParcelCategory.findOrCreate({
                where: { name: cat.name },
                defaults: cat
            });
        }
        // 9. Cancel Reasons
        const cancelReasons = [
            "Driver too far",
            "Price too high",
            "Found alternative",
            "Changed my mind",
            "Wait time too long",
            "Incorrect pickup/dropoff"
        ];
        for (const reason of cancelReasons) {
            await CancelReason_1.CancelReason.findOrCreate({
                where: { reason },
                defaults: { reason, active: true }
            });
        }
        console.log("✅ Database Seeded Successfully");
    }
    catch (error) {
        console.error("❌ Seeding failed:", error);
        // Do not exit process, just log error so server can continue or we can debug
    }
};
exports.seedDatabase = seedDatabase;
//# sourceMappingURL=init_db.js.map