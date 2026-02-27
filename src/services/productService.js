const Category = require("../models/Category");
const Product = require("../models/Product");
const slugify = require("slugify");

exports.getAllProducts = async (query) => {
    const filters = {};

    const products = await Product.find(filters)
        .populate({
            path: "categories",
            select: "name parent",
            populate: {
                path: "parent",
                select: "name"
            }
        });

    return products;
};


exports.getProductById = async (id) => {
    const product = await Product.findById(id);
    return product;
};

// exports.getProductsByCategory = async (category) => {
//     const products = await Product.find({ categories: category });
//     return products;
// };

exports.getProductsByCategory = async (mainSlug, subSlug) => {
    const mainCategory = await Category.findOne({ slug: mainSlug });
    if (!mainCategory) return [];

    let categoryIds = [mainCategory._id];

    if (subSlug) {
        const subCategory = await Category.findOne({ slug: subSlug, parent: mainCategory._id });
        if (!subCategory) return [];
        categoryIds = [subCategory._id];
    } else {
        const subCategories = await Category.find({ parent: mainCategory._id });
        categoryIds = categoryIds.concat(subCategories.map(c => c._id));
    }

    const products = await Product.find({ categories: { $in: categoryIds } }).populate("categories");

    return products;
};

exports.getProductBySlug = async (slug) => {
    const product = await Product.findOne({ slug });
    return product;
};

exports.addProduct = async (productData) => {
    let slug = slugify(productData.name, { lower: true, strict: true });

    const existingProduct = await Product.findOne({ slug });
    if (existingProduct) {
        slug = `${slug}-${Date.now()}`;
    }

    const newProduct = new Product({
        id: Date.now().toString(),
        slug,
        ...productData,
    });

    await newProduct.save();
    return newProduct;
};

exports.addMultipleProducts = async (products) => {
    if (!products || !Array.isArray(products)) {
        throw new Error("فرمت داده‌ها نادرست است");
    }

    const productsWithSlug = await Promise.all(
        products.map(async (product) => {
            let slug = slugify(product.name, { lower: true, strict: true });

            const existingProduct = await Product.findOne({ slug });
            if (existingProduct) {
                slug = `${slug}-${Date.now()}`;
            }

            return { ...product, slug };
        })
    );

    const addedProducts = await Product.insertMany(productsWithSlug);
    return addedProducts;
};

exports.deleteAllProducts = async () => {
    await Product.deleteMany({});
};

exports.searchProducts = async (q) => {
    if (!q) {
        throw new Error("عبارت جستجو وارد نشده است");
    }

    const products = await Product.find({
        name: { $regex: q, $options: "i" },
    });

    return products;
};

exports.updateProduct = async (id, updatedFields) => {
    const updatedProduct = await Product.findByIdAndUpdate(id, updatedFields, {
        new: true,
    });
    return updatedProduct;
};

exports.deleteProduct = async (id) => {
    const deleted = await Product.findByIdAndDelete(id);
    return deleted;
};

