const productService = require("../services/productService");

exports.getAllProducts = async (req, res) => {
  try {
    const products = await productService.getAllProducts(req.query);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت محصولات" });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    if (!product) return res.status(404).json({ message: "محصول یافت نشد" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت محصول" });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const products = await productService.getProductsByCategory(req.params.category);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: "خطا در دریافت محصولات بر اساس دسته‌بندی" });
  }
};

exports.getProductBySlug = async (req, res) => {
  try {
    const product = await productService.getProductBySlug(req.params.slug);
    if (!product) return res.status(404).json({ message: "محصول پیدا نشد" });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    if (!req.body.name) {
      return res.status(400).json({ message: "نام محصول الزامی است" });
    }

    const newProduct = await productService.addProduct(req.body);
    res.status(201).json({
      message: "محصول با موفقیت اضافه شد",
      product: newProduct,
    });
  } catch (error) {
    res.status(500).json({ message: "خطا در افزودن محصول" });
  }
};

exports.addMultipleProducts = async (req, res) => {
  try {
    const addedProducts = await productService.addMultipleProducts(req.body.products);
    res.status(201).json({
      message: "محصولات با موفقیت اضافه شدند",
      products: addedProducts,
    });
  } catch (error) {
    res.status(400).json({ message: error.message || "خطا در افزودن محصولات" });
  }
};

exports.deleteAllProducts = async (req, res) => {
  try {
    await productService.deleteAllProducts();
    res.status(200).json({ message: "تمام محصولات با موفقیت حذف شدند" });
  } catch (error) {
    res.status(500).json({ message: "خطا در حذف محصولات" });
  }
};

exports.searchProducts = async (req, res) => {
  try {
    const products = await productService.searchProducts(req.query.q);
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message || "خطا در جستجو" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const updatedProduct = await productService.updateProduct(req.params.id, req.body);
    if (!updatedProduct) return res.status(404).json({ message: "محصول یافت نشد" });

    res.json({ message: "محصول با موفقیت ویرایش شد", product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: "خطا در ویرایش محصول" });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deleted = await productService.deleteProduct(req.params.id);
    if (!deleted) return res.status(404).json({ message: "محصول یافت نشد" });

    res.json({ message: "محصول با موفقیت حذف شد" });
  } catch (error) {
    res.status(500).json({ message: "خطا در حذف محصول" });
  }
};
