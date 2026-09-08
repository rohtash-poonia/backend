/**
 * Pagination, Filtering, Sorting & Searching Utilities
 * Production-ready helpers for building listing APIs
 */

const normalizePaginationValue = (value, fallback, minimum = 1) => {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < minimum) {
    return fallback;
  }

  return Math.floor(parsedValue);
};

// ============ PAGINATION HELPER ============
/**
 * Calculates pagination values (skip, limit)
 * @param {number|string} page - Page number (1-based)
 * @param {number|string} limit - Items per page
 * @returns {object} { skip, limit, page }
 */
const calculatePagination = (page = 1, limit = 10) => {
  const normalizedPage = normalizePaginationValue(page, 1, 1);
  const normalizedLimit = normalizePaginationValue(limit, 10, 1);
  const skip = (normalizedPage - 1) * normalizedLimit;

  return { skip, limit: normalizedLimit, page: normalizedPage };
};

// ============ SORT OBJECT BUILDER ============
/**
 * Builds MongoDB sort object
 * @param {string} sortBy - Field to sort by
 * @param {string} sortOrder - 'asc' or 'desc'
 * @returns {object} MongoDB sort object
 */
const buildSortObject = (sortBy = "createdAt", sortOrder = "desc") => {
  const sortValue = sortOrder === "asc" ? 1 : -1;
  return { [sortBy]: sortValue };
};

// ============ SEARCH FILTER BUILDER ============
/**
 * Builds search filter for MongoDB using $or and $regex
 * @param {string} searchTerm - Term to search
 * @param {array} searchFields - Fields to search in
 * @returns {object} MongoDB filter object
 */
const buildSearchFilter = (searchTerm = "", searchFields = []) => {
  if (!searchTerm || searchFields.length === 0) {
    return {};
  }

  const searchRegex = new RegExp(searchTerm, "i"); // Case-insensitive

  return {
    $or: searchFields.map((field) => ({
      [field]: { $regex: searchRegex },
    })),
  };
};

// ============ FILTER OBJECT BUILDER ============
/**
 * Builds filter object for specific fields
 * @param {object} filters - Filter criteria
 * @returns {object} MongoDB filter object
 */
const buildFilterObject = (filters = {}) => {
  const mongoFilter = {};

  Object.keys(filters).forEach((key) => {
    const value = filters[key];

    // Skip undefined, null, or empty values
    if (value === undefined || value === null || value === "") {
      return;
    }

    mongoFilter[key] = value;
  });

  return mongoFilter;
};

// ============ ADVANCED FILTER WITH OPERATORS ============
/**
 * Builds advanced filters with operators (gt, lt, gte, lte, regex, etc)
 * @param {object} filterConfig - Configuration with fields and operators
 * @returns {object} MongoDB filter object
 */
const buildAdvancedFilter = (filterConfig = {}) => {
  const mongoFilter = {};

  Object.keys(filterConfig).forEach((key) => {
    const config = filterConfig[key];

    // Handle range filters (min, max)
    if (config.min !== undefined || config.max !== undefined) {
      mongoFilter[key] = {};
      if (config.min !== undefined) mongoFilter[key].$gte = config.min;
      if (config.max !== undefined) mongoFilter[key].$lte = config.max;
    }

    // Handle exact match
    if (config.exact !== undefined) {
      mongoFilter[key] = config.exact;
    }

    // Handle regex search
    if (config.search !== undefined) {
      mongoFilter[key] = { $regex: config.search, $options: "i" };
    }

    // Handle array contains
    if (config.in !== undefined && Array.isArray(config.in)) {
      mongoFilter[key] = { $in: config.in };
    }

    // Handle not in
    if (config.notIn !== undefined && Array.isArray(config.notIn)) {
      mongoFilter[key] = { $nin: config.notIn };
    }

    // Handle exists
    if (config.exists !== undefined) {
      mongoFilter[key] = { $exists: config.exists };
    }
  });

  return mongoFilter;
};

