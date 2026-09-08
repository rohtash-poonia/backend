/**
 * COMPLETE EXAMPLE: List APIs with Pagination, Filtering, Sorting & Searching
 * Production-ready implementation
 */

const express = require("express");
const router = express.Router();

// ============ IMPORTS ============
const { validateQueryParams } = require("../middleware/validationMiddleware");
const {
  listUsersSchema,
  listPostsSchema,
  listFilesSchema,
  listOrdersSchema,
} = require("../validators/paginationValidator");
const {
  formatListResponse,
  buildMongoDBQuery,
  buildListQuery,
} = require("../utils/paginationUtils");
const { asyncHandler, AppError } = require("../utils/errorHandler");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// ============ DATABASE IMPORTS ============
const User = require("../model/authModel");
const Post = require("../model/postModel"); // Assuming you have this
const File = require("../model/fileModel"); // Assuming you have this
const Order = require("../model/orderModel"); // Assuming you have this

// ==========================================
// 1. SIMPLE USER LIST WITH PAGINATION
// ==========================================
/**
 * GET /api/users?page=1&limit=10&sortBy=name&sortOrder=asc
 * Simple pagination example
 */
router.get(
  "/users",
  authenticate,
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder } = req.validatedQuery;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build sort object
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // Fetch data
    const users = await User.find()
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    // Format response
    const response = formatListResponse(users, total, page, limit);

    res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      ...response,
    });
  })
);

// ==========================================
// 2. USER LIST WITH PAGINATION + FILTERING
// ==========================================
/**
 * GET /api/users/filtered?page=1&limit=10&role=admin&sortBy=name
 * Pagination + Filtering by role
 */
router.get(
  "/users/filtered/all",
  authenticate,
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder, role } = req.validatedQuery;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};
    if (role) {
      filter.role = role;
    }

    // Build sort
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // Fetch data
    const users = await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Filtered users fetched successfully",
      ...formatListResponse(users, total, page, limit),
    });
  })
);

// ==========================================
// 3. USER LIST WITH PAGINATION + SEARCH
// ==========================================
/**
 * GET /api/users/search?page=1&limit=10&search=john&sortBy=name
 * Pagination + Searching in name and email
 */
router.get(
  "/users/search/all",
  authenticate,
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder, search } = req.validatedQuery;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build search filter
    const filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Build sort
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // Fetch data
    const users = await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Search results",
      searchTerm: search || "all",
      ...formatListResponse(users, total, page, limit),
    });
  })
);

// ==========================================
// 4. USER LIST WITH ALL FEATURES
// ==========================================
/**
 * GET /api/users/advanced?page=1&limit=10&search=john&role=user&sortBy=name&sortOrder=asc
 * Complete: Pagination + Filtering + Searching + Sorting
 */
router.get(
  "/users/advanced/all",
  authenticate,
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, sortBy, sortOrder, search, role, phone } =
      req.validatedQuery;

    // Build complete query using utility
    const queryConfig = buildListQuery(req.validatedQuery, {
      searchFields: ["name", "email"],
      sortFields: ["name", "email", "createdAt", "role"],
      defaultSort: "createdAt",
    });

    // Fetch data
    const users = await User.find(queryConfig.filter)
      .select("-password")
      .sort(queryConfig.sort)
      .skip(queryConfig.skip)
      .limit(queryConfig.limit);

    const total = await User.countDocuments(queryConfig.filter);

    res.status(200).json({
      success: true,
      message: "Advanced search results",
      filters: { search, role, phone },
      ...formatListResponse(users, total, queryConfig.page, queryConfig.limit),
    });
  })
);

// ==========================================
// 5. POSTS LIST WITH FULL FEATURES
// ==========================================
/**
 * GET /api/posts?page=1&limit=20&search=javascript&category=tech&status=active&sortBy=title&sortOrder=asc
 * Posts with: Pagination + Multi-field Search + Filtering + Sorting
 */
router.get(
  "/posts",
  validateQueryParams(listPostsSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, search, category, status, sortBy, sortOrder } =
      req.validatedQuery;

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Add search filter (searches in title and description)
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    // Add exact filters
    if (category) filter.category = category;
    if (status) filter.status = status;

    // Build sort
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    // Fetch data
    const posts = await Post.find(filter)
      .populate("userId", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Posts fetched successfully",
      appliedFilters: { search, category, status, sortBy, sortOrder },
      ...formatListResponse(posts, total, page, limit),
    });
  })
);

// ==========================================
// 6. FILES LIST WITH PAGINATION & FILTERING
// ==========================================
/**
 * GET /api/files?page=1&limit=15&search=pdf&category=documents&sortBy=uploadedAt
 * Files with: Pagination + Search + Filtering
 */
router.get(
  "/files",
  authenticate,
  validateQueryParams(listFilesSchema),
  asyncHandler(async (req, res) => {
    const { page, limit, search, category, sortBy, sortOrder } =
      req.validatedQuery;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = { userId: req.user.id }; // Only user's files

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { fileName: { $regex: search, $options: "i" } },
      ];
    }

    if (category) filter.category = category;

    // Build sort
    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    const files = await File.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await File.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Files fetched successfully",
      ...formatListResponse(files, total, page, limit),
    });
  })
);

// ==========================================
// 7. ORDERS LIST WITH RANGE FILTERING
// ==========================================
/**
 * GET /api/orders?page=1&limit=10&status=completed&minAmount=1000&maxAmount=5000&sortBy=createdAt
 * Orders with: Pagination + Range Filtering + Status Filter
 */
