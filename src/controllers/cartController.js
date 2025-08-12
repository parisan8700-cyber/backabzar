const cartService = require("../services/cartService");

exports.addToCart = async (req, res) => {
    try {
        const cart = await cartService.addToCart(req.user._id, req.body.productId, req.body.quantity);
        res.status(200).json({ message: "محصول اضافه شد", cart });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

exports.getCart = async (req, res) => {
    try {
        const cart = await cartService.getCart(req.user._id);
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    try {
        const cart = await cartService.removeFromCart(req.user._id, req.params.productId);
        res.status(200).json({ message: "محصول حذف شد", cart });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
