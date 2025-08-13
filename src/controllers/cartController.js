const cartService = require("../services/cartService");

exports.addToCart = async (req, res) => {
    try {
        const { productId, quantity, guestId } = req.body;

        if (!req.user && !guestId) {
            return res.status(400).json({ message: "شناسه مهمان یا کاربر لازم است" });
        }

        const cart = await cartService.addToCart({
            userId: req.user?._id,
            guestId,
            productId,
            quantity
        });

        res.status(200).json({ message: "محصول اضافه شد", cart });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


exports.getCart = async (req, res) => {
    try {
        let cart;
        if (req.user) {
            cart = await cartService.getCart(req.user._id);
        } else if (req.query.guestId) {
            cart = await cartService.getCartForGuest(req.query.guestId);
        } else {
            return res.status(400).json({ message: "شناسه مهمان یا کاربر لازم است" });
        }
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
