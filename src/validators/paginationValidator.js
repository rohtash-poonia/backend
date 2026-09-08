/**
 * Query Validators for Pagination, Filtering, Sorting, and Searching
 * Used for validating list/get endpoints
 */

const { z } = require("zod");

// ============ PAGINATION VALIDATOR ============
const paginationSchema = z.object({
  page: z.coerce
    .number()
    .int()
    .positive("Page must be a positive number")
    .optional()
    .default(1),
  limit: z.coerce
    .number()
    .int()
    .positive("Limit must be a positive number")
    .max(100, "Limit cannot exceed 100 records per page")
    .optional()
    .default(10),
  sortBy: z.string().optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

// ============ USER LIST WITH PAGINATION, FILTER, SEARCH ============
const listUsersSchema = paginationSchema.extend({
  search: z.string().optional(),
  name: z.string().optional(),
  email: z.string().email("Email must be a valid email address").optional(),
  role: z.enum(["user", "admin"]).optional(),
  phone: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .optional(),
  number: z
    .string()
    .regex(/^[0-9]{10}$/, "Phone must be exactly 10 digits")
    .optional(),
});

// ============ GENERIC LIST PAGINATION ============
const genericListSchema = paginationSchema;

// ============ POSTS/PRODUCTS LIST WITH FILTER & SEARCH ============
const listPostsSchema = paginationSchema.extend({
  search: z.string().min(1, "Search term must not be empty").optional(),
  category: z.string().optional(),
  status: z.enum(["active", "inactive", "draft"]).optional(),
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    .optional(),
});

// ============ UPLOADS/FILES LIST ============
const listFilesSchema = paginationSchema.extend({
  search: z.string().optional(),
  category: z.string().optional(),
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    .optional(),
});

// ============ ORDERS LIST (E-COMMERCE) ============
const listOrdersSchema = paginationSchema.extend({
  search: z.string().optional(),
  status: z
    .enum(["pending", "processing", "completed", "cancelled"])
    .optional(),
  userId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
    .optional(),
  minAmount: z.coerce
    .number()
    .nonnegative("Minimum amount must be non-negative")
    .optional(),
  maxAmount: z.coerce
    .number()
    .positive("Maximum amount must be positive")
    .optional(),
});

// ============ ADVANCED SEARCH WITH OPERATORS ============
const advancedSearchSchema = paginationSchema.extend({
  query: z.string().min(1, "Query cannot be empty").optional(),
  fields: z
    .string()
    .optional()
    .describe("Comma-separated field names to search in"),
  operator: z.enum(["and", "or"]).optional().default("or"),
});

module.exports = {
  paginationSchema,
  listUsersSchema,
  genericListSchema,
  listPostsSchema,
  listFilesSchema,
  listOrdersSchema,
  advancedSearchSchema,
};
