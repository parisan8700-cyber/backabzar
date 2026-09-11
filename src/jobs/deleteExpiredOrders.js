const Order = require("../models/Order");

const deleteExpiredOrders = async () => {
    try {
        const fiveDaysAgo = new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000
        );

        const result = await Order.deleteMany({
            status: "pending",
            createdAt: { $lt: fiveDaysAgo },
        });

        if (result.deletedCount > 0) {
            console.log(
                `🗑️ ${result.deletedCount} سفارش پرداخت‌نشده قدیمی حذف شد`
            );
        }
    } catch (error) {
        console.error(
            "❌ خطا در حذف سفارش‌های منقضی:",
            error.message
        );
    }
};

module.exports = deleteExpiredOrders;