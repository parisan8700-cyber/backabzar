const ProductView = require("../models/ProductView");
const Product = require("../models/Product");


const TIME_ZONE = "Asia/Tehran";

const getTehranDateParts = (date = new Date()) => {
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hourCycle: "h23",
    });

    const parts = formatter.formatToParts(date);

    const get = (type) =>
        Number(
            parts.find((part) => part.type === type)?.value
        );

    return {
        year: get("year"),
        month: get("month"),
        day: get("day"),
        hour: get("hour"),
        minute: get("minute"),
        second: get("second"),
    };
};


const tehranLocalToUTC = (
    year,
    month,
    day,
    hour = 0,
    minute = 0,
    second = 0,
    millisecond = 0
) => {
    
    let utcGuess = new Date(
        Date.UTC(
            year,
            month - 1,
            day,
            hour,
            minute,
            second,
            millisecond
        )
    );

    const getOffset = (date) => {
        const parts = getTehranDateParts(date);

        const localAsUTC = Date.UTC(
            parts.year,
            parts.month - 1,
            parts.day,
            parts.hour,
            parts.minute,
            parts.second
        );

        return localAsUTC - date.getTime();
    };

    const offset = getOffset(utcGuess);

    let result = new Date(
        utcGuess.getTime() - offset
    );

    /**
     * یک بار دیگر offset را بررسی می‌کنیم تا
     * در صورت تغییر offset در مرز زمانی، نتیجه دقیق باشد.
     */
    const secondOffset = getOffset(result);

    if (secondOffset !== offset) {
        result = new Date(
            utcGuess.getTime() - secondOffset
        );
    }

    return result;
};

/**
 * شروع روز تهران
 */
const startOfTehranDay = (date = new Date()) => {
    const parts = getTehranDateParts(date);

    return tehranLocalToUTC(
        parts.year,
        parts.month,
        parts.day,
        0,
        0,
        0,
        0
    );
};

const shiftTehranCalendarDate = (
    date,
    days
) => {
    const parts = getTehranDateParts(date);

    const shifted = new Date(
        Date.UTC(
            parts.year,
            parts.month - 1,
            parts.day + days
        )
    );

    return tehranLocalToUTC(
        shifted.getUTCFullYear(),
        shifted.getUTCMonth() + 1,
        shifted.getUTCDate(),
        0,
        0,
        0,
        0
    );
};

/**
 * تغییر ماه روی تقویم تهران
 */
const shiftTehranCalendarMonths = (
    date,
    months
) => {
    const parts = getTehranDateParts(date);

    const shifted = new Date(
        Date.UTC(
            parts.year,
            parts.month - 1 + months,
            1
        )
    );

    return tehranLocalToUTC(
        shifted.getUTCFullYear(),
        shifted.getUTCMonth() + 1,
        1,
        0,
        0,
        0,
        0
    );
};

/**
 * تغییر سال روی تقویم تهران
 */
const shiftTehranCalendarYears = (
    date,
    years
) => {
    const parts = getTehranDateParts(date);

    const shifted = new Date(
        Date.UTC(
            parts.year + years,
            parts.month - 1,
            1
        )
    );

    return tehranLocalToUTC(
        shifted.getUTCFullYear(),
        shifted.getUTCMonth() + 1,
        1,
        0,
        0,
        0,
        0
    );
};


const parseCustomDate = (
    value,
    endOfDay = false
) => {
    if (!value) {
        return null;
    }


    if (
        /^\d{4}-\d{2}-\d{2}$/.test(value)
    ) {
        const [year, month, day] =
            value.split("-").map(Number);

        const start = tehranLocalToUTC(
            year,
            month,
            day,
            0,
            0,
            0,
            0
        );

        if (!endOfDay) {
            return start;
        }

        const nextDay = tehranLocalToUTC(
            year,
            month,
            day + 1,
            0,
            0,
            0,
            0
        );

        return new Date(
            nextDay.getTime() - 1
        );
    }

    const parsed = new Date(value);

    if (isNaN(parsed.getTime())) {
        return null;
    }

    return parsed;
};

