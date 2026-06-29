const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

exports.createOrder = async (userId, items, orderData) => {
    let totalAmount = 0;

    for (const item of items) {
        const product = await Product.findById(item.productId);

        if (!product || product.stock < item.quantity) {
            throw new Error(`موجودی ${product?.name || "محصول"} کافی نیست`);
        }

        const currentPrice =
            item.purchaseType === "installment"
                ? item.price
                : product.price - (product.discount || 0);

        totalAmount += currentPrice * item.quantity;
    }

    let shippingCost = 0;

    switch (orderData.shippingMethod) {
        case "pickup":
            shippingCost = 0;
            break;

        case "post":
            shippingCost = 100000;
            break;

        case "express":
            shippingCost = 200000;
            break;

        default:
            throw new Error("روش ارسال نامعتبر است");
    }

    const order = await Order.create({
        ...orderData,
        amount: totalAmount + shippingCost,
        shippingCost,
        shippingMethod: orderData.shippingMethod,
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