// ============ COMBINE FILTERS ============
/**
 * Combines multiple filter objects
 * @param {...object} filters - Filter objects to combine
 * @returns {object} Combined filter
 */
const combineFilters = (...filters) => {
  return filters.reduce((combined, filter) => {
    return { ...combined, ...filter };
  }, {});
};

// ============ RESPONSE FORMATTER ============
/**
 * Formats list response with pagination metadata
 * @param {array} data - Array of items
 * @param {number} total - Total count
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {object} Formatted response
 */
const formatListResponse = (data = [], total = 0, page = 1, limit = 10) => {
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    data,
    pagination: {
      total,
      page,
      limit,
      pages: totalPages,
      hasNextPage,
      hasPrevPage,
    },
  };
};

// ============ BUILD QUERY FROM VALIDATED DATA ============
/**
 * Builds complete MongoDB query from validated query params
 * @param {object} validatedQuery - Validated query from schema
 * @param {array} searchFields - Fields to search in
 * @param {object} additionalFilters - Extra filters to apply
 * @returns {object} { filter, sort, skip, limit }
 */
const buildMongoDBQuery = (
  validatedQuery = {},
  searchFields = [],
  additionalFilters = {},
) => {
  const {
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
    search,
    ...otherFilters
  } = validatedQuery;

  const { skip, limit: finalLimit } = calculatePagination(page, limit);
  const sort = buildSortObject(sortBy, sortOrder);
  const searchFilter = buildSearchFilter(search, searchFields);
  const fieldFilter = buildFilterObject(otherFilters);
  const filter = combineFilters(searchFilter, fieldFilter, additionalFilters);

  return {
    filter,
    sort,
    skip,
    limit: finalLimit,
    page: Number(page) || 1,
  };
};

// ============ VALIDATE SORT FIELD ============
/**
 * Validates if sort field is allowed
 * @param {string} sortBy - Field to sort by
 * @param {array} allowedFields - Allowed fields
 * @returns {boolean} Is valid
 */
const isValidSortField = (sortBy, allowedFields = []) => {
  return allowedFields.length === 0 || allowedFields.includes(sortBy);
};

// ============ GET SORT FIELD OR DEFAULT ============
/**
 * Gets sort field or returns default if not allowed
 * @param {string} sortBy - Requested field
 * @param {array} allowedFields - Allowed fields
 * @param {string} defaultField - Default field
 * @returns {string} Valid field
 */
const getSortFieldOrDefault = (
  sortBy,
  allowedFields = [],
  defaultField = "createdAt",
) => {
  if (isValidSortField(sortBy, allowedFields)) {
    return sortBy;
  }
  return defaultField;
};

// ============ BUILD FULL LIST QUERY ============
/**
 * Complete query builder for listing operations
 * @param {object} params - Query parameters
 * @param {object} options - Configuration options
 * @returns {object} Complete MongoDB query config
 */
const buildListQuery = (params = {}, options = {}) => {
  const {
    searchFields = [],
    sortFields = [],
    defaultSort = "createdAt",
    defaultSortOrder = "desc",
    additionalFilters = {},
  } = options;

  const {
    page = 1,
    limit = 10,
    sortBy,
    sortOrder = "desc",
    search,
    ...filters
  } = params;

  const validSortBy = getSortFieldOrDefault(sortBy, sortFields, defaultSort);
  const { skip, limit: finalLimit } = calculatePagination(page, limit);
  const sort = buildSortObject(validSortBy, sortOrder || defaultSortOrder);
  const searchFilter = buildSearchFilter(search, searchFields);
  const fieldFilter = buildFilterObject(filters);
  const filter = combineFilters(searchFilter, fieldFilter, additionalFilters);

  return {
    filter,
    sort,
    skip,
    limit: finalLimit,
    page: Number(page) || 1,
  };
};

module.exports = {
  calculatePagination,
  buildSortObject,
  buildSearchFilter,
  buildFilterObject,
  buildAdvancedFilter,
  combineFilters,
  formatListResponse,
  buildMongoDBQuery,
  isValidSortField,
  getSortFieldOrDefault,
  buildListQuery,
};
