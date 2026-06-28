const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

const {
  protect,
  adminProtect,
} = require("../middleware/authMiddleware");

router.get(
  "/dashboard-stats",
  protect,
  adminProtect,
  async (req, res) => {
    try {
      // --------------------------
      // آمار کلی
      // --------------------------

      const totalUsers = await User.countDocuments();

      const totalProducts = await Product.countDocuments();

      const totalOrders = await Order.countDocuments();

      // --------------------------
      // درآمد کل
      // --------------------------

      const totalRevenueData = await Order.aggregate([
        {
          $match: {
            status: {
              $in: ["paid", "shipped", "delivered"],
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const totalRevenue =
        totalRevenueData[0]?.total || 0;

      // --------------------------
      // درآمد ماه جاری
      // --------------------------

      const startOfMonth = new Date(
        new Date().getFullYear(),
        new Date().getMonth(),
        1
      );

      const monthlyRevenueData = await Order.aggregate([
        {
          $match: {
            status: {
              $in: ["paid", "shipped", "delivered"],
            },
            createdAt: {
              $gte: startOfMonth,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const monthlyRevenue =
        monthlyRevenueData[0]?.total || 0;

      // --------------------------
      // درآمد سال جاری
      // --------------------------

      const startOfYear = new Date(
        new Date().getFullYear(),
        0,
        1
      );

      const yearlyRevenueData = await Order.aggregate([
        {
          $match: {
            status: {
              $in: ["paid", "shipped", "delivered"],
            },
            createdAt: {
              $gte: startOfYear,
            },
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$amount",
            },
          },
        },
      ]);

      const yearlyRevenue =
        yearlyRevenueData[0]?.total || 0;

      // --------------------------
      // پرفروش‌ترین محصولات
      // --------------------------

      const topProducts = await Order.aggregate([
        {
          $match: {
            status: {
              $in: ["paid", "shipped", "delivered"],
            },
          },
        },

        {
          $unwind: "$items",
        },

        {
          $group: {
            _id: "$items.productId",
            sold: {
              $sum: "$items.quantity",
            },
          },
        },

        {
          $sort: {
            sold: -1,
          },
        },

        {
          $limit: 5,
        },

        {
          $lookup: {
            from: "products",
            localField: "_id",
            foreignField: "_id",
            as: "product",
          },
        },

        {
          $unwind: "$product",
        },

        {
          $project: {
            _id: "$product._id",
            name: "$product.name",
            sold: 1,
            price: "$product.price",
            image: {
              $arrayElemAt: ["$product.images", 0],
            },
          },
        },
      ]);

      // --------------------------
      // نمودار فروش 12 ماه اخیر
      // --------------------------

      const salesChart = await Order.aggregate([
        {
          $match: {
            status: {
              $in: ["paid", "shipped", "delivered"],
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },
              month: {
                $month: "$createdAt",
              },
            },

            revenue: {
              $sum: "$amount",
            },

            orders: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      res.json({
        totalUsers,
        totalProducts,
        totalOrders,

        totalRevenue,
        monthlyRevenue,
        yearlyRevenue,

        topProducts,

        salesChart,
      });
    } catch (err) {
      res.status(500).json({
        message: "خطا در دریافت آمار داشبورد",
        error: err.message,
      });
    }
  }
);

module.exports = router;