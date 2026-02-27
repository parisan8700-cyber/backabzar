const express = require("express");
const router = express.Router();
const {getCategories , getCategoryTree } = require("../controllers/categoryController");

router.get("/", getCategories);
router.get("/tree", getCategoryTree);

module.exports = router;