const { createZibalPayment } = require("../services/paymentService");

exports.createPayment = async (req, res) => {
    const { amount, description, orderId } = req.body;

    try {
        const result = await createZibalPayment(amount, description, orderId);

        if (result.success) {
            res.json({ url: result.url, orderId });
        } else {
            res.status(400).json({
                error: "درخواست ناموفق",
                status: result.error.code,
                message: result.error.message,
            });
        }
    } catch (err) {
        console.error("❌ Zibal Error:", err.message);
        res.status(500).json({
            error: "خطا در ارتباط با زیبال",
            detail: err.message,
        });
    }
};
