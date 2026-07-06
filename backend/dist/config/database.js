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
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_typescript_1 = require("sequelize-typescript");
const dotenv = __importStar(require("dotenv"));
// Import the new real-estate models
const City_1 = require("../models/City");
const LocationMaster_1 = require("../models/LocationMaster");
const Project_1 = require("../models/Project");
const Blog_1 = require("../models/Blog");
const GalleryItem_1 = require("../models/GalleryItem");
const Enquiry_1 = require("../models/Enquiry");
const User_1 = require("../models/User");
const JobApplication_1 = require("../models/JobApplication");
const UserSessionLog_1 = require("../models/UserSessionLog");
const PropertyType_1 = require("../models/PropertyType");
const Facing_1 = require("../models/Facing");
const Amenity_1 = require("../models/Amenity");
const Document_1 = require("../models/Document");
const SiteVisit_1 = require("../models/SiteVisit");
const MailConfig_1 = require("../models/MailConfig");
const MarketingAgent_1 = require("../models/MarketingAgent");
const Expense_1 = require("../models/Expense");
const ExpenseCategory_1 = require("../models/ExpenseCategory");
const AuditLog_1 = require("../models/AuditLog");
dotenv.config();
const dbType = (process.env.DB_TYPE || "postgres").toLowerCase();
let sequelize;
const models = [
    City_1.City,
    LocationMaster_1.LocationMaster,
    Project_1.Project,
    Blog_1.Blog,
    GalleryItem_1.GalleryItem,
    Enquiry_1.Enquiry,
    User_1.User,
    JobApplication_1.JobApplication,
    UserSessionLog_1.UserSessionLog,
    PropertyType_1.PropertyType,
    Facing_1.Facing,
    Amenity_1.Amenity,
    Document_1.Document,
    SiteVisit_1.SiteVisit,
    MailConfig_1.MailConfig,
    MarketingAgent_1.MarketingAgent,
    Expense_1.Expense,
    ExpenseCategory_1.ExpenseCategory,
    AuditLog_1.AuditLog
];
console.log(`🔌 Initializing Database Connection for: ${dbType.toUpperCase()}`);
switch (dbType) {
    case "mysql":
    case "mariadb":
        sequelize = new sequelize_typescript_1.Sequelize({
            dialect: "mysql",
            host: process.env.MYSQL_HOST || "localhost",
            port: parseInt(process.env.MYSQL_PORT || "3306"),
            username: process.env.MYSQL_USER || "root",
            password: process.env.MYSQL_PASSWORD || "",
            database: process.env.MYSQL_DB || "test",
            logging: false,
            models: models,
        });
        break;
    case "mssql":
        sequelize = new sequelize_typescript_1.Sequelize({
            dialect: "mssql",
            host: process.env.DB_HOST || "localhost",
            port: parseInt(process.env.DB_PORT || "1433"),
            username: process.env.DB_USER || "sa",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "master",
            logging: false,
            models: models,
            dialectOptions: {
                options: {
                    encrypt: false,
                    trustServerCertificate: true,
                }
            }
        });
        break;
    case "sqlite":
        sequelize = new sequelize_typescript_1.Sequelize({
            dialect: "sqlite",
            storage: process.env.SQLITE_STORAGE || "./database.sqlite",
            logging: false,
            models: models,
        });
        break;
    // case "postgres":
    // default:
    //     sequelize = new Sequelize({
    //         dialect: "postgres",
    //         host: process.env.PG_HOST || "localhost",
    //         port: parseInt(process.env.PG_PORT || "5432"),
    //         username: process.env.PG_USER || "postgres",
    //         password: process.env.PG_PASSWORD || "doorstep",
    //         database: process.env.PG_DB || "DoorstepDB",
    //         logging: false,
    //         models: models,
    //     });
    //     break;
    case "postgres":
    default:
        if (process.env.DATABASE_URL) {
            sequelize = new sequelize_typescript_1.Sequelize(process.env.DATABASE_URL, {
                dialect: "postgres",
                logging: false,
                models: models,
                dialectOptions: {
                    ssl: {
                        require: true,
                        rejectUnauthorized: false,
                    },
                },
            });
        }
        else {
            sequelize = new sequelize_typescript_1.Sequelize({
                dialect: "postgres",
                host: process.env.PG_HOST || "localhost",
                port: parseInt(process.env.PG_PORT || "5432"),
                username: process.env.PG_USER || "postgres",
                password: process.env.PG_PASSWORD || "Admin@123",
                database: process.env.PG_DB || "JKFutureDB",
                logging: false,
                models: models,
            });
        }
        break;
}
exports.default = sequelize;
//# sourceMappingURL=database.js.map