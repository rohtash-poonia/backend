/\*\*

- EXAMPLE: Usage Guide for Validation System
- Copy this implementation pattern to your routes
  \*/

// ============ EXAMPLE 1: REGISTER ROUTE WITH VALIDATION ============
const express = require("express");
const router = express.Router();
const { validateRequestBody } = require("../middleware/validationMiddleware");
const { registerSchema } = require("../validators/authValidator");
const { asyncHandler } = require("../utils/errorHandler");
const authController = require("../controller/authController");

// Before: app.post("/register", authController.register);
// After:
router.post(
"/register",
validateRequestBody(registerSchema),
asyncHandler(authController.register)
);

// ============ EXAMPLE 2: UPDATED AUTH CONTROLLER ============
// Update your authController.js like this:

const register = asyncHandler(async (req, res) => {
// req.validatedData contains the validated and sanitized data
const { name, email, password, role } = req.validatedData;

// No need to check if fields exist - validation middleware handles that
const existingUser = await authSchema.findOne({ email });
if (existingUser) {
return res.status(400).json({
success: false,
message: "Email already registered",
});
}

const hashedPassword = await bcrypt.hash(password, 10);
const registerUser = await authSchema.create({
name,
email,
password: hashedPassword,
role,
});

res.status(201).json({
success: true,
message: "User registered successfully",
data: {
id: registerUser.\_id,
name: registerUser.name,
email: registerUser.email,
},
});
});

// ============ EXAMPLE 3: LOGIN ROUTE WITH VALIDATION ============
const { loginSchema } = require("../validators/authValidator");

router.post(
"/login",
validateRequestBody(loginSchema),
asyncHandler(authController.login)
);

// ============ EXAMPLE 4: UPDATE PROFILE WITH VALIDATION ============
const { updateProfileSchema } = require("../validators/authValidator");

router.put(
"/profile/update",
authenticate, // your auth middleware
validateRequestBody(updateProfileSchema),
asyncHandler(authController.updateProfile)
);

// ============ EXAMPLE 5: DELETE USER WITH PATH PARAM VALIDATION ============
const { validatePathParams } = require("../middleware/validationMiddleware");
const { z } = require("zod");

const userIdSchema = z.object({
id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

router.delete(
"/user/:id",
authenticate,
validatePathParams(userIdSchema),
asyncHandler(authController.deleteUser)
);

// ============ EXAMPLE 6: QUERY PARAM VALIDATION ============
const { validateQueryParams } = require("../middleware/validationMiddleware");

const listUsersSchema = z.object({
page: z.coerce.number().int().positive().optional().default(1),
limit: z.coerce.number().int().positive().optional().default(10),
role: z.enum(["user", "admin"]).optional(),
});

router.get(
"/users",
authenticate,
validateQueryParams(listUsersSchema),
asyncHandler(authController.listUsers)
);

// ============ BEST PRACTICES ============
/\*

1. ALWAYS wrap controllers with asyncHandler:
   ✅ asyncHandler(authController.register)
   ❌ authController.register

2. Use req.validatedData (not req.body):
   ✅ const { name, email } = req.validatedData;
   ❌ const { name, email } = req.body;

3. Validation middleware placement:
   validateRequestBody → Other middleware → Controller
4. Custom error messages in validators:
   Use .min(), .max(), .regex() with descriptive messages
5. Reusable schemas across routes:
   Define in validators/ folder, import in routes

6. Testing validation:
   curl -X POST http://localhost:3000/api/register \
    -H "Content-Type: application/json" \
    -d '{"name": "ab", "email": "invalid", "password": "123"}'
   Response will show all validation errors
   \*/

module.exports = router;
