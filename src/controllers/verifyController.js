const verifyService = require("../services/verifyService");
const Order = require("../models/Order");

exports.verifyPayment = async (req, res) => {
    const { trackId, orderId } = req.body;


    try {
        const data = await verifyService.verifyPayment(trackId);

        if (data.result === 100) {

            await Order.findByIdAndUpdate(orderId, {
                status: "paid"
            });

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
        return res.status(500).json({
            error: "خطا در تأیید پرداخت",
            detail: err.response?.data || err.message,
        });
    }
};