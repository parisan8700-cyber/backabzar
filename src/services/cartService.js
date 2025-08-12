const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.addToCart = async (userId, productId, quantity) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("شناسه محصول معتبر نیست");
    }

    const product = await Product.findById(productId);
    if (!product) {
        throw new Error("محصول یافت نشد");
    }

    const variant = product.variants?.[0];

    if (variant && variant.stock < quantity) {
        throw new Error("موجودی کافی نیست");
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
        cart = new Cart({ user: userId, items: [] });
    }

    const existingItem = cart.items.find(
        (item) =>
            item.product.toString() === productId &&
            (!item.variant || !variant || (
                item.variant.color === variant.color &&
                item.variant.size === variant.size
            ))
    );

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
            variant: variant
                ? { color: variant.color, size: variant.size, stock: variant.stock }
                : undefined,
            quantity,
        });
    }

    await cart.save();
    return cart;
};

exports.getCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    return cart || { items: [] };
};

exports.removeFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
        throw new Error("سبد خرید شما خالی است");
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId
    );

    await cart.save();
    return cart;
};
