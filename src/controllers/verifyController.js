const verifyService = require("../services/verifyService");

exports.verifyPayment = async (req, res) => {
    const { trackId } = req.body; 

    try {
        const data = await verifyService.verifyPayment(trackId);

        if (data.result === 100) {
            await Order.findByIdAndUpdate(orderId, { status: "paid" });

            res.json({
                success: true,
                message: "پرداخت با موفقیت انجام شد",
                data,
            });
        } else {
            res.json({
                success: false,
                message: "پرداخت ناموفق",
                data,
            });
        }
    } catch (err) {
        res.status(500).json({
            error: "خطا در تأیید پرداخت",
            detail: err.response?.data || err.message,
        });
    }
};
