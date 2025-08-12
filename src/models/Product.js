const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema({
  color: { type: String, required: false },
  size: { type: String, required: false },
  stock: { type: Number, required: false },
  price: { type: Number, required: false },
});

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: false },
  description: { type: String, required: false },
  feature: { type: Array, required: false },
  categories: { type: [String], required: true },
  producter: String,
  images: [String],
  variants: [variantSchema],
  slug: { type: String, unique: true },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
