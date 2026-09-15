const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const MAX_ORDER_VALUE = 100000000;

/**
 * محاسبه هزینه ارسال
 */
const getShippingCost = (shippingMethod) => {
    switch (shippingMethod) {
        case "pickup":
            return 100000;

        case "post":
            return 100000;

        case "express":
            return 200000;

        default:
            throw new Error("روش ارسال نامعتبر است");
    }
};

const buildProductQuantityMap = (items) => {
    const map = {};

    for (const item of items) {
        const productId = String(item.productId);
        const quantity = Number(item.quantity);

        map[productId] = (map[productId] || 0) + quantity;
    }

    return map;
};

const decreaseStock = async (productId, quantity) => {
    const product = await Product.findOneAndUpdate(
        {
            _id: productId,
            stock: { $gte: quantity },
        },
        {
            $inc: { stock: -quantity },
        },
        {
            new: true,
        }
    );

    if (!product) {
        const existingProduct = await Product.findById(productId);

        if (!existingProduct) {
            throw new Error("محصول پیدا نشد");
        }

        throw new Error(
            `موجودی ${existingProduct.name} کافی نیست. موجودی فعلی: ${existingProduct.stock}`
        );
    }

    return product;
};


const increaseStock = async (productId, quantity) => {
    if (!quantity || quantity <= 0) {
        return;
    }

    await Product.findByIdAndUpdate(
        productId,
        {
            $inc: { stock: quantity },
        }
    );
};




