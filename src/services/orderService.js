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

/**
 * ساختن نقشه تعداد محصولات
 *
 * مثال:
 * [
 *   { productId: "A", quantity: 2 },
 *   { productId: "A", quantity: 1 },
 *   { productId: "B", quantity: 3 }
 * ]
 *
 * تبدیل می‌شود به:
 * {
 *   A: 3,
 *   B: 3
 * }
 */
const buildProductQuantityMap = (items) => {
    const map = {};

    for (const item of items) {
        const productId = String(item.productId);
        const quantity = Number(item.quantity);

        map[productId] = (map[productId] || 0) + quantity;
    }

    return map;
};

/**
 * کم کردن موجودی
 *
 * این تابع به صورت اتمیک موجودی را کم می‌کند.
 * یعنی اگر موجودی کافی نباشد، اصلاً کم نمی‌کند.
 */
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

/**
 * برگرداندن موجودی
 */
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


/* =========================================================
   ثبت سفارش
========================================================= */

exports.createOrder = async (userId, items, orderData) => {
    let totalAmount = 0;

    // برای جلوگیری از مشکل محصولات تکراری
    const requestedQuantityMap = buildProductQuantityMap(items);

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

    /*
     * ---------------------------------------------------------
     * کم کردن موجودی
     * ---------------------------------------------------------
     */

    const decreasedStock = [];

    try {
        for (const [productId, quantity] of Object.entries(
            requestedQuantityMap
        )) {
            await decreaseStock(
                productId,
                quantity
            );

            decreasedStock.push({
                productId,
                quantity,
            });
        }
    } catch (error) {
        /*
         * اگر کم کردن موجودی یکی از محصولات شکست خورد،
         * موجودی محصولاتی که قبل از آن کم شده‌اند
         * دوباره برگردانده می‌شود.
         */
        for (const item of decreasedStock) {
            await increaseStock(
                item.productId,
                item.quantity
            );
        }

        throw error;
    }

    /*
     * ---------------------------------------------------------
     * ساخت سفارش
     * ---------------------------------------------------------
     */

    try {
        const order = await Order.create({
            ...orderData,
            items,
            amount: totalAmount + shippingCost,
            shippingCost,
            shippingMethod: orderData.shippingMethod,
            userId,
        });

        return order;
    } catch (error) {
        /*
         * اگر ساخت سفارش به هر دلیلی شکست خورد،
         * موجودی‌هایی که کم کرده بودیم برگردانده می‌شوند.
         */
        for (const item of decreasedStock) {
            await increaseStock(
                item.productId,
                item.quantity
            );
        }

        throw error;
    }
};


/* =========================================================
   خالی کردن سبد
========================================================= */

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


/* =========================================================
   سفارشات کاربر
========================================================= */

exports.getUserOrders = async (userId) => {
    return await Order.find({ userId })
        .sort({ createdAt: -1 })
        .populate(
            "items.productId",
            "name price discount stock"
        );
};


/* =========================================================
   همه سفارشات
========================================================= */

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


/* =========================================================
   حذف سفارش
========================================================= */

exports.deleteOrder = async (id) => {
    const deletedOrder =
        await Order.findByIdAndDelete(id);

    return deletedOrder;
};


/* =========================================================
   تغییر وضعیت سفارش
========================================================= */

exports.updateOrderStatus = async (id, status) => {
    const order = await Order.findById(id);

    if (!order) {
        throw new Error("سفارش پیدا نشد");
    }

    order.status = status;

    await order.save();

    return order;
};


/* =========================================================
   ویرایش سفارش توسط ادمین
========================================================= */

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

    /*
     * ---------------------------------------------------------
     * اعتبارسنجی و محاسبه مبلغ سفارش جدید
     * ---------------------------------------------------------
     */

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
            if (
                item.price === undefined ||
                item.price === null ||
                Number(item.price) < 0
            ) {
                throw new Error(
                    `مبلغ پیش‌پرداخت برای ${product.name} مشخص نشده است`
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
     * ---------------------------------------------------------
     * محاسبه موجودی قبلی و جدید
     * ---------------------------------------------------------
     */

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

    /*
     * اینجا دقیقاً مشخص می‌کنیم هر محصول
     * چقدر باید از موجودی کم یا به موجودی اضافه شود.
     *
     * مثال:
     *
     * قبلی: 2
     * جدید: 1
     *
     * difference = -1
     * یعنی یک عدد باید برگردد.
     *
     * قبلی: 1
     * جدید: 3
     *
     * difference = +2
     * یعنی دو عدد باید از موجودی کم شود.
     */

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
     * ---------------------------------------------------------
     * اعمال تغییر موجودی
     * ---------------------------------------------------------
     */

    const appliedStockChanges = [];

    try {
        for (const [productId, difference] of Object.entries(
            stockChanges
        )) {
            /*
             * difference مثبت:
             * تعداد سفارش بیشتر شده
             * پس باید از موجودی کم شود.
             */
            if (difference > 0) {
                await decreaseStock(
                    productId,
                    difference
                );

                appliedStockChanges.push({
                    productId,
                    difference,
                });
            }

            /*
             * difference منفی:
             * تعداد سفارش کمتر شده
             * پس موجودی باید برگردد.
             */
            else {
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
         * اگر در وسط تغییر موجودی خطایی رخ داد،
         * تمام تغییرات قبلی را برعکس می‌کنیم.
         */
        for (
            const change of [...appliedStockChanges].reverse()
        ) {
            if (change.difference > 0) {
                // قبلاً کم کرده بودیم، پس برمی‌گردانیم
                await increaseStock(
                    change.productId,
                    change.difference
                );
            } else {
                // قبلاً اضافه کرده بودیم، پس دوباره کم می‌کنیم
                await decreaseStock(
                    change.productId,
                    Math.abs(change.difference)
                );
            }
        }

        throw error;
    }

    /*
     * ---------------------------------------------------------
     * مبلغ نهایی سفارش
     * ---------------------------------------------------------
     */

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

    /*
     * ---------------------------------------------------------
     * ذخیره سفارش
     * ---------------------------------------------------------
     */

    try {
        await order.save();
    } catch (error) {
        /*
         * اگر ذخیره سفارش شکست خورد،
         * تغییرات موجودی را برمی‌گردانیم.
         */
        for (
            const change of [...appliedStockChanges].reverse()
        ) {
            if (change.difference > 0) {
                await increaseStock(
                    change.productId,
                    change.difference
                );
            } else {
                await decreaseStock(
                    change.productId,
                    Math.abs(change.difference)
                );
            }
        }

        throw error;
    }

    /*
     * سفارش را دوباره populate می‌کنیم
     * تا فرانت‌اند productId را به صورت
     * آبجکت محصول دریافت کند.
     */
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