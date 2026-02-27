const mongoose = require("mongoose");
const Category = require("./models/Category");

require("dotenv").config();

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
        name: "آبرسانی",
        slug: "abresani",
        children: [
            { name: "لوله و اتصالات", slug: "pipes" },
            { name: "پمپ آب", slug: "water-pump" },
            { name: "اتو لوله", slug: "pipe-iron" },
            { name: "پیستوله", slug: "pistool" },
            { name: "متعلقات تاسیسات", slug: "plumbing-tools" },
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
    {
        name: "قفل و یراق آلات",
        slug: "ghofl-va-yaragh",
        children: [
            { name: "جک آرام بند", slug: "jack-aramband" },
            { name: "دستگیره", slug: "dastgire" },
            { name: "ریل درب کشویی", slug: "rail-door" },
            { name: "سیلندر قفل", slug: "cylinder-lock" },
            { name: "قفل آویز", slug: "padlock" },
            { name: "قفل درب", slug: "door-lock" },
            { name: "قفل کتابی", slug: "book-lock" },
            { name: "لولا", slug: "hinge" },
            { name: "قرقره درب لیلی", slug: "pulley" },
        ]
    },
    {
        name: "رنگ",
        slug: "rang",
        children: [
            { name: "اسپری رنگ", slug: "spray-paint" },
            { name: "پاک کننده نانو", slug: "nano-cleaner" },
            { name: "کاردک و لیسه", slug: "scraper" },
        ]
    },
    {
        name: "جوش-برش",
        slug: "joosh-borosh",
        children: [
            { name: "دستگاه جوش", slug: "welding-machine" },
            { name: "الکترود جوشکاری", slug: "welding-electrode" },
            { name: "اینورتر برش پلاسما", slug: "plasma-cutter" },
            { name: "برش ریلی", slug: "rail-cut" },
            { name: "تنگستن", slug: "tungsten" },
            { name: "متعلغات ابزارها جوش", slug: "welding-tools" },
        ]
    },
    {
        name: "تراشکاری",
        slug: "tarashkari",
        children: [
            { name: "دستگاه تراش", slug: "lathe-machine" },
            { name: "شنک", slug: "shank" },
            { name: "فرز فرم", slug: "form-mill" },
            { name: "فشنگی", slug: "feshangi" },
            { name: "قلاویز", slug: "tap-die" },
            { name: "متعلقات ابزار تراش", slug: "lathe-tools" },
        ]
    },
    {
        name: "صفحه سنگ فرز",
        slug: "safhe-sang-farz",
        children: [
            { name: "پوست بره", slug: "sheepskin" },
            { name: "سنباده", slug: "sandpaper" },
            { name: "سنگ سنباده", slug: "grinding-stone" },
            { name: "صفحه سنگ فرز", slug: "grinding-wheel" },
            { name: "فرچه سیمی", slug: "wire-brush" },
        ]
    },
    {
        name: "ایمنی",
        slug: "imeni",
        children: [
            { name: "جعبه کمک های اولیه", slug: "first-aid-kit" },
            { name: "چراغ پیشانی", slug: "headlamp" },
            { name: "چراغ قوه", slug: "flashlight" },
            { name: "دستکش کار", slug: "work-gloves" },
            { name: "شیلد صورت", slug: "face-shield" },
            { name: "عینک ایمنی", slug: "safety-glasses" },
            { name: "کلاه ایمنی", slug: "safety-helmet" },
            { name: "ماسک تنفسی", slug: "respirator" },
            { name: "ماسک جوشکاری", slug: "welding-mask" },
        ]
    },
    {
        name: "جرثقیل-لیفتینگ",
        slug: "jeraghil-lifting",
        children: [
            { name: "اسلب گیر", slug: "slab-grip" },
            { name: "بالانسر", slug: "balancer" },
            { name: "پولفیت", slug: "pulley-fit" },
            { name: "جک پالت", slug: "pallet-jack" },
            { name: "ریل جرثقیل", slug: "crane-rail" },
            { name: "لیفت مگنت", slug: "lift-magnet" },
        ]
    },
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