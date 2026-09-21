const Product = require("../models/Product");
const ProductView = require("../models/ProductView");

const VIEW_COOLDOWN_MINUTES = 30;

exports.recordProductView = async (productId, visitorId, user) => {
    // بازدید ادمین ثبت نشود
    if (user?.role === "admin") {
        return {
            counted: false,
            reason: "admin",
        };
    }

   
    if (!visitorId) {
        throw new Error("شناسه بازدیدکننده ارسال نشده است");
    }

   
    const product = await Product.findById(productId);

    if (!product) {
        throw new Error("محصول پیدا نشد");
    }

    const cooldownMilliseconds =
        VIEW_COOLDOWN_MINUTES * 60 * 1000;

    const viewBucket = Math.floor(
        Date.now() / cooldownMilliseconds
    );

    const viewKey = `${productId}:${visitorId}:${viewBucket}`;

    let result;

    try {
        result = await ProductView.updateOne(
            {
                viewKey,
            },
            {
                $setOnInsert: {
                    productId,
                    visitorId,
                    viewedAt: new Date(),
                    viewKey,
                },
            },
            {
                upsert: true,
            }
        );
    } catch (error) {
        if (error.code === 11000) {
            return {
                counted: false,
                reason: "cooldown",
                views: product.views || 0,
            };
        }

        throw error;
    }

    if (result.upsertedCount === 0) {
        return {
            counted: false,
            reason: "cooldown",
            views: product.views || 0,
        };
    }


    const updatedProduct = await Product.findByIdAndUpdate(
        productId,
        {
            $inc: {
                views: 1,
            },
        },
        {
            new: true,
        }
    );

    return {
        counted: true,
        views: updatedProduct.views,
    };
};