const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  id: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: false },
  stock: { type: Number, required: true, min: 0 },
  description: { type: String, required: false },
  feature: { type: Array, required: false },
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    }
  ],
  brand: String,
  images: [String],
  slug: { type: String, unique: true },
});

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
