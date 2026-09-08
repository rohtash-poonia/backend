const express = require("express");
const forgotPassword = require("../controller/forgetPassOtpController");
const resetPassword = require("../controller/resetPasswordController");

const router = express.Router();

router.post("/forgot-password", forgotPassword);

router.post("/reset-Password", resetPassword);

module.exports = router;
