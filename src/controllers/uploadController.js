exports.uploadImage = (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "هیچ عکسی ارسال نشده است",
            });
        }

        const baseUrl = process.env.BACKEND_URL;

        res.status(200).json({
            message: "عکس با موفقیت آپلود شد",
            imageUrl: `${baseUrl}/uploads/products/${req.file.filename}`,
        });

    } catch (err) {
        console.error("خطا در آپلود:", err);

        res.status(500).json({
            message: "آپلود با خطا مواجه شد",
        });
    }
};
