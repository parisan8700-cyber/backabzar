const express = require("express");
const { protect } = require("../middleware/authMiddleware");
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
const { recordProductView } = require("../controllers/productViewController");


const router = express.Router();

router.get("/", getAllProducts);
router.get("/search", searchProducts);
router.get("/category/:main/:sub?", getProductsByCategory);
router.get("/id/:id", getProductById);
router.post("/:id/view", protect, recordProductView);
router.get("/:slug", getProductBySlug);
router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);
router.post("/", addProduct);
router.post("/add-multiple", addMultipleProducts);
router.delete("/delete-all", deleteAllProducts);

module.exports = router;