router.get(
  "/orders",
  authenticate,
  authorize(["admin"]),
  validateQueryParams(listOrdersSchema),
  asyncHandler(async (req, res) => {
    const {
      page,
      limit,
      search,
      status,
      minAmount,
      maxAmount,
      sortBy,
      sortOrder,
    } = req.validatedQuery;

    const skip = (page - 1) * limit;

    // Build filter
    const filter = {};

    // Search in order ID or customer name
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    // Status filter
    if (status) filter.status = status;

    // Amount range filter
    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.totalAmount = {};
      if (minAmount !== undefined) filter.totalAmount.$gte = minAmount;
      if (maxAmount !== undefined) filter.totalAmount.$lte = maxAmount;
    }

    const sort = { [sortBy || "createdAt"]: sortOrder === "asc" ? 1 : -1 };

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Order.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      appliedFilters: { status, search, amountRange: { minAmount, maxAmount } },
      ...formatListResponse(orders, total, page, limit),
    });
  })
);

// ==========================================
// 8. ADVANCED SEARCH WITH MULTIPLE CONDITIONS
// ==========================================
/**
 * GET /api/users/advanced-search?search=john&page=1&limit=10&sortBy=name&role=user
 * Advanced search with multiple conditions
 */
router.get(
  "/users/advanced-search/query",
  authenticate,
  validateQueryParams(listUsersSchema),
  asyncHandler(async (req, res) => {
    const query = req.validatedQuery;
    const skip = (query.page - 1) * query.limit;

    // Build complex filter
    const filter = {};

    // Multi-field search
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: "i" } },
        { email: { $regex: query.search, $options: "i" } },
      ];
    }

    // Add role filter
    if (query.role) filter.role = query.role;

    // Add phone filter if exists
    if (query.phone) filter.phone = query.phone;

    const sort = {
      [query.sortBy || "createdAt"]: query.sortOrder === "asc" ? 1 : -1,
    };

    const users = await User.find(filter)
      .select("-password")
      .sort(sort)
      .skip(skip)
      .limit(query.limit);

    const total = await User.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Advanced search completed",
      filters: {
        search: query.search,
        role: query.role,
        phone: query.phone,
      },
      sorting: {
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      },
      ...formatListResponse(users, total, query.page, query.limit),
    });
  })
);

// ==========================================
// 9. DISTINCT VALUES FOR FILTERING
// ==========================================
/**
 * GET /api/filters/categories
 * Get distinct categories for filter dropdown
 */
router.get(
  "/filters/categories",
  asyncHandler(async (req, res) => {
    const categories = await Post.distinct("category");

    res.status(200).json({
      success: true,
      message: "Categories fetched",
      data: categories,
    });
  })
);

// ==========================================
// 10. STATISTICS WITH FILTERED DATA
// ==========================================
/**
 * GET /api/stats/orders?status=completed&minAmount=1000&maxAmount=5000
 * Get statistics on filtered data
 */
router.get(
  "/stats/orders",
  authenticate,
  authorize(["admin"]),
  validateQueryParams(listOrdersSchema),
  asyncHandler(async (req, res) => {
    const { status, minAmount, maxAmount } = req.validatedQuery;

    // Build filter
    const filter = {};
    if (status) filter.status = status;

    if (minAmount !== undefined || maxAmount !== undefined) {
      filter.totalAmount = {};
      if (minAmount !== undefined) filter.totalAmount.$gte = minAmount;
      if (maxAmount !== undefined) filter.totalAmount.$lte = maxAmount;
    }

    // Aggregate statistics
    const stats = await Order.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: "$totalAmount" },
          averageOrderValue: { $avg: "$totalAmount" },
          maxOrderValue: { $max: "$totalAmount" },
          minOrderValue: { $min: "$totalAmount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Order statistics",
      filters: { status, minAmount, maxAmount },
      data: stats[0] || {
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        maxOrderValue: 0,
        minOrderValue: 0,
      },
    });
  })
);

module.exports = router;

// ==========================================
// TESTING WITH CURL
// ==========================================
/*
# 1. Simple Pagination
curl "http://localhost:3000/api/users?page=1&limit=10"

# 2. Pagination + Filtering
curl "http://localhost:3000/api/users/filtered/all?page=1&limit=10&role=admin"

# 3. Pagination + Search
curl "http://localhost:3000/api/users/search/all?page=1&limit=10&search=john"

# 4. All Features
curl "http://localhost:3000/api/users/advanced/all?page=1&limit=10&search=john&role=user&sortBy=name&sortOrder=asc"

# 5. Posts with all features
curl "http://localhost:3000/api/posts?page=1&limit=20&search=javascript&category=tech&status=active&sortBy=title&sortOrder=asc"

# 6. Files search
curl "http://localhost:3000/api/files?page=1&limit=15&search=pdf&category=documents&sortBy=uploadedAt&sortOrder=desc"

# 7. Orders with range
curl "http://localhost:3000/api/orders?page=1&limit=10&status=completed&minAmount=1000&maxAmount=5000"

# 8. Advanced search
curl "http://localhost:3000/api/users/advanced-search/query?search=john&page=1&limit=10&sortBy=name&role=user"

# 9. Get filter options
curl "http://localhost:3000/api/filters/categories"

# 10. Get statistics
curl "http://localhost:3000/api/stats/orders?status=completed&minAmount=1000&maxAmount=5000"
*/