const getDateRange = (
    range,
    from,
    to
) => {
    const now = new Date();

    let start;
    let end;

    /*
     * بازه سفارشی
     */
    if (
        range === "custom" &&
        from &&
        to
    ) {
        start = parseCustomDate(
            from,
            false
        );

        end = parseCustomDate(
            to,
            true
        );

        if (
            !start ||
            !end ||
            isNaN(start.getTime()) ||
            isNaN(end.getTime())
        ) {
            throw new Error(
                "بازه زمانی نامعتبر است"
            );
        }

        if (start > end) {
            throw new Error(
                "تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد"
            );
        }

        return {
            start,
            end,
        };
    }

    /*
     * امروز تهران
     */
    const todayStart =
        startOfTehranDay(now);

    /*
     * فردا - برای تعیین پایان امروز
     */
    const tomorrowStart =
        shiftTehranCalendarDate(
            todayStart,
            1
        );

    /*
     * به‌صورت پیش‌فرض تا همین لحظه
     */
    end = new Date(now);

    switch (range) {
        case "today": {
            start = todayStart;
            end = new Date(now);
            break;
        }

        case "yesterday": {
            start =
                shiftTehranCalendarDate(
                    todayStart,
                    -1
                );

            end = new Date(
                todayStart.getTime() - 1
            );

            break;
        }

        case "7days": {
            start =
                shiftTehranCalendarDate(
                    todayStart,
                    -6
                );

            end = new Date(now);
            break;
        }

        case "30days": {
            start =
                shiftTehranCalendarDate(
                    todayStart,
                    -29
                );

            end = new Date(now);
            break;
        }

        case "3months": {
            start =
                shiftTehranCalendarMonths(
                    todayStart,
                    -3
                );

            end = new Date(now);
            break;
        }

        case "6months": {
            start =
                shiftTehranCalendarMonths(
                    todayStart,
                    -6
                );

            end = new Date(now);
            break;
        }

        case "1year": {
            start =
                shiftTehranCalendarYears(
                    todayStart,
                    -1
                );

            end = new Date(now);
            break;
        }

        case "all": {
            start = new Date(0);
            end = new Date(now);
            break;
        }

        default: {
            start = todayStart;
            end = new Date(now);
            break;
        }
    }

    return {
        start,
        end,
    };
};


const getSummary = async () => {
    const now = new Date();

    // شروع امروز تهران
    const todayStart =
        startOfTehranDay(now);

    // شروع فردا تهران
    const tomorrowStart =
        shiftTehranCalendarDate(
            todayStart,
            1
        );

    // شروع دیروز تهران
    const yesterdayStart =
        shiftTehranCalendarDate(
            todayStart,
            -1
        );

    // شروع 7 روز اخیر
    const last7DaysStart =
        shiftTehranCalendarDate(
            todayStart,
            -6
        );

    // شروع 30 روز اخیر
    const last30DaysStart =
        shiftTehranCalendarDate(
            todayStart,
            -29
        );

    const [
        totalViews,
        todayViews,
        yesterdayViews,
        last7DaysViews,
        last30DaysViews,
        totalProducts,
    ] = await Promise.all([
        // کل بازدیدها
        ProductView.countDocuments(),

        // امروز
        ProductView.countDocuments({
            viewedAt: {
                $gte: todayStart,
                $lt: tomorrowStart,
            },
        }),

        // دیروز
        ProductView.countDocuments({
            viewedAt: {
                $gte: yesterdayStart,
                $lt: todayStart,
            },
        }),

        // 7 روز اخیر
        ProductView.countDocuments({
            viewedAt: {
                $gte: last7DaysStart,
                $lt: tomorrowStart,
            },
        }),

        // 30 روز اخیر
        ProductView.countDocuments({
            viewedAt: {
                $gte: last30DaysStart,
                $lt: tomorrowStart,
            },
        }),

        // تعداد کل محصولات
        Product.countDocuments(),
    ]);

    return {
        totalViews,
        todayViews,
        yesterdayViews,
        last7DaysViews,
        last30DaysViews,
        totalProducts,
    };
};


