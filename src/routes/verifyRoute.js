const express = require("express");
const router = express.Router();
const { verifyPayment } = require("../controllers/verifyController");

router.post("/verify", verifyPayment);

module.exports = router;
