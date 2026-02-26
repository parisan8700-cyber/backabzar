const axios = require("axios");

exports.verifyPayment = async (trackId) => {
    const response = await axios.post(
        "https://gateway.zibal.ir/v1/verify",
        {
            merchant: process.env.ZIBAL_MERCHANT,
            trackId,
        },
        {
            headers: { "Content-Type": "application/json" },
        }
    );

    return response.data;
};