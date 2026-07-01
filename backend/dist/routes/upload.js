"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = (0, express_1.Router)();
// Map module codes to subfolders
const getSubFolder = (moduleCode) => {
    switch (moduleCode) {
        case "MP":
            return "properties";
        case "MMS":
            return "marketing";
        case "MVA":
            return "marketing_visual_assets";
        case "PVA":
            return "project_visual_assets";
        case "MBN":
            return "blogs";
        default:
            return "others";
    }
};
// Configure disk storage for Multer
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const moduleCode = req.query.module || "others";
        const subFolder = getSubFolder(moduleCode);
        const uploadPath = path_1.default.join(__dirname, "../../uploads", subFolder);
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const moduleCode = req.query.module || "others";
        const originalName = file.originalname;
        const ext = path_1.default.extname(originalName);
        const nameWithoutExt = path_1.default.basename(originalName, ext);
        // Clean special characters from the original name
        const cleanName = nameWithoutExt.replace(/[^a-zA-Z0-9_-]/g, "_");
        const timestamp = Date.now();
        const filename = `${cleanName}-${moduleCode}-${timestamp}${ext}`;
        cb(null, filename);
    }
});
const getBaseUrl = (req) => {
    if (process.env.BACKEND_URL) {
        return process.env.BACKEND_URL.replace(/\/$/, ""); // Remove trailing slash if present
    }
    if (process.env.BASE_URL) {
        return process.env.BASE_URL.replace(/\/$/, ""); // Remove trailing slash if present
    }
    // Fallback to request host info
    const protocol = req.headers["x-forwarded-proto"] || req.protocol;
    const host = req.get("host");
    return `${protocol}://${host}`;
};
const upload = (0, multer_1.default)({ storage });
// POST /api/upload - Single file upload
router.post("/", upload.single("image"), (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "No file uploaded" });
        }
        const moduleCode = req.query.module || "others";
        const subFolder = getSubFolder(moduleCode);
        const baseUrl = getBaseUrl(req);
        const fileUrl = `${baseUrl}/uploads/${subFolder}/${req.file.filename}`;
        return res.json({ success: true, url: fileUrl });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/upload/multiple - Multiple files upload
router.post("/multiple", upload.array("images", 10), (req, res, next) => {
    try {
        const files = req.files;
        if (!files || files.length === 0) {
            return res.status(400).json({ success: false, message: "No files uploaded" });
        }
        const moduleCode = req.query.module || "others";
        const subFolder = getSubFolder(moduleCode);
        const baseUrl = getBaseUrl(req);
        const urls = files.map((file) => `${baseUrl}/uploads/${subFolder}/${file.filename}`);
        return res.json({ success: true, urls });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map