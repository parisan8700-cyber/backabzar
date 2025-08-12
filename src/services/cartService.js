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

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
            quantity,
        });
    }

    await cart.save();
    return cart;
};


exports.addToCartForGuest = async (guestId, productId, quantity) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("شناسه محصول معتبر نیست");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("محصول یافت نشد");

    const variant = product.variants?.[0];
    if (variant && variant.stock < quantity) throw new Error("موجودی کافی نیست");

    let cart = await Cart.findOne({ guestId });
    if (!cart) {
        cart = new Cart({ guestId, items: [] });
    }

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({
            product: productId,
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

exports.getCartForGuest = async (guestId) => {
    const cart = await Cart.findOne({ guestId }).populate("items.product");
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
