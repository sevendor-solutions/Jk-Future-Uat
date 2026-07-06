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
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv = __importStar(require("dotenv"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const database_1 = __importDefault(require("./config/database"));
// Import new route files
const auth_1 = __importDefault(require("./routes/auth"));
const projects_1 = __importDefault(require("./routes/projects"));
const blogs_1 = __importDefault(require("./routes/blogs"));
const gallery_1 = __importDefault(require("./routes/gallery"));
const enquiries_1 = __importDefault(require("./routes/enquiries"));
const masters_1 = __importDefault(require("./routes/masters"));
const careers_1 = __importDefault(require("./routes/careers"));
const users_1 = __importDefault(require("./routes/users"));
const upload_1 = __importDefault(require("./routes/upload"));
const documents_1 = __importDefault(require("./routes/documents"));
const siteVisits_1 = __importStar(require("./routes/siteVisits"));
const mailConfig_1 = __importDefault(require("./routes/mailConfig"));
const marketingAgents_1 = __importDefault(require("./routes/marketingAgents"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const expenseCategories_1 = __importDefault(require("./routes/expenseCategories"));
const auditLogs_1 = __importDefault(require("./routes/auditLogs"));
// Import seeder
const seeder_1 = require("./utils/seeder");
dotenv.config();
const app = (0, express_1.default)();
app.set("trust proxy", true);
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "../uploads")));
console.log("🛠️ Loading JK Future Infra Routes...");
// Wire up routes
app.use("/api/auth", auth_1.default);
app.use("/api/projects", projects_1.default);
app.use("/api/blogs", blogs_1.default);
app.use("/api/gallery", gallery_1.default);
app.use("/api/enquiries", enquiries_1.default);
app.use("/api/masters", masters_1.default);
app.use("/api/careers", careers_1.default);
app.use("/api/users", users_1.default);
app.use("/api/upload", upload_1.default);
app.use("/api/documents", documents_1.default);
app.use("/api/site-visits", siteVisits_1.default);
app.use("/api/mail-config", mailConfig_1.default);
app.use("/api/marketing-agents", marketingAgents_1.default);
app.use("/api/expenses", expenses_1.default);
app.use("/api/expense-categories", expenseCategories_1.default);
app.use("/api/audit-logs", auditLogs_1.default);
// Test routes
app.get("/", (req, res) => res.send("JK Future Infra Backend (Sequelize) is running!"));
app.get("/api/db-info", (req, res) => {
    res.json({
        dbType: process.env.DB_TYPE || "postgres",
        pg_db: process.env.PG_DB,
        pg_host: process.env.PG_HOST,
        pg_port: process.env.PG_PORT,
        sqlite_storage: process.env.SQLITE_STORAGE || "./database.sqlite",
        mysql_db: process.env.MYSQL_DB,
        mysql_host: process.env.MYSQL_HOST,
        mssql_db: process.env.DB_NAME,
        mssql_host: process.env.DB_HOST
    });
});
// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error("🔥 Error caught by server middleware:", err);
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        success: false,
        message,
        errors: err.errors || null
    });
});
const PORT = process.env.PORT || 5000;
// ─── Ensure all upload subfolders exist (never deletes existing) ────────────
const UPLOAD_SUBFOLDERS = [
    "properties",
    "marketing",
    "marketing_visual_assets",
    "project_visual_assets",
    "blogs",
    "others"
];
const uploadsRoot = path_1.default.join(__dirname, "../uploads");
UPLOAD_SUBFOLDERS.forEach((folder) => {
    const folderPath = path_1.default.join(uploadsRoot, folder);
    if (!fs_1.default.existsSync(folderPath)) {
        fs_1.default.mkdirSync(folderPath, { recursive: true });
        console.log(`📁 Created upload folder: uploads/${folder}`);
    }
    else {
        console.log(`✅ Upload folder exists: uploads/${folder}`);
    }
});
// Initialize Database & Start Express Server
database_1.default.sync({ alter: true }) // Synchronize database schemas
    .then(async () => {
    console.log("🔥 Sequelize Database Connected & Synced!");
    // Run the data seeder
    await (0, seeder_1.seedDatabase)();
    app.listen(PORT, () => {
        console.log(`🚀 Server running at http://localhost:${PORT}`);
        // Start background task timer (every 1 hour) for site visit reminders
        const ONE_HOUR = 60 * 60 * 1000;
        setInterval(async () => {
            try {
                await (0, siteVisits_1.runAutomatedSiteVisitReminders)();
            }
            catch (err) {
                console.error("Failed to run automated background reminders interval:", err);
            }
        }, ONE_HOUR);
        // Also run reminders once immediately on server start to catch up
        setTimeout(async () => {
            try {
                await (0, siteVisits_1.runAutomatedSiteVisitReminders)();
            }
            catch (err) {
                console.error("Failed to run immediate automated reminders on startup:", err);
            }
        }, 5000); // Wait 5 seconds after startup to ensure everything is stable
    });
})
    .catch((err) => {
    console.error("❌ Error during Database synchronization or startup:", err);
});
//# sourceMappingURL=server.js.map