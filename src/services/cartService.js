const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.addToCart = async ({ userId, guestId, productId, quantity }) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("شناسه محصول معتبر نیست");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("محصول یافت نشد");

    // پشتیبانی هم از stock مستقیم و هم stock داخل variants
    const stock = product.variants?.[0]?.stock ?? product.stock;
    if (quantity <= 0) throw new Error("مقدار محصول باید بیشتر از صفر باشد");

    const query = userId ? { user: userId } : { guestId };
    let cart = await Cart.findOne(query);
    if (!cart) {
        cart = new Cart({ ...query, items: [] });
    }

    let existingItem = cart.items.find(
        (item) => item.product.toString() === productId.toString()
    );

    const totalQuantity = (existingItem?.quantity || 0) + quantity;
    if (stock !== undefined && totalQuantity > stock) {
        throw new Error("مقدار درخواستی بیشتر از موجودی انبار است");
    }

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.items.push({ product: productId, quantity });
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
