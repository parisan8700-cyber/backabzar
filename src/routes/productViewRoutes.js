const express = require("express");

const router = express.Router();

const {
    recordProductView,
} = require("../controllers/productViewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, recordProductView);

module.exports = router;