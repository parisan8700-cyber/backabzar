const express = require("express");
const Category = require("../models/Category");
const router = express.Router();


router.get("/", async (req, res) => {
    try {
        const categories = await Category.find().sort({ name: 1 });
        res.json(categories);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت دسته‌بندی‌ها" });
    }
});


router.get("/tree", async (req, res) => {
    try {
        const categories = await Category.find().lean();

        const map = {};

        // دسته‌های اصلی
        categories.forEach(cat => {
            if (!cat.parent) {
                map[cat._id] = { name: cat.name, slug: cat.slug, subs: [] };
            }
        });

        // زیر دسته‌ها
        categories.forEach(cat => {
            if (cat.parent) {
                if (map[cat.parent]) {
                    map[cat.parent].subs.push({ name: cat.name, slug: cat.slug });
                }
            }
        });

        const tree = Object.values(map);
        res.json(tree);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "خطا در گرفتن دسته‌ها" });
    }
});

module.exports = router;