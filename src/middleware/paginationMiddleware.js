/**
 * Pagination Middleware
 * Automatically handles pagination, filtering, sorting for list endpoints
 */

const { validateQueryParams } = require("./validationMiddleware");
const { buildListQuery } = require("../utils/paginationUtils");

// ============ PAGINATION MIDDLEWARE ============
/**
 * Middleware to handle pagination from query params
 * Attaches validatedQuery with pagination info to request
 */
const paginationMiddleware = (validationSchema) => {
  return validateQueryParams(validationSchema);
};

// ============ BUILD QUERY MIDDLEWARE ============
/**
 * Middleware to build MongoDB query from validated params
 * Attaches mongoQuery to request
 */
const buildQueryMiddleware = (
  searchFields = [],
  sortFields = [],
  additionalFilters = {},
) => {
  return (req, res, next) => {
    try {
      const validatedQuery = req.validatedQuery || {};
      const mongoQuery = buildListQuery(validatedQuery, {
        searchFields,
        sortFields,
        additionalFilters,
        defaultSort: "createdAt",
        defaultSortOrder: validatedQuery.sortOrder || "desc",
      });

      req.mongoQuery = mongoQuery;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  paginationMiddleware,
  buildQueryMiddleware,
};
