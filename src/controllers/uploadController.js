exports.uploadImage = (req, res) => {
    try {
        const imageUrl = req.file?.path || req.file?.secure_url;

        if (!imageUrl) {
            return res.status(500).json({ message: "URL تصویر یافت نشد" });
        }

        res.status(200).json({
            message: "عکس با موفقیت آپلود شد",
            imageUrl,
        });
    } catch (err) {
        console.error("خطا در آپلود:", err);
        res.status(500).json({ message: "آپلود با خطا مواجه شد" });
    }
};
