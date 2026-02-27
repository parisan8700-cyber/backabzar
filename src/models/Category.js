const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }, // فارسی برای نمایش

    slug: {
        type: String,
        required: true,
        unique: true
    }, // برای URL

    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    }, // برای ساختار درختی

}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema);