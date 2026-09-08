# 🎯 Quick Reference Card - All Features at a Glance

**Laminate this or keep in tabs!**

---

## 📌 VALIDATION QUICK REFERENCE

### Common Schemas
```javascript
// Register
const { registerSchema } = require("../validators/authValidator");
// Fields: name (3-50, letters), email, password (8+ strong)

// Login  
const { loginSchema } = require("../validators/authValidator");
// Fields: email, password

// List Users with Pagination
const { listUsersSchema } = require("../validators/paginationValidator");
// Fields: page, limit, search, role, sortBy, sortOrder
```

### Usage Pattern
```javascript
router.post("/endpoint",
  validateRequestBody(registerSchema),  // Validates
  asyncHandler(controller)              // Executes
);
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [{"field": "email", "message": "Invalid email"}]
}
```

---

## 📊 PAGINATION QUICK REFERENCE

### Query Parameters
```
page=1                    (1-based, default: 1)
limit=10                  (1-100, default: 10)
sortBy=createdAt          (field name, default: createdAt)
sortOrder=desc            (asc or desc, default: desc)
search=term               (searches multiple fields)
role=admin                (field-specific filters vary)
minAmount=1000            (range filters vary)
maxAmount=5000
```

### Complete URL Example
```
/api/users?page=1&limit=10&search=john&role=admin&sortBy=name&sortOrder=asc
```

### Implementation Pattern
```javascript
router.get("/endpoint",
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, search, role, sortBy, sortOrder } = req.validatedQuery;
    
    const skip = (page - 1) * limit;
    const filter = { 
      ...(search && { $or: [{name: {$regex: search, $options: "i"}}] }),
      ...(role && { role })
    };
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };
    
    const data = await Model.find(filter).sort(sort).skip(skip).limit(limit);
    const total = await Model.countDocuments(filter);
    
    res.json({ success: true, ...formatListResponse(data, total, page, limit) });
  })
);
```

### Response Format
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

---

## 🧬 UTILITY FUNCTIONS CHEAT SHEET

```javascript
// Pagination
const skip = (page - 1) * limit;

// Sort
const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

// Search
const filter = {
  $or: [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } }
  ]
};

// Filter
const filter = { role: "admin", status: "active" };

// Combine
const finalFilter = { ...searchFilter, ...typeFilter };

// Format Response
const response = formatListResponse(data, total, page, limit);
```

---

## ⚡ VALIDATION FORMULAS

### Password Strength
```
✅ Required: 8+ chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
❌ Invalid: "pass", "password", "Password", "Password1"
✅ Valid: "SecurePass123!", "MyPass@456"
```

### Email
```
✅ Valid: "john@example.com", "user+tag@domain.co.uk"
❌ Invalid: "john@", "@example.com", "john..smith@example.com"
```

### Name
```
✅ Valid: "John Doe", "Jane Smith", "Abu Hassan"
❌ Invalid: "JD", "John123", "John_Smith"
```

### Phone
```
✅ Valid: "9876543210" (exactly 10 digits)
❌ Invalid: "987-654-3210", "123456789", "+919876543210"
```

### OTP
```
✅ Valid: "123456" (exactly 6 digits)
❌ Invalid: "12345", "1234567", "abcdef"
```

---

## 🔄 QUERY BUILDING STEPS

### Step 1: Calculate Skip
```javascript
const skip = (page - 1) * limit;
```

### Step 2: Build Filter
```javascript
const filter = {};
if (search) filter.$or = [...];
if (role) filter.role = role;
if (minPrice) filter.price = { $gte: minPrice };
```

### Step 3: Build Sort
```javascript
const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };
```

### Step 4: Execute Query
```javascript
const data = await Model.find(filter)
  .sort(sort)
  .skip(skip)
  .limit(limit);
const total = await Model.countDocuments(filter);
```

### Step 5: Format Response
```javascript
res.json({ success: true, ...formatListResponse(data, total, page, limit) });
```

---

## 🧪 TESTING WITH CURL

### Test Validation
```bash
# Valid
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"SecurePass123!"}'

# Invalid (will show errors)
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"ab","email":"invalid","password":"123"}'
```

### Test Pagination
```bash
# Page 1
curl "http://localhost:3000/api/users?page=1&limit=10"

# Page 2
curl "http://localhost:3000/api/users?page=2&limit=10"

# With search
curl "http://localhost:3000/api/users?page=1&limit=10&search=john"

# With filter
curl "http://localhost:3000/api/users?page=1&limit=10&role=admin"

# With sort
curl "http://localhost:3000/api/users?page=1&limit=10&sortBy=name&sortOrder=asc"

# All together
curl "http://localhost:3000/api/users?page=1&limit=10&search=john&role=admin&sortBy=name&sortOrder=asc"
```

---

## 📂 FILE QUICK REFERENCE

