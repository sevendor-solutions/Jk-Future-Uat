"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("./config/database"));
const User_1 = require("./models/User");
const Role_1 = require("./models/Role");
const CustomerCreationLog_1 = require("./models/CustomerCreationLog");
const Otp_1 = require("./models/Otp");
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
async function runSimulation() {
    const testPhone = "8888888888";
    const testCode = "4321";
    try {
        await database_1.default.authenticate();
        console.log("--- STARTING FINAL REGISTRATION SIMUIATION ---");
        // 1. Cleanup old tests in correct order (Log first, then User)
        await CustomerCreationLog_1.CustomerCreationLog.destroy({ where: { phone: testPhone } });
        await User_1.User.destroy({ where: { phone: testPhone } });
        await Otp_1.Otp.destroy({ where: { phone: testPhone } });
        console.log("Cleaned up old test data (Correct order).");
        // 2. Create OTP
        await Otp_1.Otp.create({
            phone: testPhone,
            code: testCode,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });
        console.log("Created OTP:", testCode);
        // 3. Simulate create-account logic
        const sanitizedPhone = testPhone.replace(/\D/g, '');
        console.log("Sanitized Phone:", sanitizedPhone);
        const otp = await Otp_1.Otp.findOne({
            where: { phone: testPhone, code: testCode, isUsed: false }
        });
        if (!otp || otp.expiresAt < new Date()) {
            throw new Error("OTP verification failed");
        }
        const existingUser = await User_1.User.findOne({
            where: { [sequelize_1.Op.or]: [{ phone: sanitizedPhone }, { username: sanitizedPhone }] }
        });
        if (existingUser) {
            throw new Error("User already exists");
        }
        otp.isUsed = true;
        await otp.save();
        let role = await Role_1.Role.findOne({
            where: { name: { [sequelize_1.Op.iLike]: 'Customer' } }
        });
        if (!role) {
            role = await Role_1.Role.findOne({ where: { name: 'Customer' } });
        }
        console.log(`Creating user with roleId: ${role?.id}`);
        const user = await User_1.User.create({
            phone: sanitizedPhone,
            username: sanitizedPhone,
            fullName: "Diagnostic User",
            password: await bcrypt_1.default.hash("test", 10),
            roleId: role?.id,
            role: "customer",
            status: "active"
        });
        console.log("User created ID:", user.id);
        await CustomerCreationLog_1.CustomerCreationLog.create({
            customerId: user.id,
            phone: user.phone,
            fullName: user.fullName || null,
            ipAddress: "127.0.0.1",
            deviceInfo: "Final Test",
            appVersion: "1.0.0",
            registrationMethod: "otp"
        });
        console.log("Log created successfully.");
        // Verification
        const savedUser = await User_1.User.findByPk(user.id);
        const savedLog = await CustomerCreationLog_1.CustomerCreationLog.findOne({ where: { customerId: user.id } });
        console.log("Saved User Username:", savedUser?.username);
        console.log("Saved Log Phone:", savedLog?.phone);
        console.log("--- FINAL SIMULATION SUCCESSFUL ---");
    }
    catch (error) {
        console.error("--- FINAL SIMULATION FAILED ---");
        console.error("Error Message:", error.message);
        if (error.errors) {
            console.error("Details:", error.errors.map((e) => e.message));
        }
    }
    finally {
        await database_1.default.close();
    }
}
runSimulation();
//# sourceMappingURL=diagnostic.js.map