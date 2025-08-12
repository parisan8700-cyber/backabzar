const verifyService = require("../services/verifyService");

exports.verifyPayment = async (req, res) => {
    const { Authority, Amount } = req.body;

    try {
        const data = await verifyService.verifyPayment(Authority, Amount);
        res.json(data);
    } catch (err) {
        res.status(500).json({
            error: "خطا در تأیید پرداخت",
            detail: err.response?.data || err.message,
        });
    }
};
