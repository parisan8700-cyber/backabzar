const axios = require("axios");

exports.verifyPayment = async (authority, amount) => {
    const response = await axios.post(
        "https://sandbox.zarinpal.com/pg/v4/payment/verify.json",
        {
            merchant_id: process.env.ZARINPAL_MERCHANT_ID,
            amount,
            authority,
        },
        {
            headers: { "Content-Type": "application/json" },
        }
    );

    return response.data;
};
