import "reflect-metadata";
import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import path from "path";
import sequelize from "./config/database";

// Import new route files
import authRoutes from "./routes/auth";
import projectsRoutes from "./routes/projects";
import blogsRoutes from "./routes/blogs";
import galleryRoutes from "./routes/gallery";
import enquiriesRoutes from "./routes/enquiries";
import mastersRoutes from "./routes/masters";
import careersRoutes from "./routes/careers";
import usersRoutes from "./routes/users";
import uploadRoutes from "./routes/upload";
import documentsRoutes from "./routes/documents";
import siteVisitsRoutes from "./routes/siteVisits";
import mailConfigRoutes from "./routes/mailConfig";

// Import seeder
import { seedDatabase } from "./utils/seeder";

dotenv.config();

const app = express();
app.set("trust proxy", true);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

console.log("🛠️ Loading JK Future Infra Routes...");

// Wire up routes
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/gallery", galleryRoutes);
app.use("/api/enquiries", enquiriesRoutes);
app.use("/api/masters", mastersRoutes);
app.use("/api/careers", careersRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/documents", documentsRoutes);
app.use("/api/site-visits", siteVisitsRoutes);
app.use("/api/mail-config", mailConfigRoutes);

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
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
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

// Initialize Database & Start Express Server
sequelize.sync({ alter: true }) // Synchronize database schemas
  .then(async () => {
    console.log("🔥 Sequelize Database Connected & Synced!");

    // Run the data seeder
    await seedDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Error during Database synchronization or startup:", err);
  });
