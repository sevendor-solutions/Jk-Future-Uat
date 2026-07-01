"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Role_1 = require("../models/Role");
const Permission_1 = require("../models/Permission");
const router = (0, express_1.Router)();
// Get all roles
router.get("/roles", async (req, res) => {
    try {
        const roles = await Role_1.Role.findAll();
        res.json(roles);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch roles" });
    }
});
// Get specific role with permissions
router.get("/roles/:id", async (req, res) => {
    try {
        const role = await Role_1.Role.findByPk(req.params.id, {
            include: [Permission_1.Permission]
        });
        if (!role)
            return res.status(404).json({ error: "Role not found" });
        res.json(role);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch role" });
    }
});
// Create role
router.post("/roles", async (req, res) => {
    try {
        const role = await Role_1.Role.create(req.body);
        res.status(201).json(role);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to create role" });
    }
});
// Update role permissions
router.post("/roles/:id/permissions", async (req, res) => {
    try {
        const { permissionIds } = req.body; // Array of Permission IDs
        const role = await Role_1.Role.findByPk(req.params.id);
        if (!role)
            return res.status(404).json({ error: "Role not found" });
        // Set permissions (Sequelize 'set' method handles the join table)
        await role.$set('permissions', permissionIds);
        res.json({ message: "Permissions updated successfully" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update permissions" });
    }
});
// Delete role
router.delete("/roles/:id", async (req, res) => {
    try {
        const { User } = require("../models/User");
        const userCount = await User.count({ where: { roleId: req.params.id } });
        if (userCount > 0) {
            return res.status(400).json({ message: `Cannot delete role: ${userCount} users are assigned to it.` });
        }
        await Role_1.Role.destroy({ where: { id: req.params.id } });
        res.json({ message: "Role deleted" });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete role" });
    }
});
// Get all permissions
router.get("/permissions", async (req, res) => {
    try {
        const permissions = await Permission_1.Permission.findAll();
        res.json(permissions);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch permissions" });
    }
});
exports.default = router;
//# sourceMappingURL=rbac.js.map