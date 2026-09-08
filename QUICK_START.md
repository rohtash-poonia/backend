# 🚀 Quick Start Guide - Validation System

## 5-Minute Setup

### Step 1: Verify Zod is Installed

```bash
npm install zod
```

### Step 2: Use in Your Routes

Copy this template and customize:

```javascript
// routes/authRoute.js
const express = require("express");
const router = express.Router();
const { validateRequestBody } = require("../middleware/validationMiddleware");
const { registerSchema, loginSchema } = require("../validators/authValidator");
const { asyncHandler } = require("../utils/errorHandler");
const authController = require("../controller/authController");

// Register with validation
router.post(
  "/register",
  validateRequestBody(registerSchema),
  asyncHandler(authController.register),
);

// Login with validation
router.post(
  "/login",
  validateRequestBody(loginSchema),
  asyncHandler(authController.login),
);

module.exports = router;
```

### Step 3: Update Your Controller

```javascript
// controller/authController.js
const { asyncHandler } = require("../utils/errorHandler");
const bcrypt = require("bcrypt");

const register = asyncHandler(async (req, res) => {
  // Data is already validated!
  const { name, email, password, role } = req.validatedData;

  // Your business logic here
  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await authSchema.create({
    name,
    email,
    password: hashedPassword,
    role,
  });

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: { id: newUser._id, name, email },
  });
});

module.exports = { register };
```

### Step 4: Verify app.js Has Error Handler

```javascript
const { globalErrorHandler } = require("./src/utils/errorHandler");

// ... your middleware and routes ...

// MUST be last!
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Available Files

| File                                     | Purpose                              |
| ---------------------------------------- | ------------------------------------ |
| `src/validators/authValidator.js`        | Auth schemas (register, login, etc.) |
| `src/validators/userValidator.js`        | User management schemas              |
| `src/validators/emailOtpValidator.js`    | Email OTP schemas                    |
| `src/validators/uploadsValidator.js`     | File upload schemas                  |
| `src/middleware/validationMiddleware.js` | Validation middleware functions      |
| `src/utils/errorHandler.js`              | Global error handling                |
| `VALIDATION_DOCUMENTATION.md`            | Complete documentation               |
| `EXAMPLE_AUTH_ROUTE.js`                  | Complete working example             |

---

## Common Validation Schemas

### Register

```javascript
router.post(
  "/register",
  validateRequestBody(registerSchema),
  asyncHandler(controller),
);
```

Requirements: name (3-50 chars), email (valid), password (8+ chars with uppercase, lowercase, number, special char)

### Login

```javascript
router.post(
  "/login",
  validateRequestBody(loginSchema),
  asyncHandler(controller),
);
```

Requirements: email (valid), password (required)

### Update Profile

```javascript
router.put(
  "/profile",
  authenticate,
  validateRequestBody(updateProfileSchema),
  asyncHandler(controller),
);
```

Optional: name, email, phone (10 digits), address

---

## Error Response Examples

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
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

### Duplicate Email Error

```json
{
  "success": false,
  "message": "email already exists",
  "errors": [
    {
      "field": "email",
      "message": "email must be unique"
    }
  ]
}
```

### JWT Error

```json
{
  "success": false,
  "message": "Invalid token"
}
```

---

## Testing with cURL

### Valid Request

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }'
```

### Invalid Request (triggers validation)

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "ab",
    "email": "invalid",
    "password": "123"
  }'
```

---

## Most Important Rules

1. **Always wrap async controllers**

   ```javascript
   asyncHandler(controller) ✅
   controller ❌
   ```

2. **Use validated data**

   ```javascript
   req.validatedData ✅
   req.body ❌
   ```

3. **Validation before controller**

   ```javascript
   validateRequestBody(schema),  // First
   asyncHandler(controller)       // Then
   ✅
   ```

4. **Error handler must be last**
   ```javascript
   app.use(globalErrorHandler); // Last middleware
   ✅
   ```

---

## Troubleshooting

**Q: Getting undefined error?**  
A: Wrap controller with `asyncHandler()`

**Q: Validation not working?**  
A: Check middleware order - validation must come before controller

**Q: Can't find validatedData?**  
A: Use `req.validatedData` not `req.body`

**Q: Validation errors not returned?**  
A: Ensure `app.use(globalErrorHandler)` is in app.js as last middleware

---

## Next Steps

1. Check `VALIDATION_DOCUMENTATION.md` for complete reference
2. Review `EXAMPLE_AUTH_ROUTE.js` for full implementation
3. Implement validation in your routes
4. Test with cURL commands
5. Handle database errors with global error handler

---

**Need Help?**

- Read `VALIDATION_DOCUMENTATION.md` for detailed docs
- Copy `EXAMPLE_AUTH_ROUTE.js` for reference implementation
- Check error responses to debug issues

**Status: Ready for Production ✅**
