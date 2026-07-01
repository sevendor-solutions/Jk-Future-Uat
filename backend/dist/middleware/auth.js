"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ success: false, message: "Access Denied: No authentication token provided." });
    }
    try {
        const secret = process.env.JWT_SECRET || "jk_future_infra_secret_jwt_key_2026";
        const decoded = jsonwebtoken_1.default.verify(token, secret);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(403).json({ success: false, message: "Access Denied: Invalid or expired authentication token." });
    }
};
exports.authenticateToken = authenticateToken;
//# sourceMappingURL=auth.js.map