exports.createOrder = async (userId, items, orderData) => {
    let totalAmount = 0;

    // اطلاعات محصولات برای محاسبه قیمت
    const products = {};

    for (const item of items) {
        if (!item.productId) {
            throw new Error("شناسه محصول مشخص نشده است");
        }

        if (!item.quantity || Number(item.quantity) < 1) {
            throw new Error("تعداد محصول باید حداقل ۱ باشد");
        }

        const product = await Product.findById(item.productId);

        if (!product) {
            throw new Error("محصول پیدا نشد");
        }

        products[String(item.productId)] = product;

        const currentPrice =
            item.purchaseType === "installment"
                ? Number(item.price)
                : product.price - (product.discount || 0);

        if (
            item.purchaseType === "installment" &&
            (item.price === undefined ||
                item.price === null ||
                Number(item.price) < 0)
        ) {
            throw new Error(
                `مبلغ پیش‌پرداخت ${product.name} مشخص نشده است`
            );
        }

        item.originalPrice = product.price;

        totalAmount +=
            currentPrice * Number(item.quantity);
    }

    const shippingCost = getShippingCost(
        orderData.shippingMethod
    );

    if (totalAmount > MAX_ORDER_VALUE) {
        throw new Error(
            "مجموع ارزش محصولات سفارش نمی‌تواند بیشتر از ۱۰۰ میلیون تومان باشد"
        );
    }

    const order = await Order.create({
        ...orderData,
        items,
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
        .populate(
            "items.productId",
            "name price discount stock"
        );
};



exports.getAllOrders = async () => {
    return await Order.find()
        .sort({ createdAt: -1 })
        .populate(
            "userId",
            "name phone"
        )
        .populate(
            "items.productId",
            "name price discount stock"
        );
};



exports.deleteOrder = async (id) => {
    const deletedOrder =
        await Order.findByIdAndDelete(id);

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



exports.updateOrder = async (
    id,
    items,
    shippingMethod
) => {
    const order = await Order.findById(id);

    if (!order) {
        throw new Error("سفارش پیدا نشد");
    }

    if (
        !items ||
        !Array.isArray(items) ||
        items.length === 0
    ) {
        throw new Error(
            "سفارش باید حداقل یک محصول داشته باشد"
        );
    }

    let totalAmount = 0;
    const updatedItems = [];

    for (const item of items) {
        if (!item.productId) {
            throw new Error(
                "شناسه محصول مشخص نشده است"
            );
        }

        if (
            !item.quantity ||
            Number(item.quantity) < 1
        ) {
            throw new Error(
                "تعداد محصول باید حداقل ۱ باشد"
            );
        }

        const product =
            await Product.findById(item.productId);

        if (!product) {
            throw new Error(
                "محصول پیدا نشد"
            );
        }

        const purchaseType =
            item.purchaseType || "cash";

        let currentPrice;

        if (purchaseType === "installment") {
            /*
             * در سفارش اقساطی قیمت آیتم می‌تواند صفر باشد.
             * اینجا فقط منفی بودن یا نبودن مقدار را بررسی می‌کنیم.
             */
            if (
                item.price === undefined ||
                item.price === null ||
                Number(item.price) < 0
            ) {
                throw new Error(
                    `مبلغ محصول اقساطی برای ${product.name} مشخص نشده است`
                );
            }

            currentPrice = Number(item.price);
        } else {
            currentPrice =
                product.price -
                (product.discount || 0);
        }

        const originalPrice =
            product.price;

        totalAmount +=
            currentPrice *
            Number(item.quantity);

        updatedItems.push({
            productId: product._id,
            quantity: Number(item.quantity),
            price: currentPrice,
            originalPrice,
            purchaseType,
        });
    }

    const shippingCost =
        getShippingCost(shippingMethod);

    if (totalAmount > MAX_ORDER_VALUE) {
        throw new Error(
            "مجموع ارزش محصولات سفارش نمی‌تواند بیشتر از ۱۰۰ میلیون تومان باشد"
        );
    }

    /*
     * فقط سفارش‌هایی که قبلاً موجودی‌شان کم شده،
     * باید هنگام ویرایش موجودی را تغییر دهند.
     *
     * pending:
     * موجودی هنوز کم نشده → هیچ تغییری نده
     *
     * paid / shipped / delivered:
     * موجودی قبلاً کم شده → اختلاف را اصلاح کن
     */
    const stockAlreadyDeducted = [
        "paid",
        "shipped",
        "delivered",
    ].includes(order.status);

    let appliedStockChanges = [];

    if (stockAlreadyDeducted) {
        const oldQuantityMap =
            buildProductQuantityMap(
                order.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                }))
            );

        const newQuantityMap =
            buildProductQuantityMap(
                updatedItems
            );

        const stockChanges = {};

        const allProductIds = new Set([
            ...Object.keys(oldQuantityMap),
            ...Object.keys(newQuantityMap),
        ]);

        for (const productId of allProductIds) {
            const oldQuantity =
                oldQuantityMap[productId] || 0;

            const newQuantity =
                newQuantityMap[productId] || 0;

            const difference =
                newQuantity - oldQuantity;

            if (difference !== 0) {
                stockChanges[productId] =
                    difference;
            }
        }

        /*
         * اعمال تغییرات موجودی
         */
        try {
            for (
                const [productId, difference]
                of Object.entries(stockChanges)
            ) {
                if (difference > 0) {
                    // تعداد سفارش بیشتر شده
                    await decreaseStock(
                        productId,
                        difference
                    );

                    appliedStockChanges.push({
                        productId,
                        difference,
                    });
                } else {
                    // تعداد سفارش کمتر شده
                    const returnedQuantity =
                        Math.abs(difference);

                    await increaseStock(
                        productId,
                        returnedQuantity
                    );

                    appliedStockChanges.push({
                        productId,
                        difference,
                    });
                }
            }
        } catch (error) {
            /*
             * اگر یکی از تغییرات موجودی شکست خورد،
             * تغییرات قبلی را Rollback می‌کنیم.
             */
            for (
                const change of [
                    ...appliedStockChanges,
                ].reverse()
            ) {
                if (change.difference > 0) {
                    await increaseStock(
                        change.productId,
                        change.difference
                    );
                } else {
                    await decreaseStock(
                        change.productId,
                        Math.abs(
                            change.difference
                        )
                    );
                }
            }

            throw error;
        }
    }

    const newAmount =
        totalAmount + shippingCost;

    order.items = updatedItems;

    order.shippingMethod =
        shippingMethod;

    order.shippingCost =
        shippingCost;

    order.amount =
        newAmount;

    order.remainingAmount =
        Math.max(
            0,
            newAmount -
            (order.paidAmount || 0)
        );

    try {
        await order.save();
    } catch (error) {
        /*
         * اگر ذخیره سفارش شکست خورد،
         * تغییرات موجودی را برمی‌گردانیم.
         */
        for (
            const change of [
                ...appliedStockChanges,
            ].reverse()
        ) {
            if (change.difference > 0) {
                await increaseStock(
                    change.productId,
                    change.difference
                );
            } else {
                await decreaseStock(
                    change.productId,
                    Math.abs(
                        change.difference
                    )
                );
            }
        }

        throw error;
    }

    const updatedOrder =
        await Order.findById(order._id)
            .populate(
                "userId",
                "name phone"
            )
            .populate(
                "items.productId",
                "name price discount stock"
            );

    return updatedOrder;
};