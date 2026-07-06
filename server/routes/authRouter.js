const express = require("express");
const { signup, login, verifyToken, user, me, updateProfile, changePassword, forgotPassword, verifyOtp, resetPassword, requestEmailUpdate, verifyEmailUpdate, suppressWarning } = require("../controllers/authController");
const authenticate = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/verifyToken", verifyToken);
router.get("/user", user);
router.get("/me", authenticate, me);
router.put("/updateProfile", authenticate, updateProfile);
router.put("/changePassword", authenticate, changePassword);

// Password Reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

// Email update routes
router.post("/request-email-update", requestEmailUpdate);
router.post("/verify-email-update", verifyEmailUpdate);

// AI Privacy Warning route
router.post("/suppress-warning", authenticate, suppressWarning);

module.exports = router;
