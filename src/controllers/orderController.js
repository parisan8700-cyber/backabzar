const orderService = require("../services/orderService");

exports.createOrder = async (req, res) => {
    try {
        // اگر کاربر لاگین کرده
        const userId = req.user ? req.user._id : null;

        const { items, guestId } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ message: "سبد خرید خالی است" });
        }


        const order = await orderService.createOrder(
            userId,
            items,
            req.body,
            guestId
        );

        await orderService.clearCart(userId, guestId);

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


exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await orderService.deleteOrder(
            req.params.id
        );

        if (!deletedOrder) {
            return res.status(404).json({
                message: "سفارش پیدا نشد",
            });
        }

        res.status(200).json({
            message: "سفارش با موفقیت حذف شد",
        });
    } catch (err) {
        res.status(500).json({
            message: "خطا در حذف سفارش",
            error: err.message,
        });
    }
};


exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        if (!status) {
            return res.status(400).json({
                message: "وضعیت سفارش مشخص نشده است",
            });
        }

        const order = await orderService.updateOrderStatus(
            req.params.id,
            status
        );

        res.status(200).json({
            message: "وضعیت سفارش با موفقیت تغییر کرد",
            order,
        });
    } catch (err) {
        res.status(500).json({
            message: "خطا در تغییر وضعیت سفارش",
            error: err.message,
        });
    }
};