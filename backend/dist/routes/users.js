"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const UserSessionLog_1 = require("../models/UserSessionLog");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use(auth_1.authenticateToken);
// GET all user session logs
router.get("/logs/session", async (req, res, next) => {
    try {
        const logs = await UserSessionLog_1.UserSessionLog.findAll({
            order: [["createdAt", "DESC"]],
            limit: 100
        });
        return res.json({ success: true, data: logs });
    }
    catch (error) {
        next(error);
    }
});
// GET all users
router.get("/", async (req, res, next) => {
    try {
        const users = await User_1.User.findAll({
            order: [["name", "ASC"]]
        });
        // Mask passwords in listing
        const cleanUsers = users.map(u => {
            const uJson = u.toJSON();
            delete uJson.password;
            return uJson;
        });
        return res.json({ success: true, data: cleanUsers });
    }
    catch (error) {
        next(error);
    }
});
// POST create user
router.post("/", async (req, res, next) => {
    try {
        const { username } = req.body;
        const exists = await User_1.User.findOne({ where: { username } });
        if (exists) {
            return res.status(400).json({ success: false, message: "Username already exists" });
        }
        const newUser = await User_1.User.create(req.body);
        const userJson = newUser.toJSON();
        delete userJson.password;
        return res.status(201).json({ success: true, data: userJson });
    }
    catch (error) {
        next(error);
    }
});
// PUT update user
router.put("/:id", async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await user.update(req.body);
        const userJson = user.toJSON();
        delete userJson.password;
        return res.json({ success: true, data: userJson });
    }
    catch (error) {
        next(error);
    }
});
// DELETE user
router.delete("/:id", async (req, res, next) => {
    try {
        const user = await User_1.User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await user.destroy();
        return res.json({ success: true, message: "User deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map