const verifyService = require("../services/verifyService");
const Order = require("../models/Order");
const Product = require("../models/Product");

exports.verifyPayment = async (req, res) => {
    const { trackId, orderId } = req.body;

    try {
       
        const data = await verifyService.verifyPayment(trackId);

        if (data.result !== 100) {
            return res.json({
                success: false,
                message: "پرداخت ناموفق",
                data,
            });
        }

        
        const order = await Order.findById(orderId);

        if (!order) {
            return res.status(404).json({
                success: false,
                message: "سفارش پیدا نشد",
            });
        }


        if (order.status === "paid") {
            return res.json({
                success: true,
                message: "این سفارش قبلاً پرداخت و ثبت شده است",
                data,
            });
        }


        for (const item of order.items) {
            const product = await Product.findById(item.productId);

            if (!product) {
                return res.status(400).json({
                    success: false,
                    message: "یکی از محصولات سفارش پیدا نشد",
                });
            }

            if (product.stock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `موجودی ${product.name} کافی نیست. موجودی فعلی: ${product.stock}`,
                });
            }
        }

        const decreasedProducts = [];

        try {
            for (const item of order.items) {
                const product = await Product.findOneAndUpdate(
                    {
                        _id: item.productId,
                        stock: {
                            $gte: item.quantity,
                        },
                    },
                    {
                        $inc: {
                            stock: -item.quantity,
                        },
                    },
                    {
                        new: true,
                    }
                );

                if (!product) {
                    throw new Error(
                        `موجودی ${item.productId} برای ثبت سفارش کافی نیست`
                    );
                }

                decreasedProducts.push({
                    productId: item.productId,
                    quantity: item.quantity,
                });
            }
        } catch (stockError) {
            for (const item of decreasedProducts) {
                await Product.findByIdAndUpdate(
                    item.productId,
                    {
                        $inc: {
                            stock: item.quantity,
                        },
                    }
                );
            }

            throw stockError;
        }


        order.status = "paid";
        order.paidAt = new Date();
        order.transactionId = trackId;

        await order.save();

        return res.json({
            success: true,
            message: "پرداخت با موفقیت انجام شد",
            data,
        });
    } catch (err) {
        console.error("VERIFY ERROR:", err);

        return res.status(500).json({
            success: false,
            error: "خطا در تأیید پرداخت",
            detail: err.response?.data || err.message,
        });
    }
};