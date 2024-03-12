const express = require("express");
const {
  getUser,
  login,
  register,
  forgotPassword,
  resetPassword,
  updateDetails,
  updatePassword
} = require("../controllers/auth");
const { protect } = require("./../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.route("/user").get(protect, getUser);
router.post("/forgotpassword", forgotPassword);
router.route("/resetPassword/:resettoken").put(resetPassword);
router.route("/updatedetails").put(protect, updateDetails);
router.route("/updatepassword").put(protect, updatePassword);

module.exports = router;
