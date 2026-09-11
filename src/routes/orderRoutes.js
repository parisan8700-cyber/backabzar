const express = require("express");
const router = express.Router();
const { protect, adminProtect } = require("../middleware/authMiddleware");

const {
    createOrder,
    getUserOrders,
    getAllOrders,
    deleteOrder,
    updateOrderStatus
} = require("../controllers/orderController");


router.get("/", protect, adminProtect, getAllOrders);
router.get("/user-orders", protect, getUserOrders);
router.post("/", protect, createOrder);
router.delete("/:id", protect, adminProtect, deleteOrder);
router.patch("/:id/status", protect, updateOrderStatus);


module.exports = router;