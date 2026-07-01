"use strict";
require("dotenv").config();
module.exports = {
    user: process.env.DB_USER || "sa",
    password: process.env.DB_PASSWORD || "Jayam@123",
    server: process.env.DB_SERVER || "192.168.1.11",
    port: parseInt(process.env.DB_PORT) || 9005,
    database: process.env.DB_NAME || "HRMS_DEV",
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};
//# sourceMappingURL=config.js.map