"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Partner_1 = require("../models/Partner");
const Otp_1 = require("../models/Otp");
const Area_1 = require("../models/Area");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
// 1. Check Phone
router.post("/check-phone", async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone)
            return res.status(400).json({ message: "Phone number is required" });
        const partner = await Partner_1.Partner.findOne({ where: { phone } });
        res.json({ exists: !!partner });
    }
    catch (err) {
        res.status(500).json({ message: "Failed to check phone" });
    }
});
// 2. Send OTP (RAMDOM 4-DIGIT)
router.post("/send-otp", async (req, res) => {
    try {
        const { phone } = req.body;
        if (!phone)
            return res.status(400).json({ message: "Phone number is required" });
        // Generate Random 4-digit OTP
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins
        await Otp_1.Otp.create({ phone, code, expiresAt });
        // Return OTP in response for Demo/Testing
        res.json({ success: true, message: "OTP sent successfully", code });
    }
    catch (err) {
        console.error("Send OTP error:", err);
        res.status(500).json({ message: "Failed to send OTP", error: String(err) });
    }
});
// 3. Verify OTP & Login
router.post("/verify-otp", async (req, res) => {
    try {
        const { phone, code } = req.body;
        if (!phone || !code)
            return res.status(400).json({ message: "Phone and code are required" });
        const otp = await Otp_1.Otp.findOne({
            where: { phone, code, isUsed: false },
            order: [['createdAt', 'DESC']]
        });
        if (!otp || otp.expiresAt < new Date()) {
            return res.status(400).json({ message: "Invalid or expired OTP" });
        }
        otp.isUsed = true;
        await otp.save();
        const partner = await Partner_1.Partner.findOne({
            where: { phone },
            include: [{ model: Area_1.Area, as: 'area' }] // Include Area
        });
        if (!partner)
            return res.status(404).json({ message: "Partner account not found" });
        const token = jsonwebtoken_1.default.sign({ id: partner.id, phone: partner.phone, type: 'partner' }, JWT_SECRET, { expiresIn: "30d" });
        res.json({
            token,
            partner: {
                id: partner.id,
                phone: partner.phone,
                fullName: partner.fullName,
                approvalStatus: partner.approvalStatus,
                isOnline: partner.isOnline,
                rejectionReason: partner.rejectionReason,
                vehicleType: partner.vehicleType,
                vehicleNumber: partner.vehicleNumber,
                vehicleModel: partner.vehicleModel,
                areaId: partner.areaId,
                activeServices: partner.activeServices,
                area: partner.area,
                createdAt: partner.createdAt
            }
        });
    }
    catch (err) {
        res.status(500).json({ message: "Verification failed" });
    }
});
// 4. Register Partner
router.post("/register", async (req, res) => {
    try {
        const { phone, fullName, vehicleType, vehicleNumber, email } = req.body;
        if (!phone || !fullName)
            return res.status(400).json({ message: "Phone and Name are required" });
        const existing = await Partner_1.Partner.findOne({ where: { phone } });
        if (existing)
            return res.status(400).json({ message: "Partner already exists" });
        const partner = await Partner_1.Partner.create({
            phone,
            fullName,
            email,
            vehicleType,
            vehicleNumber,
            approvalStatus: 'pending',
            status: 'active'
        });
        const token = jsonwebtoken_1.default.sign({ id: partner.id, phone: partner.phone, type: 'partner' }, JWT_SECRET, { expiresIn: "30d" });
        res.json({
            token,
            partner: {
                id: partner.id,
                phone: partner.phone,
                fullName: partner.fullName,
                approvalStatus: partner.approvalStatus,
                vehicleType: partner.vehicleType,
                vehicleNumber: partner.vehicleNumber,
                vehicleModel: partner.vehicleModel,
                areaId: partner.areaId,
                createdAt: partner.createdAt
            }
        });
    }
    catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ message: "Registration failed", error: String(err) });
    }
});
// 5. Upload Document
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const PartnerDocument_1 = require("../models/PartnerDocument");
// Ensure uploads/documents directory exists
const uploadDir = path_1.default.join(__dirname, '../../uploads/documents');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `doc-${Date.now()}-${Math.round(Math.random() * 1E9)}${path_1.default.extname(file.originalname)}`);
    }
});
const upload = (0, multer_1.default)({ storage });
router.post("/upload-doc", upload.single('document'), async (req, res) => {
    try {
        console.log("Upload Request Body:", req.body);
        console.log("Upload File:", req.file);
        const { partnerId, documentType } = req.body;
        const file = req.file;
        if (!partnerId || !documentType || !file) {
            console.error("Missing fields:", { partnerId, documentType, file: !!file });
            return res.status(400).json({ message: "Missing required fields" });
        }
        // Fetch partner first to get phone number
        const partner = await Partner_1.Partner.findByPk(partnerId);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        // Custom Filename: phone_type_YYYYMMDDHHmmss.ext
        const date = new Date();
        const timestamp = date.getFullYear() +
            String(date.getMonth() + 1).padStart(2, '0') +
            String(date.getDate()).padStart(2, '0') +
            String(date.getHours()).padStart(2, '0') +
            String(date.getMinutes()).padStart(2, '0') +
            String(date.getSeconds()).padStart(2, '0');
        const safeType = documentType.replace(/[^a-zA-Z0-9]/g, '');
        const ext = path_1.default.extname(file.originalname);
        const newFilename = `${partner.phone}_${safeType}_${timestamp}${ext}`;
        const newPath = path_1.default.join(uploadDir, newFilename);
        // Rename the uploaded file
        try {
            fs_1.default.renameSync(file.path, newPath);
        }
        catch (renameErr) {
            console.error("Rename failed", renameErr);
            return res.status(500).json({ message: "File processing failed" });
        }
        const docUrl = `/uploads/documents/${newFilename}`;
        const doc = await PartnerDocument_1.PartnerDocument.create({
            partnerId: Number(partnerId),
            documentType,
            documentUrl: docUrl,
            status: 'pending'
        });
        // Update partner status to pending if not already
        if (partner.approvalStatus === 'rejected') {
            partner.approvalStatus = 'pending';
            partner.rejectionReason = null; // Clear rejection reason
            await partner.save();
        }
        res.json({ success: true, document: doc });
    }
    catch (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Upload failed", error: String(err) });
    }
});
// 6. Update Vehicle Details
router.put("/vehicle", async (req, res) => {
    try {
        const { partnerId, vehicleType, vehicleNumber, vehicleModel } = req.body;
        if (!partnerId || !vehicleType || !vehicleNumber) {
            return res.status(400).json({ message: "Missing vehicle details" });
        }
        const partner = await Partner_1.Partner.findByPk(partnerId);
        if (!partner)
            return res.status(404).json({ message: "Partner not found" });
        partner.vehicleType = vehicleType;
        partner.vehicleNumber = vehicleNumber;
        partner.vehicleModel = vehicleModel;
        // If coming from onboarding, status is pending. 
        if (partner.approvalStatus === 'rejected') {
            partner.approvalStatus = 'pending';
            partner.rejectionReason = null;
        }
        await partner.save();
        res.json({ success: true, partner });
    }
    catch (err) {
        console.error("Vehicle update error:", err);
        res.status(500).json({ message: "Failed to update vehicle details" });
    }
});
// 7. Get Current Partner (Me)
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader)
            return res.status(401).json({ message: "No token provided" });
        const token = authHeader.split(" ")[1];
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log(`[DEBUG] /me check. Token ID: ${decoded.id}, Phone: ${decoded.phone}`);
        const partner = await Partner_1.Partner.findByPk(decoded.id, {
            include: [{ model: Area_1.Area, as: 'area' }] // Include Area
        });
        if (!partner) {
            console.error(`[DEBUG] /me failed. Partner ID ${decoded.id} NOT FOUND in DB.`);
            // Check if partner exists by phone to see if ID changed (DB reset?)
            const byPhone = await Partner_1.Partner.findOne({ where: { phone: decoded.phone } });
            if (byPhone) {
                console.error(`[DEBUG] Partner found by phone ${decoded.phone} but ID is ${byPhone.id}. Token ID ${decoded.id} is stale.`);
            }
            return res.status(404).json({ message: "Partner not found" });
        }
        res.json({
            partner: {
                id: partner.id,
                phone: partner.phone,
                fullName: partner.fullName,
                approvalStatus: partner.approvalStatus,
                isOnline: partner.isOnline,
                rejectionReason: partner.rejectionReason,
                vehicleType: partner.vehicleType,
                vehicleNumber: partner.vehicleNumber,
                vehicleModel: partner.vehicleModel,
                areaId: partner.areaId,
                activeServices: partner.activeServices,
                area: partner.area,
                createdAt: partner.createdAt
            }
        });
    }
    catch (err) {
        return res.status(401).json({ message: "Invalid token" });
    }
});
// Helper to get partner docs status
router.get('/documents', async (req, res) => {
    try {
        const { partnerId } = req.query;
        if (!partnerId) {
            return res.status(400).json({ success: false, message: 'Partner ID required' });
        }
        const docs = await PartnerDocument_1.PartnerDocument.findAll({
            where: { partnerId: Number(partnerId) },
            order: [['createdAt', 'ASC']]
        });
        const documents = {};
        docs.forEach(doc => {
            documents[doc.documentType] = {
                status: doc.status === 'rejected' ? 'rejected' : 'uploaded',
                reason: doc.rejectionReason
            };
        });
        res.json({ success: true, documents });
    }
    catch (error) {
        console.error('Fetch docs error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
});
exports.default = router;
//# sourceMappingURL=partner-auth.js.map