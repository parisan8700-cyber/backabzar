const Category = require("../models/Category");

async function getAllCategories() {
    return await Category.find().sort({ name: 1 });
}

async function getCategoryTree() {
    const categories = await Category.find().lean();
    const map = {};

    
    categories.forEach(cat => {
        if (!cat.parent) {
            map[cat._id] = {
                _id: cat._id,
                name: cat.name,
                slug: cat.slug,
                subs: []
            };
        }
    });

    
    categories.forEach(cat => {
        if (cat.parent) {
            if (map[cat.parent]) {
                map[cat.parent].subs.push({
                    _id: cat._id,
                    name: cat.name,
                    slug: cat.slug
                });
            }
        }
    });

    return Object.values(map);
}

module.exports = { getAllCategories, getCategoryTree };