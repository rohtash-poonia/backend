const { z } = require("zod");

// ============ UPLOAD FILE VALIDATION ============
const uploadFileSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters")
    .optional(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .optional(),
});

// ============ DELETE FILE VALIDATION ============
const deleteFileSchema = z.object({
  fileId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid file ID format"),
});

// ============ UPDATE FILE METADATA VALIDATION ============
const updateFileMetadataSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters long")
    .max(100, "Title must not exceed 100 characters")
    .optional(),
  description: z
    .string()
    .min(5, "Description must be at least 5 characters")
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  category: z
    .string()
    .min(2, "Category must be at least 2 characters")
    .optional(),
});

module.exports = {
  uploadFileSchema,
  deleteFileSchema,
  updateFileMetadataSchema,
};
