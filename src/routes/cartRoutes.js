const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { addToCart, getCart, removeFromCart } = require("../controllers/cartController");

const router = express.Router();

router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.delete("/remove/:productId", protect, removeFromCart);

module.exports = router;
