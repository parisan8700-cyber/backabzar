const axios = require("axios");

exports.createZarinpalPayment = async (amount, description) => {
    const isDev = process.env.NODE_ENV !== "production";
    const callback_url = isDev
        ? "http://localhost:3000/basket/success"
        : "https://research-pied.vercel.app/basket/success";

    const params = {
        merchant_id: process.env.ZARINPAL_MERCHANT_ID,
        amount,
        callback_url,
        description,
    };

    const response = await axios.post(
        "https://sandbox.zarinpal.com/pg/v4/payment/request.json",
        params,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    const { data } = response;

    if (data.data.code === 100) {
        return {
            success: true,
            url: `https://sandbox.zarinpal.com/pg/StartPay/${data.data.authority}`,
        };
    } else {
        return {
            success: false,
            error: {
                code: data.data.code,
                message: data.data.message,
            },
        };
    }
};
