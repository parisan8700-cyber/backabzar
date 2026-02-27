const categoryService = require("../services/categoryService");

async function getCategories(req, res) {
    try {
        const categories = await categoryService.getAllCategories();
        res.json(categories);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "خطا در دریافت دسته‌بندی‌ها" });
    }
}

async function getCategoryTree(req, res) {
    try {
        const tree = await categoryService.getCategoryTree();
        res.json(tree);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "خطا در گرفتن دسته‌ها" });
    }
}

module.exports = { getCategories, getCategoryTree };