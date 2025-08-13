const Cart = require("../models/Cart");
const Product = require("../models/Product");
const mongoose = require("mongoose");

exports.getCart = async (userId) => {
    const cart = await Cart.findOne({ user: userId }).populate("items.product");
    return cart || { items: [] };
};

exports.getCartForGuest = async (guestId) => {
    const cart = await Cart.findOne({ guestId }).populate("items.product");
    return cart || { items: [] };
};

exports.addToCart = async ({ userId, guestId, productId, quantity }) => {
    if (!mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error("شناسه محصول معتبر نیست");
    }

    const product = await Product.findById(productId);
    if (!product) throw new Error("محصول یافت نشد");

    const stock = product.stock;
    if (quantity <= 0 && !userId && !guestId) throw new Error("مقدار محصول باید بیشتر از صفر باشد");

    const query = userId ? { user: userId } : { guestId };
    let cart = await Cart.findOne(query);
    if (!cart) cart = new Cart({ ...query, items: [] });

    let existingItem = cart.items.find(
        (item) => item.product.toString() === productId.toString()
    );

    const totalQuantity = (existingItem?.quantity || 0) + quantity;
    if (stock !== undefined && totalQuantity > stock) {
        throw new Error("مقدار درخواستی بیشتر از موجودی انبار است");
    }

    if (existingItem) {
        existingItem.quantity += quantity;
        if (existingItem.quantity <= 0) {
            // اگر تعداد به صفر رسید، حذفش کن
            cart.items = cart.items.filter(
                (item) => item.product.toString() !== productId.toString()
            );
        }
    } else {
        if (quantity > 0) cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    return cart;
};

exports.removeFromCart = async ({ userId, guestId, productId }) => {
    const query = userId ? { user: userId } : { guestId };
    const cart = await Cart.findOne(query);
    if (!cart || cart.items.length === 0) {
        throw new Error("سبد خرید شما خالی است");
    }

    cart.items = cart.items.filter(
        (item) => item.product.toString() !== productId.toString()
    );

    await cart.save();
    return cart;
};
