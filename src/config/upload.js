const multer = require("multer");
const path = require("path");

// محل ذخیره فایل‌ها
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "src/uploads/products");
    },

    filename: (req, file, cb) => {
        const uniqueName =
            Date.now() + "-" + Math.round(Math.random() * 1e9);

        cb(
            null,
            uniqueName + path.extname(file.originalname)
        );
    },
});

const upload = multer({ storage });

module.exports = { upload };