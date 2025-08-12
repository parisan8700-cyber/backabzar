const { createZarinpalPayment } = require("../services/paymentService");

exports.createPayment = async (req, res) => {
    const { amount, description } = req.body;

    try {
        const result = await createZarinpalPayment(amount, description);

        if (result.success) {
            res.json({ url: result.url });
        } else {
            res.status(400).json({
                error: "درخواست ناموفق",
                status: result.error.code,
                message: result.error.message,
            });
        }
    } catch (err) {
        console.error("❌ Zarinpal Error:", err.message);
        res.status(500).json({
            error: "خطا در ارتباط با زرین‌پال",
            detail: err.message,
        });
    }
};
