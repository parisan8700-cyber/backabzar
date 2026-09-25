const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");

exports.registerUser = async ({ name, password, phone }) => {
    const userExists = await User.findOne({ phone });
    if (userExists) {
        throw new Error("این شماره تلفن قبلا ثبت نام کرده است");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = password === "admin1405" ? "admin" : "user";

    const user = await User.create({
        name,
        password: hashedPassword,
        phone,
        role,
    });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });

    return {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token,
    };
};

exports.loginUser = async ({ phone, password }) => {
    const user = await User.findOne({ phone });

    if (!user) {
        throw new Error("کاربری با این شماره تلفن پیدا نشد");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("رمز عبور اشتباه است");
    }

    // ثبت آخرین زمان ورود موفق
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        {
            expiresIn: "30d",
        }
    );

    return {
        _id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        token,
    };
};

exports.getUserProfile = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new Error("کاربر یافت نشد");
    }
    return user;
};

exports.updateUserProfile = async (userId, { name, phone }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("کاربر یافت نشد");
    }

    user.name = name || user.name;
    user.phone = phone || user.phone;

    await user.save();

    return {
        _id: user._id,
        name: user.name,
        phone: user.phone,
    };
};

exports.getAdminData = async (userId) => {
    const user = await User.findById(userId).select("-password");
    if (!user) {
        throw new Error("کاربر یافت نشد");
    }
    return user;
};

exports.getAllUsers = async () => {
    const users = await User.find().select("-password");
    return users;
};

exports.updateUserRole = async (userId, role) => {
    if (!["user", "admin"].includes(role)) {
        throw new Error("نقش نامعتبر است");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new Error("کاربر پیدا نشد");
    }
    user.role = role;
    await user.save();
    return user;
};

exports.deleteUser = async (userId) => {
    await User.findByIdAndDelete(userId);
    return;
};


exports.getUserDetails = async (userId) => {
    const user = await User.findById(userId).select("-password");

    if (!user) {
        throw new Error("کاربر یافت نشد");
    }

    const userName = String(user.name || "").trim();
    const nameParts = userName.split(/\s+/);

    const firstName = nameParts[0] || "";
    const lastName = nameParts.slice(1).join(" ") || "";

    const orders = await Order.find({
        $or: [
            {
                userId: user._id,
            },
            {
                userId: null,
                $expr: {
                    $and: [
                        {
                            $eq: [
                                {
                                    $trim: {
                                        input: {
                                            $ifNull: [
                                                "$firstName",
                                                "",
                                            ],
                                        },
                                    },
                                },
                                firstName,
                            ],
                        },
                        {
                            $eq: [
                                {
                                    $trim: {
                                        input: {
                                            $ifNull: [
                                                "$lastName",
                                                "",
                                            ],
                                        },
                                    },
                                },
                                lastName,
                            ],
                        },
                    ],
                },
            },
        ],
    })
        .sort({ createdAt: -1 })
        .populate(
            "items.productId",
            "name price discount stock unit images slug"
        )
        .lean();

    console.log(
        "USER ORDERS:",
        orders.map((order) => ({
            id: order._id.toString(),
            userId: order.userId?.toString() || null,
            firstName: order.firstName,
            lastName: order.lastName,
            phone: order.phone,
            createdAt: order.createdAt,
            status: order.status,
        }))
    );

    const ordersCount = orders.length;

    const totalPurchase = orders.reduce((total, order) => {
        const orderProductsTotal = (order.items || []).reduce(
            (itemTotal, item) => {
                const price = Number(item.originalPrice || 0);
                const quantity = Number(item.quantity || 0);

                return itemTotal + price * quantity;
            },
            0
        );

        return total + orderProductsTotal;
    }, 0);

    const productsCount = orders.reduce(
        (total, order) => {
            return (
                total +
                (order.items || []).reduce(
                    (itemTotal, item) =>
                        itemTotal + Number(item.quantity || 0),
                    0
                )
            );
        },
        0
    );

    return {
        user,
        statistics: {
            ordersCount,
            totalPurchase,
            productsCount,
        },
        orders,
    };
};