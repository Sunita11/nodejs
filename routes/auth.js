const express = require("express");
const { getUser, login, register } = require("../controllers/auth");
const { protect } = require("./../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.route("/user").get(protect, getUser);

module.exports = router;