const getDailyViews = async (
    range = "30days",
    from,
    to
) => {
    const {
        start,
        end,
    } = getDateRange(
        range,
        from,
        to
    );

    const result =
        await ProductView.aggregate([
            {
                $match: {
                    viewedAt: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format:
                                "%Y-%m-%d",
                            date: "$viewedAt",
                            timezone:
                                TIME_ZONE,
                        },
                    },
                    views: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);

    return result.map((item) => ({
        date: item._id,
        views: item.views,
    }));
};



const getHourlyViews = async () => {
    const now = new Date();

    
    const start =
        startOfTehranDay(now);

    
    const end =
        shiftTehranCalendarDate(
            start,
            1
        );

    const result =
        await ProductView.aggregate([
            {
                $match: {
                    viewedAt: {
                        $gte: start,
                        $lt: end,
                    },
                },
            },
            {
                $group: {
                    _id: {
                        $hour: {
                            date: "$viewedAt",
                            timezone:
                                TIME_ZONE,
                        },
                    },
                    views: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    _id: 1,
                },
            },
        ]);

    const hours = [];

    for (
        let hour = 0;
        hour < 24;
        hour++
    ) {
        const found =
            result.find(
                (item) =>
                    item._id === hour
            );

        hours.push({
            hour,
            views: found
                ? found.views
                : 0,
        });
    }

    return hours;
};


const getTopProducts = async (
    range = "30days",
    limit = 10,
    from,
    to
) => {
    const {
        start,
        end,
    } = getDateRange(
        range,
        from,
        to
    );

    const safeLimit = Math.min(
        Math.max(
            Number(limit) || 10,
            1
        ),
        100
    );

    const result =
        await ProductView.aggregate([
            {
                $match: {
                    viewedAt: {
                        $gte: start,
                        $lte: end,
                    },
                },
            },
            {
                $group: {
                    _id: "$productId",
                    views: {
                        $sum: 1,
                    },
                },
            },
            {
                $sort: {
                    views: -1,
                },
            },
            {
                $limit: safeLimit,
            },
            {
                $lookup: {
                    from: "products",
                    localField:
                        "_id",
                    foreignField:
                        "_id",
                    as: "product",
                },
            },
            {
                $unwind: {
                    path: "$product",
                    preserveNullAndEmptyArrays:
                        true,
                },
            },
            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    name: "$product.name",
                    slug: "$product.slug",
                    price: "$product.price",
                    discount:
                        "$product.discount",
                    stock: "$product.stock",
                    images: {
                        $slice: [
                            {
                                $ifNull: [
                                    "$product.images",
                                    [],
                                ],
                            },
                            1,
                        ],
                    },
                    views: 1,
                },
            },
        ]);

    return result;
};


const getBottomProducts = async (
    range = "30days",
    limit = 5,
    from,
    to
) => {
    const {
        start,
        end,
    } = getDateRange(
        range,
        from,
        to
    );

    const safeLimit = Math.min(
        Math.max(
            Number(limit) || 5,
            1
        ),
        100
    );

    const result =
        await Product.aggregate([
            {
                $project: {
                    _id: 1,
                    name: 1,
                    slug: 1,
                    price: 1,
                    discount: 1,
                    stock: 1,
                    images: {
                        $slice: [
                            {
                                $ifNull: [
                                    "$images",
                                    [],
                                ],
                            },
                            1,
                        ],
                    },
                },
            },

            /*
             * بازدیدهای همین بازه زمانی
             */
            {
                $lookup: {
                    from: "productviews",
                    let: {
                        productId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$productId",
                                                "$$productId",
                                            ],
                                        },
                                        {
                                            $gte: [
                                                "$viewedAt",
                                                start,
                                            ],
                                        },
                                        {
                                            $lte: [
                                                "$viewedAt",
                                                end,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $count: "count",
                        },
                    ],
                    as: "viewStats",
                },
            },

            {
                $addFields: {
                    views: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    "$viewStats.count",
                                    0,
                                ],
                            },
                            0,
                        ],
                    },
                },
            },

            /*
             * کمترین بازدید اول
             */
            {
                $sort: {
                    views: 1,
                    _id: 1,
                },
            },

            {
                $limit: safeLimit,
            },

            {
                $project: {
                    _id: 0,
                    productId: "$_id",
                    name: 1,
                    slug: 1,
                    price: 1,
                    discount: 1,
                    stock: 1,
                    images: 1,
                    views: 1,
                },
            },
        ]);

    return result;
};


