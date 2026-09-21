const productAnalyticsService = require("../services/productAnalyticsService");

exports.getSummary = async (req, res) => {
    try {
        const data =
            await productAnalyticsService.getSummary();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "PRODUCT ANALYTICS SUMMARY ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message: "خطا در دریافت آمار بازدید",
        });
    }
};


exports.getDailyViews = async (req, res) => {
    try {
        const {
            range = "30days",
            from,
            to,
        } = req.query;

        const data =
            await productAnalyticsService.getDailyViews(
                range,
                from,
                to
            );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "PRODUCT ANALYTICS DAILY ERROR:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "خطا در دریافت نمودار بازدید",
        });
    }
};


exports.getHourlyViews = async (req, res) => {
    try {
        const data =
            await productAnalyticsService.getHourlyViews();

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "PRODUCT ANALYTICS HOURLY ERROR:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "خطا در دریافت آمار ساعتی",
        });
    }
};

exports.getTopProducts = async (req, res) => {
    try {
        const {
            range = "30days",
            limit = 10,
            from,
            to,
        } = req.query;

        const data =
            await productAnalyticsService.getTopProducts(
                range,
                limit,
                from,
                to
            );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "PRODUCT ANALYTICS TOP PRODUCTS ERROR:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "خطا در دریافت پربازدیدترین محصولات",
        });
    }
};


exports.getBottomProducts = async (req, res) => {
    try {
        const {
            range = "30days",
            limit = 5,
            from,
            to,
        } = req.query;

        const data =
            await productAnalyticsService.getBottomProducts(
                range,
                limit,
                from,
                to
            );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "PRODUCT ANALYTICS BOTTOM PRODUCTS ERROR:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "خطا در دریافت کم‌بازدیدترین محصولات",
        });
    }
};

exports.getProductsAnalytics = async (
    req,
    res
) => {
    try {
        const {
            range = "30days",
            page = 1,
            limit = 20,
            search = "",
            from,
            to,
        } = req.query;

        const data =
            await productAnalyticsService.getProductsAnalytics(
                range,
                page,
                limit,
                search,
                from,
                to
            );

        res.status(200).json({
            success: true,
            ...data,
        });
    } catch (error) {
        console.error(
            "PRODUCT ANALYTICS PRODUCTS ERROR:",
            error
        );

        res.status(400).json({
            success: false,
            message:
                error.message ||
                "خطا در دریافت آمار محصولات",
        });
    }
};

exports.getProductAnalytics = async (
    req,
    res
) => {
    try {
        const {
            range = "30days",
            from,
            to,
        } = req.query;

        const data =
            await productAnalyticsService.getProductAnalytics(
                req.params.id,
                range,
                from,
                to
            );

        res.status(200).json({
            success: true,
            data,
        });
    } catch (error) {
        console.error(
            "PRODUCT ANALYTICS SINGLE PRODUCT ERROR:",
            error
        );

        const status =
            error.message ===
                "محصول پیدا نشد"
                ? 404
                : 400;

        res.status(status).json({
            success: false,
            message:
                error.message ||
                "خطا در دریافت آمار محصول",
        });
    }
};