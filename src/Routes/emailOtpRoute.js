const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp } = require("../controller/emailOtpController");

// Send OTP to email
router.post("/send-otp", sendOtp);

// Verify OTP
router.post("/verify-otp", verifyOtp);

module.exports = router;
