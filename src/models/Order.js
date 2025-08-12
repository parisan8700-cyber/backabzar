const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
        items: [
            {
                productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
                quantity: Number,
                price: Number,
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
        status: {
            type: String,
            enum: ["pending", "paid", "shipped", "delivered"],
            default: "pending",
        },
        amount: { type: Number, required: true },
        paidAt: Date,
        transactionId: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
