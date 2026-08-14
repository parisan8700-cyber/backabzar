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
        name: "ابزار های شارژی",
        slug: "sharji",
        children: [
            { name: "بکس", slug: "bax-shargji" },
            { name: "پیچ گوشتی", slug: "pich-goshti" },
            { name: "دریل", slug: "drill" },
            { name: "مینی فرز", slug: "mini-farz" },
            { name: "جت فن", slug: "jetfan" },
            { name: "اره", slug: "are-shargji" },
        ]
    },
    {
        name: "ابزار های برقی",
        slug: "barghi",
        children: [
            { name: "اره", slug: "are" },
            { name: "پولیش", slug: "polish" },
            { name: "اتو لوله", slug: "pipe-iron" },
            { name: "بکس", slug: "bax-barghi" },
            { name: "پمپ باد", slug: "pump-bad" },
            { name: "پمپ آب", slug: "pump-ab" },
            { name: "پیچ گوشتی برقی", slug: "pich-goshti-barghi" },
            { name: "دریل", slug: "drill-barghi" },
            { name: "سشوار", slug: "sshovar" },
            { name: "تخریب", slug: "takhrib" },
            { name: "فرز", slug: "farz" },
            { name: "مینی فرز", slug: "mini-farz-barghi" },
            { name: "پروفیل بر", slug: "profilbor" },
            { name: "بلور", slug: "blor" },
            { name: "پیستوله", slug: "pistole" },
            { name: "سنگ رو میزی", slug: "sangromizi" },
        ]
    },
    {
        name: "ابزار های دستی",
        slug: "abzar-dasti",
        children: [
            { name: "ابزارهای چندکاره", slug: "multi-tool" },
            { name: "انبر", slug: "anbar" },
            { name: "پتک", slug: "patak" },
            { name: "چکش", slug: "chakosh" },
            { name: "جعبه ابزار", slug: "tool-box" },
            { name: "کیف ابزار", slug: "tool-bag" },
            { name: "متر", slug: "metr" },
            { name: "نردبان", slug: "nardeban" },
            { name: "آلن", slug: "alen-dasti" },
            { name: "سیم چین", slug: "simchin" },
            { name: "متفرقه گاراژی", slug: "motefareg" },
        ]
    },
    {
        name: "ابزار های گاراژی",
        slug: "tamirgahi",
        children: [
            { name: "ابزار صافکاری", slug: "saqkari" },
            { name: "جعبه بکس و ست بکس", slug: "bax-set" },
            { name: "آچار", slug: "achar" },
            { name: "جک", slug: "jack" },
            { name: "آلن", slug: "alen" },
            { name: "بادپاش", slug: "badpash" },
            { name: "شیلنگ", slug: "shilang" },
            { name: "ابزار دستی", slug: "abzardasti" },
            { name: "بکس", slug: "box" },
            { name: "کاتر", slug: "kater" },
            { name: "سنگ رو میزی", slug: "sangromizi-tamir" },
            { name: "چکش", slug: "chakosh" },
        ]
    },
    {
        name: "ابزار های بادی",
        slug: "badi",
        children: [
            { name: "کمپرسور", slug: "compressor" },
            { name: "منگنه کوب", slug: "mangane" },
            { name: "بکس بادی", slug: "bax-badi" },
            { name: "میخکوب بادی", slug: "nailer" },
            { name: "دریل", slug: "drill-badi" },
            { name: "جغجغه", slug: "ratchet" },
            { name: "بادپاش", slug: "badpash-badi" },
            { name: "شیلنگ", slug: "shilang-badi" },
            { name: "چکش", slug: "chakosh-badi" },
        ]
    },
    {
        name: "ابزار های جوش و برش",
        slug: "joosh-va-boresh",
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
        name: "جرثقیل و ابزار لیفتینگ",
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
        name: "جک",
        slug: "jacks",
        children: [
            { name: "جک روغنی", slug: "hydraulic-jack" },
            { name: "جک سوسماری", slug: "trolley-jack" },
            { name: "جک بادی", slug: "air-jack" },
            { name: "جک گیربکسی", slug: "transmission-jack" },
            { name: "جک موتور", slug: "motor-jack" },
            { name: "جک صافکاری", slug: "body-repair-jack" },

        ]
    },
    {
        name: "اندازه گیری",
        slug: "andazegiri",
        children: [
            { name: "تراز لیزر", slug: "layzer" },
            { name: "متر لیزر", slug: "layzer-metr" },

        ]
    },
    {
        name: "کارواش",
        slug: "karvash",
        children: []
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

async function seedCategoryTree(categoryArray, parent = null, validSlugs = new Set()) {
    for (const cat of categoryArray) {
        const { name, slug, children = [] } = cat;

        validSlugs.add(slug);

        const category = await Category.findOneAndUpdate(
            { slug },
            {
                name,
                slug,
                parent,
            },
            {
                new: true,
                upsert: true,
                setDefaultsOnInsert: true,
            }
        );

        console.log(`✅ همگام شد: ${name}`);

        if (children.length) {
            await seedCategoryTree(children, category._id, validSlugs);
        }
    }

    return validSlugs;
}

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("✅ MongoDB connected");

        const validSlugs = await seedCategoryTree(categories);

        // حذف دسته‌هایی که دیگر داخل فایل وجود ندارند
        const result = await Category.deleteMany({
            slug: { $nin: [...validSlugs] },
        });

        console.log(`🗑️ ${result.deletedCount} دسته حذف شد`);

        console.log("✅ Category seed completed successfully");

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Seed error:", err);

        await mongoose.disconnect();
        process.exit(1);
    }
}

seed();