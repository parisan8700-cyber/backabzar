const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const MAX_ORDER_VALUE = 100000000;

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

        item.originalPrice = product.price;

        totalAmount += currentPrice * item.quantity;
    }

    let shippingCost = 0;

    switch (orderData.shippingMethod) {
        case "pickup":
            shippingCost = 100000;
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

    if (totalAmount > MAX_ORDER_VALUE) {
        throw new Error(
            "مجموع ارزش محصولات سفارش نمی‌تواند بیشتر از ۱۰۰ میلیون تومان باشد"
        );
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


exports.clearCart = async (userId, guestId) => {

    if (userId) {
        return await Cart.findOneAndUpdate(
            { user: userId },
            { $set: { items: [] } }
        );
    }

    if (guestId) {
        return await Cart.findOneAndUpdate(
            { guestId },
            { $set: { items: [] } }
        );
    }

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


exports.deleteOrder = async (id) => {
    const deletedOrder = await Order.findByIdAndDelete(id);
    return deletedOrder;
};

exports.updateOrderStatus = async (id, status) => {
    const order = await Order.findById(id);

    if (!order) {
        throw new Error("سفارش پیدا نشد");
    }

    order.status = status;

    await order.save();

    return order;
};