const getProductsAnalytics = async (
    range = "30days",
    page = 1,
    limit = 20,
    search = "",
    from,
    to
) => {
    const {
        start,
        end,
    } = getDateRange(
        range,
        from,
        to
    );

    const safePage = Math.max(
        Number(page) || 1,
        1
    );

    const safeLimit = Math.min(
        Math.max(
            Number(limit) || 20,
            1
        ),
        100
    );

    const skip =
        (safePage - 1) *
        safeLimit;

    /*
     * سرچ بر اساس نام محصول
     */
    const productMatch = search
        ? {
            name: {
                $regex: search,
                $options: "i",
            },
        }
        : {};

    const result =
        await Product.aggregate([
            /*
             * فقط محصولات موردنظر
             */
            {
                $match: productMatch,
            },

            /*
             * پیدا کردن بازدیدهای محصول
             * در بازه انتخاب‌شده
             */
            {
                $lookup: {
                    from: "productviews",
                    let: {
                        productId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        {
                                            $eq: [
                                                "$productId",
                                                "$$productId",
                                            ],
                                        },
                                        {
                                            $gte: [
                                                "$viewedAt",
                                                start,
                                            ],
                                        },
                                        {
                                            $lte: [
                                                "$viewedAt",
                                                end,
                                            ],
                                        },
                                    ],
                                },
                            },
                        },
                        {
                            $count: "count",
                        },
                    ],
                    as: "viewStats",
                },
            },

            /*
             * محصول بدون بازدید => views = 0
             */
            {
                $addFields: {
                    views: {
                        $ifNull: [
                            {
                                $arrayElemAt: [
                                    "$viewStats.count",
                                    0,
                                ],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $sort: {
                    views: -1,
                    _id: 1,
                },
            },

            {
                $facet: {
                    data: [
                        {
                            $skip: skip,
                        },
                        {
                            $limit:
                                safeLimit,
                        },
                        {
                            $project: {
                                _id: 0,
                                productId:
                                    "$_id",
                                name: 1,
                                slug: 1,
                                price: 1,
                                discount: 1,
                                stock: 1,
                                images: {
                                    $slice: [
                                        {
                                            $ifNull: [
                                                "$images",
                                                [],
                                            ],
                                        },
                                        1,
                                    ],
                                },
                                views: 1,
                            },
                        },
                    ],

                    total: [
                        {
                            $count:
                                "count",
                        },
                    ],
                },
            },
        ]);

    const data =
        result[0]?.data || [];

    const total =
        result[0]?.total?.[0]
            ?.count || 0;

    return {
        data,

        pagination: {
            page: safePage,
            limit: safeLimit,
            total,
            totalPages:
                Math.ceil(
                    total /
                    safeLimit
                ),
        },
    };
};

const getProductAnalytics =
    async (
        productId,
        range = "30days",
        from,
        to
    ) => {
        const product =
            await Product.findById(
                productId
            ).select(
                "name slug price discount stock images views"
            );

        if (!product) {
            throw new Error(
                "محصول پیدا نشد"
            );
        }

        const {
            start,
            end,
        } = getDateRange(
            range,
            from,
            to
        );

        const totalViews =
            await ProductView.countDocuments(
                {
                    productId,
                    viewedAt: {
                        $gte: start,
                        $lte: end,
                    },
                }
            );

        const daily =
            await ProductView.aggregate(
                [
                    {
                        $match: {
                            productId:
                                product._id,
                            viewedAt: {
                                $gte: start,
                                $lte: end,
                            },
                        },
                    },
                    {
                        $group: {
                            _id: {
                                $dateToString:
                                {
                                    format:
                                        "%Y-%m-%d",
                                    date: "$viewedAt",
                                    timezone:
                                        TIME_ZONE,
                                },
                            },
                            views: {
                                $sum: 1,
                            },
                        },
                    },
                    {
                        $sort: {
                            _id: 1,
                        },
                    },
                ]
            );

        return {
            product,

            summary: {
                totalViews,
                totalViewsAllTime:
                    product.views ||
                    0,
            },

            daily: daily.map(
                (item) => ({
                    date: item._id,
                    views: item.views,
                })
            ),
        };
    };



module.exports = {
    getSummary,
    getDailyViews,
    getHourlyViews,
    getTopProducts,
    getBottomProducts,
    getProductsAnalytics,
    getProductAnalytics,
};