# 🔐 Production-Ready Validation System

Complete validation system with Zod, custom error handling, and reusable middleware.

## 📋 Table of Contents

1. [Validation Schemas](#validation-schemas)
2. [Validation Middleware](#validation-middleware)
3. [Error Handling](#error-handling)
4. [Implementation Examples](#implementation-examples)
5. [Testing Guide](#testing-guide)

---

## ✅ Validation Schemas

### Auth Validator (`src/validators/authValidator.js`)

#### Register Schema

```javascript
{
  name: string (3-50 chars, letters & spaces only),
  email: string (valid email format),
  password: string (8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char),
  role: enum["user", "admin"] (default: "user")
}
```

#### Login Schema

```javascript
{
  email: string (valid email format),
  password: string (required)
}
```

#### Update Profile Schema

```javascript
{
  name: string (3-50 chars, optional),
  email: string (valid email, optional),
  phone: string (10 digits, optional),
  address: string (5-200 chars, optional)
}
```

#### Change Password Schema

```javascript
{
  currentPassword: string (required),
  newPassword: string (8+ chars, uppercase, lowercase, number, special char),
  confirmPassword: string (must match newPassword)
}
```

### User Validator (`src/validators/userValidator.js`)

#### Create User Schema

```javascript
{
  name: string (3-50 chars),
  email: string (valid email),
  phone: string (10 digits, optional),
  address: string (5-200 chars, optional),
  role: enum["user", "admin"] (default: "user")
}
```

### Email OTP Validator (`src/validators/emailOtpValidator.js`)

#### Email OTP Schema

```javascript
{
  email: string (valid email format)
}
```

#### Verify OTP Schema

```javascript
{
  email: string (valid email),
  otp: string (exactly 6 digits)
}
```

### Uploads Validator (`src/validators/uploadsValidator.js`)

#### Upload File Schema

```javascript
{
  title: string (3-100 chars, optional),
  description: string (5-500 chars, optional),
  category: string (2+ chars, optional)
}
```

---

## 🛡️ Validation Middleware

### Available Middleware

#### 1. **validateRequestBody(schema)**

Validates request body against a Zod schema.

```javascript
router.post("/register", validateRequestBody(registerSchema), controller);
```

#### 2. **validateQueryParams(schema)**

Validates query parameters.

```javascript
router.get("/users", validateQueryParams(listUsersSchema), controller);
```

#### 3. **validatePathParams(schema)**

Validates URL path parameters.

```javascript
router.delete("/user/:id", validatePathParams(userIdSchema), controller);
```

---

## 🚨 Error Handling

### Global Error Handler

Centralized error handling in `src/utils/errorHandler.js`

### Error Response Format

```javascript
{
  success: false,
  message: "Error description",
  errors: [
    {
      field: "email",
      message: "Invalid email format"
    }
  ]
}
```

### Error Types Handled

- ✅ Zod Validation Errors (400)
- ✅ MongoDB Duplicate Key Errors (400)
- ✅ MongoDB Cast Errors (400)
- ✅ JWT Errors (401)
- ✅ Operational Errors (Custom status)
- ✅ Unknown Errors (500)

### AsyncHandler Wrapper

Automatically catches async errors and passes to global handler.

```javascript
const controller = asyncHandler(async (req, res) => {
  // All errors are caught automatically
  const user = await User.findById(req.params.id);
});
```

---

## 💻 Implementation Examples

### Step 1: Import Required Modules

```javascript
const express = require("express");
const router = express.Router();
const { validateRequestBody } = require("../middleware/validationMiddleware");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const { asyncHandler } = require("../utils/errorHandler");
const authController = require("../controller/authController");
```

### Step 2: Setup Routes with Validation

```javascript
// Register Route
router.post(
  "/register",
  validateRequestBody(registerSchema),
  asyncHandler(authController.register),
);

// Login Route
router.post(
  "/login",
  validateRequestBody(loginSchema),
  asyncHandler(authController.login),
);
```

### Step 3: Update Controller to Use Validated Data

```javascript
const register = asyncHandler(async (req, res) => {
  // Use req.validatedData instead of req.body
  const { name, email, password, role } = req.validatedData;

  // Check for existing user
  const existingUser = await authSchema.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  // Hash password and create user
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await authSchema.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { id: user._id, name: user.name, email: user.email },
  });
});
```

### Step 4: Complete Route File Example

```javascript
const express = require("express");
const router = express.Router();
const {
  validateRequestBody,
  validatePathParams,
} = require("../middleware/validationMiddleware");
const {
  registerSchema,
  loginSchema,
  updateProfileSchema,
} = require("../validators/authValidator");
const { asyncHandler } = require("../utils/errorHandler");
const { authenticate } = require("../middleware/authMiddleware");
const authController = require("../controller/authController");
const { z } = require("zod");

// Register
router.post(
  "/register",
  validateRequestBody(registerSchema),
  asyncHandler(authController.register),
);

// Login
router.post(
  "/login",
  validateRequestBody(loginSchema),
  asyncHandler(authController.login),
);

// Update Profile
router.put(
  "/profile",
  authenticate,
  validateRequestBody(updateProfileSchema),
  asyncHandler(authController.updateProfile),
);

// Delete User
const deleteUserSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
});

router.delete(
  "/user/:id",
  authenticate,
  validatePathParams(deleteUserSchema),
  asyncHandler(authController.deleteUser),
);

module.exports = router;
```

---

## 🧪 Testing Guide

### Using cURL

#### Valid Registration Request

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!",
    "role": "user"
  }'
```

**Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Invalid Registration (Validation Errors)

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ab",
    "email": "invalid-email",
    "password": "weak"
  }'
```

**Response:**

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "name",
      "message": "Name must be at least 3 characters long"
    },
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

#### Login Request

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

#### Update Profile with Query Validation

```bash
curl -X PUT http://localhost:3000/api/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Jane Doe",
    "phone": "9876543210"
  }'
```

---

## 📊 Validation Flow Diagram

```
Client Request
    ↓
Request Body Received
    ↓
Validation Middleware
    ├─ Parse data with Zod
    ├─ Check constraints
    └─ Custom error messages
    ↓
Validation Success?
    ├─ ✅ YES → Attach to req.validatedData → Controller
    └─ ❌ NO → Return 400 with error details
    ↓
Controller Execution
    ├─ Business Logic
    └─ Database Operations
    ↓
Error Occurs?
    ├─ ✅ NO → Send Success Response
    └─ ❌ YES → Global Error Handler
         ├─ Log Error
         ├─ Format Response
         └─ Send Error Response
```

---

## 🎯 Best Practices

### ✅ DO's

1. **Always wrap controllers with `asyncHandler`**

   ```javascript
   asyncHandler(authController.register);
   ```

2. **Use `req.validatedData` not `req.body`**

   ```javascript
   const { email } = req.validatedData;
   ```

3. **Define custom error messages in schemas**

   ```javascript
   email: z.string().email("Please provide a valid email");
   ```

4. **Reuse schemas across routes**

   ```javascript
   // Define once in validators/authValidator.js
   // Use in multiple route files
   ```

5. **Create specific schemas for each endpoint**
   ```javascript
   // Not: validateAll for everything
   // Yes: registerSchema, loginSchema, updateSchema
   ```

### ❌ DON'Ts

1. **Don't validate manually in controllers**

   ```javascript
   // ❌ WRONG
   if (!email) { ... }

   // ✅ CORRECT
   const { email } = req.validatedData;
   ```

2. **Don't use generic validation messages**

   ```javascript
   // ❌ email: z.string().email()
   // ✅ email: z.string().email("Valid email required")
   ```

3. **Don't forget asyncHandler on async controllers**
   ```javascript
   // ❌ register(authController.register)
   // ✅ asyncHandler(authController.register)
   ```

---

## 📝 Creating Custom Schemas

```javascript
const { z } = require("zod");

// Simple Schema
const simpleSchema = z.object({
  name: z.string().min(3, "Name too short"),
  email: z.string().email("Invalid email"),
});

// Schema with Custom Validation
const customSchema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Schema with .transform()
const transformSchema = z.object({
  email: z.string().email().toLowerCase(),
});

// Schema with .default()
const defaultSchema = z.object({
  role: z.enum(["user", "admin"]).default("user"),
});
```

---

## 🔧 Troubleshooting

### Issue: "req.validatedData is undefined"

**Solution:** Ensure validation middleware is before controller

```javascript
// ✅ Correct order
router.post(
  "/register",
  validateRequestBody(registerSchema), // First
  asyncHandler(controller), // Then
);
```

### Issue: "Validation errors not showing"

**Solution:** Check that globalErrorHandler is last in app.js

```javascript
// ✅ Must be last
app.use(globalErrorHandler);
```

### Issue: "Custom error messages not working"

**Solution:** Add error message as second argument

```javascript
// ✅ Correct
z.string().min(3, "Custom message");

// ❌ Wrong
z.string().min(3);
```

---

## 📚 Resource Links

- [Zod Documentation](https://zod.dev)
- [Express Error Handling](https://expressjs.com/en/guide/error-handling.html)
- [HTTP Status Codes](https://httpwg.org/specs/rfc7231.html#status.codes)

---

**Version:** 1.0.0  
**Last Updated:** 2024  
**Status:** Production Ready ✅
