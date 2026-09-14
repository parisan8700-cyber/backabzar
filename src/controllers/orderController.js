const orderService = require("../services/orderService");

// const ORDERING_ENABLED = false;


// exports.createOrder = async (req, res) => {
//     try {
//         // 🔒 ثبت سفارش موقتاً غیرفعال است
//         if (!ORDERING_ENABLED) {
//             return res.status(503).json({
//                 message: "ثبت سفارش موقتاً بسته است."
//             });
//         }

//         // اگر کاربر لاگین کرده
//         const userId = req.user ? req.user._id : null;
//         const { items, guestId } = req.body;

//         if (!items || items.length === 0) {
//             return res.status(400).json({ message: "سبد خرید خالی است" });
//         }

//         const order = await orderService.createOrder(
//             userId,
//             items,
//             req.body,
//             guestId
//         );

//         await orderService.clearCart(userId, guestId);

//         res.status(201).json(order);
//     } catch (err) {
//         res.status(500).json({
//             message: "خطا در ثبت سفارش",
//             error: err.message
//         });
//     }
// };

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


exports.updateOrder = async (req, res) => {
    try {
        const { items, shippingMethod } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({
                message: "سفارش باید حداقل یک محصول داشته باشد",
            });
        }

        if (!shippingMethod) {
            return res.status(400).json({
                message: "روش ارسال مشخص نشده است",
            });
        }

        const order = await orderService.updateOrder(
            req.params.id,
            items,
            shippingMethod
        );

        res.status(200).json({
            message: "سفارش با موفقیت ویرایش شد",
            order,
        });
    } catch (err) {
        console.error("Update Order Error:", err);

        if (err.message === "سفارش پیدا نشد") {
            return res.status(404).json({
                message: err.message,
            });
        }

        res.status(400).json({
            message: "خطا در ویرایش سفارش",
            error: err.message,
        });
    }
};