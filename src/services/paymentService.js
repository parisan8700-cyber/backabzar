const axios = require("axios");

exports.createZibalPayment = async (amount, description, orderId) => {
    const isDev = process.env.NODE_ENV !== "production";
    const callback_url =
        `${process.env.BACKEND_URL}/basket/success?orderId=${orderId}`;

    const params = {
        merchant: process.env.ZIBAL_MERCHANT,
        amount,
        callbackUrl: callback_url,
        description,
        orderId,
    };

    const response = await axios.post("https://gateway.zibal.ir/v1/request", params, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    const { data } = response;

    if (data.result === 100) {
        return {
            success: true,
            url: `https://gateway.zibal.ir/start/${data.trackId}`,
        };
    } else {
        return {
            success: false,
            error: {
                code: data.result,
                message: data.message,
            },
        };
    }
};
