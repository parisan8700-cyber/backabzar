const mongoose = require("mongoose");
const Category = require("./models/Category"); // مسیر درست به مدلت

require("dotenv").config(); // اگر از dotenv استفاده می‌کنی

// وصل شدن به دیتابیس
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("✅ MongoDB connected"))
    .catch(err => console.error("❌ MongoDB connection error:", err));

const categories = [
    {
        name: "برقی و شارژی",
        slug: "barghi-va-sharji",
        children: [
            { name: "اره", slug: "are" },
            { name: "بخارشوی", slug: "bokharshoy" },
            { name: "بکس برقی و شارژی", slug: "bax-barghi" },
            { name: "پمپ باد", slug: "pump-bad" },
            { name: "پیچ گوشتی برقی وشارژی", slug: "pich-goshti" },
            { name: "دریل", slug: "drill" },
            { name: "فرز", slug: "farz" },
            { name: "مته", slug: "mote" },
            { name: "مینی فرز", slug: "mini-farz" },
        ]
    },
    {
        name: "ابزار دستی",
        slug: "abzar-dasti",
        children: [
            { name: "ابزارهای چندکاره", slug: "multi-tool" },
            { name: "آچار", slug: "achar" },
            { name: "انبر", slug: "anbar" },
            { name: "پتک", slug: "patak" },
            { name: "چکش", slug: "chakosh" },
            { name: "جعبه ابزار", slug: "tool-box" },
            { name: "کیف ابزار", slug: "tool-bag" },
            { name: "متر", slug: "metr" },
            { name: "نردبان", slug: "nardeban" },
        ]
    },
    {
        name: "بادی",
        slug: "badi",
        children: [
            { name: "کمپرسور", slug: "compressor" },
            { name: "پیچ‌بکس", slug: "pich-bax" },
            { name: "اره", slug: "are-badi" },
            { name: "بکس", slug: "bax-badi" },
            { name: "پانچ", slug: "punch" },
            { name: "مینی فرز", slug: "mini-farz-badi" },
            { name: "میخکوب", slug: "nailer" },
            { name: "دریل", slug: "drill-badi" },
            { name: "پمپ وکیوم", slug: "vacuum-pump" },
            { name: "پولیش", slug: "polish" },
            { name: "جغجغه", slug: "ratchet" },
        ]
    },
    {
        name: "اندازه گیری",
        slug: "andaze-giri",
        children: [
            { name: "بادسنج", slug: "anemometer" },
            { name: "بروسکوپ", slug: "borescope" },
            { name: "پایه میکرومتر", slug: "micrometer-stand" },
            { name: "پرگار صنعتی", slug: "compass" },
            { name: "تاکومتر (دورسنج)", slug: "tachometer" },
            { name: "تراز صنعتی", slug: "level" },
            { name: "تراز لیزری", slug: "laser-level" },
            { name: "ترازو دیجیتال", slug: "digital-scale" },
            { name: "ترمومتر", slug: "thermometer" },
            { name: "چرخ متر", slug: "measuring-wheel" },
            { name: "خط کش", slug: "ruler" },
            { name: "شمارش گر دیجیتال", slug: "counter" },
            { name: "کولیس", slug: "caliper" },
            { name: "نیروسنج", slug: "dynamometer" },
        ]
    },
    {
        name: "تعمیرگاهی",
        slug: "tamirgahi",
        children: [
            { name: "آپارات و پنچر گیری", slug: "aparart" },
            { name: "ابزار خمکاری", slug: "khomkari" },
            { name: "ابزار صاقکاری", slug: "saqkari" },
            { name: "موتور برق", slug: "motor-bargh" },
            { name: "متعلقات دستی و گاراژی", slug: "garage-tools" },
            { name: "جعبه بکس و ست بکس", slug: "bax-set" },
        ]
    },
        {
        name: "آبرسانی",
        slug: "abresani",
        children: [
            { name: "لوله و اتصالات", slug: "pipes" },
            { name: "پمپ آب", slug: "water-pump" },
            { name: "اتو لوله", slug: "pipe-iron" },
            { name: "پیستوله", slug: "pistool" },
            { name: "سنباده", slug: "sandpaper" },
            { name: "متعلقات تاسیسات", slug: "plumbing-tools" },
        ]
    },
    {
        name: "کشاورزی",
        slug: "keshavarzi",
        children: [
            { name: "آبپاش", slug: "sprinkler" },
            { name: "پمپ سمپاش", slug: "sprayer-pump" },
            { name: "تبر", slug: "axe" },
            { name: "چاقو باغبانی", slug: "garden-knife" },
            { name: "چمن زن", slug: "lawn-mower" },
            { name: "شلنگ", slug: "hose" },
            { name: "شمشاد زن", slug: "hedge-trimmer" },
        ]
    },
    // میتونی بقیه دسته‌ها رو هم به همین شکل اضافه کنی
    {
        name: "جدید",
        slug: "jadid",
        children: []
    },
    {
        name: "اقساطی",
        slug: "aghsati",
        children: []
    },
    {
        name: "پرفروش",
        slug: "porforoush",
        children: []
    }
];

async function seedCategoryTree(categoryArray, parent = null) {
    for (const cat of categoryArray) {
        const { name, slug, children } = cat;

        const newCategory = new Category({
            name,
            slug,
            parent,
        });
        const saved = await newCategory.save();

        if (children && children.length > 0) {
            await seedCategoryTree(children, saved._id);
        }
    }
}

async function seed() {
    try {
        await Category.deleteMany(); // پاک کردن قبلی‌ها فقط یک بار
        await seedCategoryTree(categories);
        console.log("✅ All categories and subcategories seeded!");
        process.exit();
    } catch (err) {
        console.error("❌ Seed error:", err);
        process.exit(1);
    }
}

seed();