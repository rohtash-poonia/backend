/**
 * EXAMPLE IMPLEMENTATION: Complete Auth Route with Validation
 * Copy this as template and customize for your needs
 */

const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ============ IMPORTS ============
const {
  validateRequestBody,
  validatePathParams,
} = require("../middleware/validationMiddleware");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgetPasswordSchema,
  resetPasswordSchema,
} = require("../validators/authValidator");
const { asyncHandler, AppError } = require("../utils/errorHandler");
const { authenticate } = require("../middleware/authMiddleware");
const authSchema = require("../model/authModel");
const { z } = require("zod");

// ============ REGISTER ENDPOINT ============
/**
 * POST /api/auth/register
 * Validates: name, email, password, role
 * Returns: User ID, name, email
 */
router.post(
  "/auth/register",
  validateRequestBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.validatedData;

    // Check if user already exists
    const existingUser = await authSchema.findOne({ email });
    if (existingUser) {
      throw new AppError("Email already registered", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await authSchema.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  }),
);

// ============ LOGIN ENDPOINT ============
/**
 * POST /api/auth/login
 * Validates: email, password
 * Returns: Access token, user data
 */
router.post(
  "/auth/login",
  validateRequestBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.validatedData;

    // Find user
    const user = await authSchema.findOne({ email });
    if (!user) {
      throw new AppError("Invalid email or password", 401);
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" },
    );

    res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  }),
);

// ============ GET PROFILE ENDPOINT ============
/**
 * GET /api/auth/profile
 * Requires: Authentication
 * Returns: User profile data
 */
router.get(
  "/auth/profile",
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await authSchema.findById(req.user.id).select("-password");

    if (!user) {
      throw new AppError("User not found", 404);
    }

    res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      data: user,
    });
  }),
);

// ============ UPDATE PROFILE ENDPOINT ============
/**
 * PUT /api/auth/profile
 * Validates: name, email, phone, address
 * Requires: Authentication
 * Returns: Updated user data
 */
router.put(
  "/auth/profile",
  authenticate,
  validateRequestBody(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const { name, email, phone, address } = req.validatedData;

    // Check if email is already taken (if updating)
    if (email) {
      const existingUser = await authSchema.findOne({
        email,
        _id: { $ne: req.user.id },
      });
      if (existingUser) {
        throw new AppError("Email already in use", 400);
      }
    }

    // Update user
    const updateData = { name, email, phone, address };
    Object.keys(updateData).forEach(
      (key) => updateData[key] === undefined && delete updateData[key],
    );

    const updatedUser = await authSchema
      .findByIdAndUpdate(req.user.id, updateData, {
        new: true,
        runValidators: true,
      })
      .select("-password");

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updatedUser,
    });
  }),
);

// ============ CHANGE PASSWORD ENDPOINT ============
/**
 * POST /api/auth/change-password
 * Validates: currentPassword, newPassword, confirmPassword
 * Requires: Authentication
 * Returns: Success message
 */
router.post(
  "/auth/change-password",
  authenticate,
  validateRequestBody(changePasswordSchema),
  asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.validatedData;

    // Find user
    const user = await authSchema.findById(req.user.id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );
    if (!isPasswordValid) {
      throw new AppError("Current password is incorrect", 401);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  }),
);

// ============ FORGET PASSWORD ENDPOINT ============
/**
 * POST /api/auth/forget-password
 * Validates: email
 * Returns: Reset token (in real app, send via email)
 */
router.post(
  "/auth/forget-password",
  validateRequestBody(forgetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { email } = req.validatedData;

    // Find user
    const user = await authSchema.findOne({ email });
    if (!user) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: "If email exists, reset link will be sent",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "15m" },
    );

    // In production: Save hashed token to database and send via email
    // For now, return token directly (ONLY FOR TESTING)

    res.status(200).json({
      success: true,
      message: "If email exists, reset link will be sent",
      // REMOVE THIS IN PRODUCTION
      resetToken: resetToken, // Remove this line in production
    });
  }),
);

// ============ RESET PASSWORD ENDPOINT ============
/**
 * POST /api/auth/reset-password
 * Validates: token, newPassword
 * Returns: Success message
 */
router.post(
  "/auth/reset-password",
  validateRequestBody(resetPasswordSchema),
  asyncHandler(async (req, res) => {
    const { token, newPassword } = req.validatedData;

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (error) {
      throw new AppError("Invalid or expired reset token", 401);
    }

    // Find user
    const user = await authSchema.findById(decoded.id);
    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  }),
);

// ============ DELETE ACCOUNT ENDPOINT ============
/**
 * DELETE /api/auth/account/:id
 * Validates: User ID in path
 * Requires: Authentication
 * Returns: Success message
 */
const deleteUserSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format"),
});

router.delete(
  "/auth/account/:id",
  authenticate,
  validatePathParams(deleteUserSchema),
  asyncHandler(async (req, res) => {
    // Ensure user can only delete their own account
    if (req.user.id !== req.validatedParams.id) {
      throw new AppError(
        "Unauthorized: Cannot delete another user's account",
        403,
      );
    }

    // Delete user
    await authSchema.findByIdAndDelete(req.user.id);

    res.status(200).json({
      success: true,
      message: "Account deleted successfully",
    });
  }),
);

// ============ LIST USERS ENDPOINT (Admin Only) ============
/**
 * GET /api/auth/users?page=1&limit=10&role=user
 * Validates: Query parameters
 * Requires: Authentication + Admin role
 * Returns: Paginated user list
 */
const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().optional().default(10),
  role: z.enum(["user", "admin"]).optional(),
});

const authorize = (allowedRoles) => {
  return asyncHandler((req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError("Forbidden: Insufficient permissions", 403);
    }
    next();
  });
};

router.get(
  "/auth/users",
  authenticate,
  authorize(["admin"]),
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, role } = req.validatedQuery;

    const query = role ? { role } : {};
    const skip = (page - 1) * limit;

    const users = await authSchema
      .find(query)
      .select("-password")
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 });

    const total = await authSchema.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  }),
);

module.exports = router;

// ============ TESTING WITH CURL ============
/*
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "user"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'

# Get Profile (replace TOKEN with actual token)
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TOKEN"

# Update Profile
curl -X PUT http://localhost:3000/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "name": "Jane Doe",
    "phone": "9876543210"
  }'

# Change Password
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer TOKEN" \
  -d '{
    "currentPassword": "SecurePass123!",
    "newPassword": "NewSecurePass456!",
    "confirmPassword": "NewSecurePass456!"
  }'

# Forget Password
curl -X POST http://localhost:3000/api/auth/forget-password \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com"
  }'

# Reset Password (use token from forget password)
curl -X POST http://localhost:3000/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{
    "token": "RESET_TOKEN",
    "newPassword": "ResetPass789!"
  }'

# List Users (Admin only)
curl -X GET "http://localhost:3000/api/auth/users?page=1&limit=10&role=user" \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Delete Account
curl -X DELETE http://localhost:3000/api/auth/account/USER_ID \
  -H "Authorization: Bearer TOKEN"
*/
