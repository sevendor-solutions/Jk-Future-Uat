import { Sequelize } from "sequelize-typescript";
import * as dotenv from "dotenv";

// Import the new real-estate models
import { City } from "../models/City";
import { LocationMaster } from "../models/LocationMaster";
import { Project } from "../models/Project";
import { Blog } from "../models/Blog";
import { GalleryItem } from "../models/GalleryItem";
import { Enquiry } from "../models/Enquiry";
import { User } from "../models/User";
import { JobApplication } from "../models/JobApplication";
import { UserSessionLog } from "../models/UserSessionLog";
import { PropertyType } from "../models/PropertyType";
import { Facing } from "../models/Facing";
import { Amenity } from "../models/Amenity";

dotenv.config();

const dbType = (process.env.DB_TYPE || "postgres").toLowerCase();

let sequelize: Sequelize;

const models = [
    City,
    LocationMaster,
    Project,
    Blog,
    GalleryItem,
    Enquiry,
    User,
    JobApplication,
    UserSessionLog,
    PropertyType,
    Facing,
    Amenity
];

console.log(`🔌 Initializing Database Connection for: ${dbType.toUpperCase()}`);

switch (dbType) {
    case "mysql":
    case "mariadb":
        sequelize = new Sequelize({
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
        sequelize = new Sequelize({
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
        sequelize = new Sequelize({
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
            sequelize = new Sequelize(process.env.DATABASE_URL, {
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
        } else {
            sequelize = new Sequelize({
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

export default sequelize;
