const express = require("express");
const { signup, login, verifyToken, user, me, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword, requestEmailUpdate, verifyEmailUpdate } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verifyToken", verifyToken);
router.get("/user", user)
router.get("/me", me);
router.put("/updateProfile", updateProfile);
router.put("/changePassword", changePassword);

// Password recovery routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Email update routes
router.post("/request-email-update", requestEmailUpdate);
router.post("/verify-email-update", verifyEmailUpdate);

module.exports = router;
