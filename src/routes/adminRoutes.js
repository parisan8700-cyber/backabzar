const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const { protect, adminProtect } = require("../middleware/authMiddleware");


router.get("/dashboard-stats", protect, adminProtect, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    // const totalOrders = await Order.countDocuments({ status: { $ne: "pending" } });
    const totalOrders = await Order.countDocuments();
    const totalRevenueData = await Order.aggregate([
      { $match: { status: { $in: ["paid", "shipped", "delivered"] } } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalRevenue = totalRevenueData[0]?.total || 0;

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue,
    });
  } catch (err) {
    res.status(500).json({ message: "خطا در گرفتن آمار کلی", error: err.message });
  }
});

// 📌 آمار ماهانه: تعداد سفارش و درآمد هر ماه
// router.get("/monthly-stats", protect, adminProtect, async (req, res) => {
//   try {
//     const stats = await Order.aggregate([
//       {
//         $match: {
//           status: { $in: ["paid", "shipped", "delivered"] },
//         },
//       },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
//           orderCount: { $sum: 1 },
//           totalRevenue: { $sum: "$amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     res.json(stats);
//   } catch (err) {
//     res.status(500).json({ message: "خطا در گرفتن آمار ماهانه", error: err.message });
//   }
// });

module.exports = router;
