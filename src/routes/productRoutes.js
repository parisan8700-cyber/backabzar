const express = require("express");
const {
  getAllProducts,
  getProductsByCategory,
  addProduct,
  addMultipleProducts,
  deleteAllProducts,
  getProductBySlug,
  searchProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/id/:id", getProductById);
router.get("/:slug", getProductBySlug);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/", addProduct);
router.post("/add-multiple", addMultipleProducts);
router.delete("/delete-all", deleteAllProducts);

module.exports = router;
