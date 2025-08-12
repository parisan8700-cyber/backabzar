const express = require("express");
const router = express.Router();
const { protect, adminProtect } = require("../middleware/authMiddleware");
const { createOrder, getUserOrders, getAllOrders,} = require("../controllers/orderController");

router.get("/", protect, adminProtect, getAllOrders);
router.get("/user-orders", protect, getUserOrders);
router.post("/", protect, createOrder);

module.exports = router;
