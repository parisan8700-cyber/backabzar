const mongoose = require("mongoose");

const productViewSchema = new mongoose.Schema(
    {
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true,
            index: true,
        },

        visitorId: {
            type: String,
            required: true,
            index: true,
        },

        viewedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },

        /*
         * کلید یکتای بازدید
         *
         * ترکیب:
         * productId + visitorId + بازه ۳۰ دقیقه‌ای
         */
        viewKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
    },
    {
        timestamps: true,
    }
);

// برای گزارش‌گیری و تاریخچه بازدیدها
productViewSchema.index({
    productId: 1,
    viewedAt: -1,
});

productViewSchema.index({
    productId: 1,
    visitorId: 1,
    viewedAt: -1,
});

const ProductView = mongoose.model(
    "ProductView",
    productViewSchema
);

module.exports = ProductView;