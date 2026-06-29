const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.createOrder = async (userId, items, orderData) => {
    for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product || product.stock < item.quantity) {
            throw new Error(`موجودی ${product?.name || "محصول"} کافی نیست`);
        }
    }

    let totalAmount = 0;

    for (const item of items) {
        const product = await Product.findById(item.productId);

        const currentPrice =
            item.purchaseType === "installment"
                ? item.price
                : product.price - (product.discount || 0);

        totalAmount += currentPrice * item.quantity;
    }

    const order = await Order.create({
        ...orderData,
        amount: totalAmount,
        userId,
    });
    return order;
};


exports.clearCart = async (userId) => {
    await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } });
};


exports.getUserOrders = async (userId) => {
    return await Order.find({ userId })
        .sort({ createdAt: -1 })
        .populate("items.productId", "name price");
};

exports.getAllOrders = async () => {
    return await Order.find()
        .populate("userId", "name phone")
        .populate("items.productId", "name price");
};
