const express = require("express");

const router = express.Router();

const {
    getSummary,
    getDailyViews,
    getHourlyViews,
    getTopProducts,
    getProductsAnalytics,
    getProductAnalytics,
    getBottomProducts,
} = require("../controllers/productAnalyticsController");

const {
    protect,
    adminProtect,
} = require("../middleware/authMiddleware");

router.use(protect, adminProtect);


router.get("/summary",getSummary);
router.get("/daily", getDailyViews);
router.get("/hourly", getHourlyViews);
router.get("/top-products", getTopProducts);
router.get("/bottom-products", getBottomProducts);
router.get("/products", getProductsAnalytics);
router.get("/products/:id", getProductAnalytics);

module.exports = router;