  const passwordOtpSchema = require("../model/forgetPassOtpModel");
  const otpGenerator = require("otp-generator");
  const sendMail = require("../utils/sendMail");
  const Users = require("../model/authModel");

  const forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "No account found with this email",
        });
      }

      const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
      });

      await passwordOtpSchema.deleteMany({ email });
      await passwordOtpSchema.create({ email, otp });

      await sendMail(email,"Password Reset OTP",`Your password reset OTP is ${otp}. It expires in 5 minutes.`,);
      
 
      return res.status(200).json({
        success: true,
        message: "Password reset OTP sent successfully",
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      });
    }
  };

  module.exports = forgotPassword;
