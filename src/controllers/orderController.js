const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {
    try {
        // اگر کاربر لاگین کرده
        const userId = req.user ? req.user._id : null;

        const { items } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "سبد خرید خالی است" });
        }

        const order = await orderService.createOrder(userId, items, req.body);

        // اگر کاربر لاگین کرده بود، سبد خریدش رو خالی کن
        if (userId) {
            await orderService.clearCart(userId);
        }

        res.status(201).json(order);
    } catch (err) {
        res.status(500).json({ message: "خطا در ثبت سفارش", error: err.message });
    }
};


exports.getUserOrders = async (req, res) => {
    try {
        const orders = await orderService.getUserOrders(req.user._id);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت سفارشات", error: err.message });
    }
};

exports.getAllOrders = async (req, res) => {
    try {
        const orders = await orderService.getAllOrders();
        res.status(200).json(orders);
    } catch (err) {
        res.status(500).json({ message: "خطا در دریافت سفارشات", error: err.message });
    }
};

