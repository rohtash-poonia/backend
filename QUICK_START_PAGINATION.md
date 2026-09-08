# 🚀 Quick Start: Pagination, Filtering, Sorting & Searching

**5-Minute Setup Guide**

---

## 📦 Files Created

1. ✅ `src/validators/paginationValidator.js` - Query parameter schemas
2. ✅ `src/utils/paginationUtils.js` - Utility functions
3. ✅ `src/middleware/paginationMiddleware.js` - Pagination middleware
4. ✅ `PAGINATION_GUIDE.md` - Complete documentation
5. ✅ `EXAMPLE_PAGINATION_API.js` - 10 complete examples

---

## 🔧 Basic Implementation (Copy & Use)

### Step 1: Simple User List with Pagination
```javascript
const { validateQueryParams } = require("../middleware/validationMiddleware");
const { listUsersSchema } = require("../validators/paginationValidator");
const { formatListResponse } = require("../utils/paginationUtils");
const { asyncHandler } = require("../utils/errorHandler");

router.get(
  "/users",
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder } = req.validatedQuery;

    // Calculate skip
    const skip = (page - 1) * limit;

    // Build sort
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // Fetch data
    const users = await User.find()
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    // Return formatted response
    res.json({
      success: true,
      ...formatListResponse(users, total, page, limit)
    });
  })
);
```

---

## 📊 Query Parameters

### Pagination Parameters
```
page: 1 (default)
limit: 10 (default)
sortBy: createdAt (default)
sortOrder: desc (default) | asc
```

### Additional Parameters (per endpoint)
```
search: "search term"
role: "admin" | "user"
category: "category name"
status: "active" | "inactive"
minAmount: 1000
maxAmount: 5000
```

---

## 🎯 Common Use Cases

### 1️⃣ Simple Pagination
```
GET /api/users?page=1&limit=10
```

### 2️⃣ Pagination + Search
```
GET /api/users?page=1&limit=10&search=john
```

### 3️⃣ Pagination + Filter
```
GET /api/users?page=1&limit=10&role=admin
```

### 4️⃣ Pagination + Sort
```
GET /api/users?page=1&limit=10&sortBy=name&sortOrder=asc
```

### 5️⃣ All Features Combined
```
GET /api/users?page=1&limit=10&search=john&role=admin&sortBy=name&sortOrder=asc
```

### 6️⃣ Range Filtering
```
GET /api/orders?page=1&limit=10&minAmount=1000&maxAmount=5000&status=completed
```

---

## 📄 Response Format

```json
{
  "success": true,
  "data": [
    { "id": 1, "name": "John", "email": "john@example.com" },
    { "id": 2, "name": "Jane", "email": "jane@example.com" }
  ],
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

## 🛠️ Key Utility Functions

### Build Pagination
```javascript
const skip = (page - 1) * limit;
```

### Build Sort
```javascript
const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };
```

### Build Search Filter
```javascript
if (search) {
  filter.$or = [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } }
  ];
}
```

### Combine Filters
```javascript
const filter = { ...searchFilter, ...roleFilter, ...statusFilter };
```

### Format Response
```javascript
const response = formatListResponse(data, total, page, limit);
```

---

## 💻 Complete Working Example

```javascript
router.get(
  "/products",
  validateQueryParams(listPostsSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, search, category, status, sortBy, sortOrder } = req.validatedQuery;

    // 1. Pagination
    const skip = (page - 1) * limit;

    // 2. Build filter
    const filter = {};

    // 3. Search
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    // 4. Filters
    if (category) filter.category = category;
    if (status) filter.status = status;

    // 5. Sort
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // 6. Execute query
    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    // 7. Return response
    res.json({
      success: true,
      message: "Products fetched",
      ...formatListResponse(products, total, page, limit)
    });
  })
);
```

---

## ✅ Testing with cURL

```bash
# Simple pagination
curl "http://localhost:3000/api/users?page=1&limit=10"

# With search
curl "http://localhost:3000/api/users?page=1&limit=10&search=john"

# With filter
curl "http://localhost:3000/api/users?page=1&limit=10&role=admin"

# With sort
curl "http://localhost:3000/api/users?page=1&limit=10&sortBy=name&sortOrder=asc"

# All together
curl "http://localhost:3000/api/users?page=1&limit=10&search=john&role=admin&sortBy=name&sortOrder=asc"

# Products with price range
curl "http://localhost:3000/api/products?page=1&limit=20&minPrice=100&maxPrice=5000&category=electronics"
```

---

## 🎓 Learning Path

1. **Read:** This Quick Start (5 min)
2. **Study:** `PAGINATION_GUIDE.md` (15 min)
3. **Copy:** Example from `EXAMPLE_PAGINATION_API.js` (5 min)
4. **Test:** With cURL commands (5 min)
5. **Implement:** In your routes (10 min)

---

## 📋 Validators Available

```javascript
// Import validators
const {
  paginationSchema,        // Basic pagination
  listUsersSchema,         // Users with search & filters
  genericListSchema,       // Generic pagination
  listPostsSchema,         // Posts with filters
  listFilesSchema,         // Files with search
  listOrdersSchema,        // Orders with range filters
  advancedSearchSchema     // Advanced search
} = require("../validators/paginationValidator");
```

---

## 🔌 Middleware Usage

```javascript
const { validateQueryParams } = require("../middleware/validationMiddleware");

router.get(
  "/endpoint",
  validateQueryParams(listUsersSchema),  // Validates query params
  asyncHandler(controller)                // Your controller
);
```

---

## 🐛 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| "validatedQuery is undefined" | Add `validateQueryParams` middleware before controller |
| "Page not working" | Use formula: `skip = (page - 1) * limit` |
| "Search returns nothing" | Add `$options: "i"` for case-insensitive search |
| "Sort not working" | Use `1` for ascending, `-1` for descending |
| "Too slow queries" | Add MongoDB indexes on filtered/sorted fields |
| "Limit not respected" | Ensure `.limit(limit)` is in query chain |

---

## 🚀 Performance Tips

### 1. Add Indexes
```javascript
// In your model
userSchema.index({ email: 1 });
userSchema.index({ name: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ category: 1, status: 1 });
```

### 2. Select Only Needed Fields
```javascript
const users = await User.find(filter)
  .select("name email role")  // Only these fields
  .skip(skip)
  .limit(limit);
```

### 3. Cache Total Count
```javascript
// For large datasets, cache the count
const cacheKey = `users:count:${JSON.stringify(filter)}`;
let total = cache.get(cacheKey);

if (!total) {
  total = await User.countDocuments(filter);
  cache.set(cacheKey, total, 300); // 5 min
}
```

---

## 🎯 Next Steps

1. ✅ Copy one example from `EXAMPLE_PAGINATION_API.js`
2. ✅ Update your route file
3. ✅ Test with cURL
4. ✅ Check response format matches
5. ✅ Add MongoDB indexes
6. ✅ Refer to `PAGINATION_GUIDE.md` for advanced features

---

## 📚 Files Reference

| File | Use For |
|------|---------|
| `src/validators/paginationValidator.js` | Validating query parameters |
| `src/utils/paginationUtils.js` | Helper functions |
| `PAGINATION_GUIDE.md` | Complete documentation |
| `EXAMPLE_PAGINATION_API.js` | Copy ready-to-use examples |
| `QUICK_START_PAGINATION.md` | This file - quick reference |

---

**Status: Ready to Use ✅**

Copy `EXAMPLE_PAGINATION_API.js` routes and customize for your endpoints!
