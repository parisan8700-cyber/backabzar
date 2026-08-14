const verifyService = require("../services/verifyService");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.verifyPayment = async (req, res) => {
    const { trackId, orderId } = req.body;

    try {
        // تایید پرداخت از زیبال
        const data = await verifyService.verifyPayment(trackId);

        if (data.result === 100) {

            // سفارش را پیدا کن
            const order = await Order.findById(orderId);

            if (!order) {
                return res.status(404).json({
                    success: false,
                    message: "سفارش پیدا نشد",
                });
            }

            /*
            جلوگیری از دوباره کم شدن موجودی

            ممکن است کاربر صفحه را رفرش کند
            یا درخواست Verify دوباره ارسال شود.

            اگر سفارش قبلاً paid شده باشد،
            دیگر موجودی را کم نمی‌کنیم.
            */

            if (order.status !== "paid") {

                // کم کردن موجودی تمام محصولات سفارش
                for (const item of order.items) {

                    const product = await Product.findOneAndUpdate(
                        {
                            _id: item.productId,

                            // فقط اگر موجودی کافی بود
                            stock: {
                                $gte: item.quantity,
                            },
                        },
                        {
                            // کم کردن موجودی
                            $inc: {
                                stock: -item.quantity,
                            },
                        },
                        {
                            new: true,
                        }
                    );

                    // اگر محصول پیدا نشد یا موجودی کافی نبود
                    if (!product) {
                        return res.status(400).json({
                            success: false,
                            message: "موجودی یکی از محصولات کافی نیست",
                        });
                    }
                }

                // بعد از کاهش موجودی، سفارش را پرداخت شده کن
                order.status = "paid";
                order.paidAt = new Date();
                order.transactionId = trackId;

                await order.save();
            }

            return res.json({
                success: true,
                message: "پرداخت با موفقیت انجام شد",
                data,
            });
        }

        return res.json({
            success: false,
            message: "پرداخت ناموفق",
            data,
        });

    } catch (err) {
        console.error("VERIFY ERROR:", err);

        return res.status(500).json({
            error: "خطا در تأیید پرداخت",
            detail: err.response?.data || err.message,
        });
    }
};