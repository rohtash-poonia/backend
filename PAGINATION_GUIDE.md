# 📊 Pagination, Filtering, Sorting & Searching Guide

Complete guide for building production-ready listing APIs with pagination, advanced filtering, searching, and sorting.

## 📋 Table of Contents
1. [Basic Pagination](#basic-pagination)
2. [Searching](#searching)
3. [Filtering](#filtering)
4. [Sorting](#sorting)
5. [Combined Features](#combined-features)
6. [Utility Functions](#utility-functions)
7. [MongoDB Query Building](#mongodb-query-building)
8. [Complete Examples](#complete-examples)
9. [API Response Format](#api-response-format)
10. [Testing Guide](#testing-guide)

---

## ✅ Basic Pagination

### Concept
Pagination divides data into pages to improve performance and user experience.

**Formula:** `skip = (page - 1) * limit`

### Query Parameters
```
page: 1 (default)
limit: 10 (default, max 100)
```

### Simple Example
```javascript
const skip = (page - 1) * limit;

const users = await User.find()
  .skip(skip)
  .limit(limit);

const total = await User.countDocuments();
const totalPages = Math.ceil(total / limit);
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

## 🔍 Searching

### Concept
Search filters data by matching text patterns across specified fields.

### Using $regex (Case-insensitive)
```javascript
const search = "john";
const filter = {
  $or: [
    { name: { $regex: search, $options: "i" } },
    { email: { $regex: search, $options: "i" } }
  ]
};

const users = await User.find(filter);
```

### Search Configuration
```javascript
const searchFields = ["name", "email", "phone"];
const searchTerm = "john";

const buildSearchFilter = (term, fields) => {
  if (!term || fields.length === 0) return {};
  
  const regex = new RegExp(term, "i");
  return {
    $or: fields.map(field => ({
      [field]: { $regex: regex }
    }))
  };
};

const filter = buildSearchFilter(searchTerm, searchFields);
```

### Query Example
```
GET /api/users?search=john&searchFields=name,email
```

---

## 🏷️ Filtering

### Exact Match Filter
```javascript
const filter = {};

if (role) filter.role = role;
if (status) filter.status = status;

const users = await User.find(filter);
```

### Range Filters (Min/Max)
```javascript
const filter = {};

// Amount range
if (minAmount || maxAmount) {
  filter.amount = {};
  if (minAmount) filter.amount.$gte = minAmount;
  if (maxAmount) filter.amount.$lte = maxAmount;
}

const orders = await Order.find(filter);
```

### Array Filters ($in, $nin)
```javascript
// Find users with specific roles
const filter = { role: { $in: ["admin", "moderator"] } };

// Find posts not with certain tags
const filter2 = { tags: { $nin: ["spam", "adult"] } };
```

### Multiple Filter Combination
```javascript
const filter = {
  status: "active",
  category: "tech",
  createdAt: { $gte: new Date("2024-01-01") }
};

const posts = await Post.find(filter);
```

---

## ⬆️⬇️ Sorting

### Single Field Sort
```javascript
// Ascending
const sort = { name: 1 };

// Descending
const sort = { createdAt: -1 };

const users = await User.find().sort(sort);
```

### Multiple Field Sort
```javascript
const sort = {
  category: 1,      // First sort by category ascending
  createdAt: -1     // Then by date descending
};

const posts = await Post.find().sort(sort);
```

### Sort Order Conversion
```javascript
const sortBy = "name";
const sortOrder = "asc"; // or "desc"

const sortValue = sortOrder === "asc" ? 1 : -1;
const sort = { [sortBy]: sortValue };
```

### Valid Sort Fields (Security)
```javascript
const allowedSortFields = ["name", "email", "createdAt", "updatedAt"];

if (!allowedSortFields.includes(sortBy)) {
  throw new Error("Invalid sort field");
}
```

---

## 🔗 Combined Features

### Pagination + Search + Filter + Sort
```javascript
router.get("/posts", async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search, 
    category, 
    status, 
    sortBy = "createdAt",
    sortOrder = "desc"
  } = req.query;

  // 1. Calculate pagination
  const skip = (page - 1) * limit;

  // 2. Build search filter
  const filter = {};
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
  }

  // 3. Add other filters
  if (category) filter.category = category;
  if (status) filter.status = status;

  // 4. Build sort
  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  // 5. Execute query
  const data = await Post.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(filter);

  res.json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      hasNextPage: page < Math.ceil(total / limit),
      hasPrevPage: page > 1
    }
  });
});
```

---

## 🔧 Utility Functions

### 1. Calculate Pagination
```javascript
const calculatePagination = (page = 1, limit = 10) => {
  return {
    skip: (page - 1) * limit,
    limit,
    page
  };
};

// Usage
const { skip, limit } = calculatePagination(2, 20);
```

### 2. Build Sort Object
```javascript
const buildSortObject = (sortBy = "createdAt", sortOrder = "desc") => {
  return { [sortBy]: sortOrder === "asc" ? 1 : -1 };
};

// Usage
const sort = buildSortObject("name", "asc");
```

### 3. Build Search Filter
```javascript
const buildSearchFilter = (searchTerm, searchFields = []) => {
  if (!searchTerm || searchFields.length === 0) return {};
  
  const regex = new RegExp(searchTerm, "i");
  return {
    $or: searchFields.map(field => ({
      [field]: { $regex: regex }
    }))
  };
};

// Usage
const filter = buildSearchFilter("john", ["name", "email"]);
```

### 4. Build Filter Object
```javascript
const buildFilterObject = (filters = {}) => {
  const result = {};
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      result[key] = value;
    }
  });
  
  return result;
};

// Usage
const filter = buildFilterObject({ role: "admin", status: "active" });
```

### 5. Combine Multiple Filters
```javascript
const combineFilters = (...filters) => {
  return Object.assign({}, ...filters);
};

// Usage
const finalFilter = combineFilters(
  buildSearchFilter("john", ["name"]),
  { role: "admin" },
  { status: "active" }
);
```

### 6. Format List Response
```javascript
const formatListResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

// Usage
const response = formatListResponse(users, 150, 1, 10);
```

---

## 🗄️ MongoDB Query Building

### Complete Query Builder
```javascript
const buildListQuery = (params, options = {}) => {
  const { 
    searchFields = [], 
    sortFields = [], 
    defaultSort = "createdAt"
  } = options;

  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder = "desc",
    search,
    ...filters
  } = params;

  // Validate sort field
  const validSortBy = sortFields.includes(sortBy) ? sortBy : defaultSort;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Build search
  let filter = {};
  if (search && searchFields.length > 0) {
    filter.$or = searchFields.map(field => ({
      [field]: { $regex: search, $options: "i" }
    }));
  }

  // Add other filters
  Object.entries(filters).forEach(([key, value]) => {
    if (value) filter[key] = value;
  });

  // Build sort
  const sort = { [validSortBy]: sortOrder === "asc" ? 1 : -1 };

  return { filter, sort, skip, limit, page };
};

