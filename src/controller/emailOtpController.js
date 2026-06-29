const sendMail = require("../utils/sendMail");
const { OtpModel, generateOTP } = require("../model/emailOtpModel");

// Send OTP to email
const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate OTP
    const otp = generateOTP();

    // Delete previous OTP for this email if exists
    await OtpModel.deleteOne({ email: email });

    // Save new OTP to database
    const otpData = new OtpModel({
      email: email,
      otp: otp,
    });

    await otpData.save();

    // Send OTP via email
    await sendMail(
      email,
      "Your OTP for Email Verification",
      `Your OTP is: ${otp}. This OTP will expire in 5 minutes.`,
    );

    res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email",
      email: email,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message,
    });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // Find OTP in database
    const otpRecord = await OtpModel.findOne({ email: email, otp: otp });

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP or email",
      });
    }

    // Delete the OTP after successful verification
    await OtpModel.deleteOne({ email: email, otp: otp });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      email: email,
    });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
};

module.exports = { sendOtp, verifyOtp };
