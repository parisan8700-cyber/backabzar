const productViewService = require("../services/productViewService");

exports.recordProductView = async (req, res) => {
    try {
        const { visitorId } = req.body;

        const result =
            await productViewService.recordProductView(
                req.params.id,
                visitorId,
                req.user
            );

        return res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error) {

        if (error.message === "محصول پیدا نشد") {
            return res.status(404).json({
                success: false,
                message: error.message,
            });
        }

        return res.status(400).json({
            success: false,
            message: error.message || "خطا در ثبت بازدید",
        });
    }
};