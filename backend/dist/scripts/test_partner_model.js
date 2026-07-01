"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const Partner_1 = require("../models/Partner");
const run = async () => {
    try {
        console.log("Syncing DB...");
        await database_1.default.sync();
        console.log("Looking for a partner...");
        let partner = await Partner_1.Partner.findOne();
        if (!partner) {
            console.log("No partner found, creating one...");
            partner = await Partner_1.Partner.create({
                phone: '9876543210',
                fullName: 'Test Partner',
                walletBalance: 0,
                approvalStatus: 'pending',
                status: 'active'
            });
        }
        console.log(`Found partner ID: ${partner.id}, Status: ${partner.approvalStatus}`);
        console.log("Attempting to approve...");
        partner.approvalStatus = 'approved';
        await partner.save();
        console.log("Approved successfully!");
        console.log("Attempting to reject...");
        partner.approvalStatus = 'rejected';
        partner.rejectionReason = 'Test Rejection';
        await partner.save();
        console.log("Rejected successfully!");
    }
    catch (error) {
        console.error("Error:", error);
    }
    finally {
        await database_1.default.close();
    }
};
run();
//# sourceMappingURL=test_partner_model.js.map