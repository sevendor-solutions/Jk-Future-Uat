"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Blog_1 = require("../models/Blog");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// GET all blogs
router.get("/", async (req, res, next) => {
    try {
        const { category } = req.query;
        const whereClause = {};
        if (category) {
            whereClause.category = category;
        }
        const blogs = await Blog_1.Blog.findAll({
            where: whereClause,
            order: [["createdAt", "DESC"]]
        });
        return res.json({ success: true, data: blogs });
    }
    catch (error) {
        next(error);
    }
});
// GET blog by slug
router.get("/slug/:slug", async (req, res, next) => {
    try {
        const blog = await Blog_1.Blog.findOne({
            where: { slug: req.params.slug }
        });
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        return res.json({ success: true, data: blog });
    }
    catch (error) {
        next(error);
    }
});
// GET blog by ID
router.get("/:id", async (req, res, next) => {
    try {
        const blog = await Blog_1.Blog.findByPk(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        return res.json({ success: true, data: blog });
    }
    catch (error) {
        next(error);
    }
});
// POST create blog
router.post("/", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const newBlog = await Blog_1.Blog.create(req.body);
        return res.status(201).json({ success: true, data: newBlog });
    }
    catch (error) {
        next(error);
    }
});
// PUT update blog
router.put("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const blog = await Blog_1.Blog.findByPk(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        await blog.update(req.body);
        return res.json({ success: true, data: blog });
    }
    catch (error) {
        next(error);
    }
});
// DELETE blog
router.delete("/:id", auth_1.authenticateToken, async (req, res, next) => {
    try {
        const blog = await Blog_1.Blog.findByPk(req.params.id);
        if (!blog) {
            return res.status(404).json({ success: false, message: "Blog not found" });
        }
        await blog.destroy();
        return res.json({ success: true, message: "Blog deleted successfully" });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=blogs.js.map