// Usage
const query = buildListQuery(
  {
    page: 1,
    limit: 10,
    search: "john",
    role: "admin",
    sortBy: "name",
    sortOrder: "asc"
  },
  {
    searchFields: ["name", "email"],
    sortFields: ["name", "email", "createdAt"],
    defaultSort: "createdAt"
  }
);

const users = await User.find(query.filter)
  .sort(query.sort)
  .skip(query.skip)
  .limit(query.limit);
```

---

## 💡 Complete Examples

### Example 1: Users List with All Features
```javascript
router.get("/users", 
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, search, role, sortBy, sortOrder } = req.validatedQuery;

    // Build query
    const skip = (page - 1) * limit;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    if (role) filter.role = role;

    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // Execute
    const users = await User.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      ...formatListResponse(users, total, page, limit)
    });
  })
);
```

### Example 2: Products with Price Range
```javascript
router.get("/products",
  validateQueryParams(listProductsSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, search, minPrice, maxPrice, category, sortBy, sortOrder } = req.validatedQuery;

    const skip = (page - 1) * limit;
    const filter = {};

    // Search
    if (search) {
      filter.name = { $regex: search, $options: "i" };
    }

    // Price range
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    // Category
    if (category) filter.category = category;

    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      ...formatListResponse(products, total, page, limit)
    });
  })
);
```

---

## 📤 API Response Format

### Standard List Response
```json
{
  "success": true,
  "message": "Data fetched successfully",
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

### With Applied Filters
```json
{
  "success": true,
  "message": "Filtered results",
  "filters": {
    "search": "john",
    "role": "admin",
    "status": "active"
  },
  "sorting": {
    "sortBy": "name",
    "sortOrder": "asc"
  },
  "data": [...],
  "pagination": {...}
}
```

---

## 🧪 Testing Guide

### Using cURL

#### Basic Pagination
```bash
curl "http://localhost:3000/api/users?page=1&limit=10"
```

#### Search
```bash
curl "http://localhost:3000/api/users?page=1&limit=10&search=john"
```

#### Filter
```bash
curl "http://localhost:3000/api/users?page=1&limit=10&role=admin"
```

#### Sort
```bash
curl "http://localhost:3000/api/users?page=1&limit=10&sortBy=name&sortOrder=asc"
```

#### All Features
```bash
curl "http://localhost:3000/api/users?page=1&limit=10&search=john&role=admin&sortBy=name&sortOrder=asc"
```

#### Price Range
```bash
curl "http://localhost:3000/api/products?page=1&limit=10&minPrice=100&maxPrice=5000"
```

#### Date Range
```bash
curl "http://localhost:3000/api/orders?page=1&limit=10&startDate=2024-01-01&endDate=2024-12-31"
```

---

## ✨ Best Practices

### ✅ DO's
1. **Validate sort fields** - Only allow specified fields
2. **Set max limit** - Prevent performance issues (max: 100)
3. **Use indexes** - Add MongoDB indexes on frequently sorted/filtered fields
4. **Combine filters** - Use $and/$or for complex logic
5. **Cache counts** - Cache total document count for large datasets
6. **Validate search fields** - Only search in necessary fields
7. **Sanitize input** - Use validation schemas (Zod)

### ❌ DON'Ts
1. **Don't allow arbitrary sort fields** - This is a security risk
2. **Don't search on unindexed fields** - Performance degradation
3. **Don't return all data** - Always use pagination
4. **Don't trust user input** - Validate with Zod schemas
5. **Don't use $or with many conditions** - Use indexed fields
6. **Don't count on every request** - Cache when possible

---

## 🚀 Performance Tips

### 1. MongoDB Indexes
```javascript
// Create indexes for better performance
// In your model or seed file:

user.collection.createIndex({ email: 1 });
user.collection.createIndex({ name: 1 });
user.collection.createIndex({ role: 1 });
user.collection.createIndex({ createdAt: -1 });

// Compound index for common queries
post.collection.createIndex({ category: 1, status: 1, createdAt: -1 });
```

### 2. Projection (Select specific fields)
```javascript
const users = await User.find(filter)
  .select("name email role")  // Only these fields
  .sort(sort)
  .skip(skip)
  .limit(limit);
```

### 3. Batch Processing
```javascript
// For large exports
const batchSize = 1000;
let skip = 0;

while (true) {
  const batch = await User.find(filter)
    .skip(skip)
    .limit(batchSize);
  
  if (batch.length === 0) break;
  
  // Process batch
  processData(batch);
  
  skip += batchSize;
}
```

### 4. Aggregation Pipeline (for complex queries)
```javascript
const results = await User.aggregate([
  { $match: filter },
  { $sort: sort },
  { $skip: skip },
  { $limit: limit },
  { $group: { _id: "$role", count: { $sum: 1 } } }
]);
```

---

## 📚 Files Reference

| File | Purpose |
|------|---------|
| `src/validators/paginationValidator.js` | Query parameter validators |
| `src/utils/paginationUtils.js` | Utility functions |
| `src/middleware/paginationMiddleware.js` | Pagination middleware |
| `EXAMPLE_PAGINATION_API.js` | 10 complete examples |
| `PAGINATION_GUIDE.md` | This guide |

---

**Version:** 1.0.0  
**Status:** Production Ready ✅  
**Last Updated:** 2024
