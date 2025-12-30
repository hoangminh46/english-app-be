const Joi = require('joi');

// Schema validation cho tạo note
const createNoteSchema = Joi.object({
  category: Joi.string()
    .valid('vocabulary', 'formula', 'other')
    .required()
    .messages({
      'any.only': 'Category phải là một trong: vocabulary, formula, other',
      'any.required': 'Category là bắt buộc'
    }),
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title không được để trống',
      'string.max': 'Title không được vượt quá 200 ký tự',
      'any.required': 'Title là bắt buộc'
    }),
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .required()
    .messages({
      'string.empty': 'Content không được để trống',
      'string.max': 'Content không được vượt quá 5000 ký tự',
      'any.required': 'Content là bắt buộc'
    }),
  example: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Example không được vượt quá 1000 ký tự'
    }),
  isLearned: Joi.boolean()
    .optional()
    .default(false)
});

// Schema validation cho cập nhật note
const updateNoteSchema = Joi.object({
  title: Joi.string()
    .trim()
    .min(1)
    .max(200)
    .optional()
    .messages({
      'string.empty': 'Title không được để trống',
      'string.max': 'Title không được vượt quá 200 ký tự'
    }),
  content: Joi.string()
    .trim()
    .min(1)
    .max(5000)
    .optional()
    .messages({
      'string.empty': 'Content không được để trống',
      'string.max': 'Content không được vượt quá 5000 ký tự'
    }),
  example: Joi.string()
    .trim()
    .max(1000)
    .allow('')
    .optional()
    .messages({
      'string.max': 'Example không được vượt quá 1000 ký tự'
    }),
  isLearned: Joi.boolean()
    .optional()
});

// Schema validation cho query parameters
const querySchema = Joi.object({
  category: Joi.string()
    .valid('vocabulary', 'formula', 'other')
    .optional(),
  isLearned: Joi.string()
    .valid('true', 'false')
    .optional(),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'title')
    .optional()
    .default('updatedAt'),
  sortOrder: Joi.string()
    .valid('asc', 'desc')
    .optional()
    .default('desc')
});

// Schema validation cho search
const searchSchema = Joi.object({
  q: Joi.string()
    .trim()
    .min(1)
    .required()
    .messages({
      'string.empty': 'Từ khóa tìm kiếm không được để trống',
      'any.required': 'Từ khóa tìm kiếm là bắt buộc'
    }),
  category: Joi.string()
    .valid('vocabulary', 'formula', 'other')
    .optional(),
  isLearned: Joi.string()
    .valid('true', 'false')
    .optional(),
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1),
  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(20)
});

module.exports = {
  createNoteSchema,
  updateNoteSchema,
  querySchema,
  searchSchema,
};

