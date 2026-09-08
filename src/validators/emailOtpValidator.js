const { z } = require("zod");

// ============ EMAIL OTP VALIDATION ============
const emailOtpSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
});

// ============ VERIFY OTP VALIDATION ============
const verifyOtpSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
  otp: z.string().regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits"),
});

// ============ RESEND OTP VALIDATION ============
const resendOtpSchema = z.object({
  email: z.string().email("Invalid email format").toLowerCase(),
});

module.exports = {
  emailOtpSchema,
  verifyOtpSchema,
  resendOtpSchema,
};
