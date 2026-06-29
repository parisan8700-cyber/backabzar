const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "Product",
                },

                quantity: {
                    type: Number,
                    required: true,
                },

                // مبلغ پرداخت شده برای این کالا
                price: {
                    type: Number,
                    required: true,
                },

                // قیمت واقعی کالا
                originalPrice: {
                    type: Number,
                    required: true,
                },

                // نوع خرید این کالا
                purchaseType: {
                    type: String,
                    enum: ["cash", "installment"],
                    default: "cash",
                },
            },
        ],

        firstName: String,
        lastName: String,
        city: String,
        province: String,
        address: String,
        postalCode: String,
        phone: String,
        description: String,

        // نوع پرداخت سفارش
        paymentType: {
            type: String,
            enum: ["cash", "installment"],
            default: "cash",
        },

        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "delivered"],
            default: "pending",
        },

        shippingMethod: {
            type: String,
            enum: ["pickup", "post", "express"],
            default: "post",
        },

        shippingCost: {
            type: Number,
            default: 0,
        },

        // مبلغی که کاربر الان پرداخت کرده
        amount: {
            type: Number,
            required: true,
        },

        // مبلغ پرداخت شده
        paidAmount: {
            type: Number,
            default: 0,
        },

        // مبلغ باقی مانده
        remainingAmount: {
            type: Number,
            default: 0,
        },

        paidAt: Date,

        transactionId: String,
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Order", orderSchema);