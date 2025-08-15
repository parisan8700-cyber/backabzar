const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { addToCart, getCart, removeFromCart, addInstallmentToCart } = require("../controllers/cartController");

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.post("/add-installment", protect, addInstallmentToCart);
router.delete("/remove/:productId", protect, removeFromCart);

module.exports = router;