| Need | File | Function |
|------|------|----------|
| Register validation | authValidator.js | registerSchema |
| Login validation | authValidator.js | loginSchema |
| User CRUD | userValidator.js | create/update/delete |
| Email OTP | emailOtpValidator.js | emailOtpSchema |
| File upload | uploadsValidator.js | uploadFileSchema |
| List endpoint | paginationValidator.js | listUsersSchema |
| Validate request | validationMiddleware.js | validateRequestBody() |
| Validate params | validationMiddleware.js | validateQueryParams() |
| Handle errors | errorHandler.js | globalErrorHandler |
| Wrap async | errorHandler.js | asyncHandler() |
| Format response | paginationUtils.js | formatListResponse() |
| Build sort | paginationUtils.js | buildSortObject() |
| Build search | paginationUtils.js | buildSearchFilter() |

---

## ✅ COMMON MISTAKES & FIXES

| Mistake | Fix |
|---------|-----|
| `req.body` not validated | Use `req.validatedQuery` or `req.validatedData` |
| Async error not caught | Wrap with `asyncHandler()` |
| Sort not working | Use `1` for asc, `-1` for desc |
| Search returns nothing | Add `$options: "i"` for case-insensitive |
| Page 0 or negative limit | Add validation in schema |
| Too many results returned | Add `.limit()` to query |
| Query too slow | Add MongoDB indexes on filter/sort fields |
| Pagination metadata missing | Use `formatListResponse()` helper |

---

## 🚀 IMPLEMENTATION CHECKLIST

### Setup (5 min)
- [ ] Copy all files to project
- [ ] Ensure Zod is installed
- [ ] Update app.js with error handler
- [ ] Test one endpoint

### Basic Implementation (30 min)
- [ ] Implement validation in first route
- [ ] Implement pagination in list endpoint
- [ ] Test with cURL
- [ ] Check response format

### Full Implementation (2 hrs)
- [ ] Add validation to all routes
- [ ] Add pagination to all list endpoints
- [ ] Add filtering and search
- [ ] Add sorting
- [ ] Comprehensive testing

### Optimization (1 hr)
- [ ] Add MongoDB indexes
- [ ] Test with large datasets
- [ ] Performance tuning
- [ ] Cache implementation (if needed)

---

## 📊 PERFORMANCE TIPS

### Indexes to Add
```javascript
// In your model
schema.index({ email: 1 });
schema.index({ name: 1 });
schema.index({ role: 1 });
schema.index({ createdAt: -1 });
schema.index({ category: 1, status: 1, createdAt: -1 }); // Compound
```

### Query Optimization
```javascript
// Select specific fields
.select("id name email role")

// Lean for read-only
.lean()

// Avoid regex on large text
// Use text indexes instead

// Limit search fields
// Don't search all fields
```

---

## 🎓 RESOURCES

| Resource | Time | Best For |
|----------|------|----------|
| QUICK_START.md | 5 min | Getting started fast |
| QUICK_START_PAGINATION.md | 5 min | Pagination setup |
| VALIDATION_DOCUMENTATION.md | 30 min | Complete validation |
| PAGINATION_GUIDE.md | 30 min | Complete pagination |
| EXAMPLE_AUTH_ROUTE.js | 15 min | Copy ready code |
| EXAMPLE_PAGINATION_API.js | 15 min | Copy ready code |
| FEATURE_COMPARISON.md | 15 min | Feature overview |
| INDEX.md | 10 min | Finding files |

---

## 💡 KEY FORMULAS

### Pagination Skip
```javascript
skip = (page - 1) * limit
// Example: page=2, limit=10 → skip=10
```

### Total Pages
```javascript
totalPages = Math.ceil(total / limit)
// Example: total=150, limit=10 → pages=15
```

### Has Next Page
```javascript
hasNextPage = page < totalPages
// Example: page=1, totalPages=15 → true
```

### Has Previous Page
```javascript
hasPrevPage = page > 1
// Example: page=1 → false
// Example: page=2 → true
```

---

## 🎯 DECISION TREE

**Need to validate input?**
- Simple validation → Use Zod schema
- Complex rules → Combine schemas with `.refine()`
- Cross-field → Use `.refine()` for multiple fields

**Need to list data?**
- Simple list → Use `paginationSchema`
- With search → Use `listUsersSchema` etc
- Custom filters → Extend existing schema

**Need to sort data?**
- Default order → `createdAt: -1`
- By name → `name: 1`
- Multiple fields → `{ field1: 1, field2: -1 }`

**Need to search data?**
- Single field → `{ field: { $regex: term } }`
- Multiple fields → `{ $or: [{}, {}] }`
- Exact match → `{ field: value }`

**Need to filter data?**
- Exact → `{ field: value }`
- Range → `{ field: { $gte: min, $lte: max } }`
- Array → `{ field: { $in: [values] } }`

---

**Print This & Keep Handy!**

**Last Updated:** 2024
**Version:** 1.0.0
