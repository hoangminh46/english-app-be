const Joi = require('joi');

// Schema validation cho cập nhật audience
const updateAudienceSchema = Joi.object({
  audience: Joi.string()
    .valid('student', 'college', 'worker', 'senior')
    .required()
    .messages({
      'any.only': 'Audience phải là một trong: student, college, worker, senior',
      'any.required': 'Audience là bắt buộc'
    })
});

// Schema validation cho cập nhật profile
const updateProfileSchema = Joi.object({
  firstName: Joi.string()
    .trim()
    .max(100)
    .optional(),
  lastName: Joi.string()
    .trim()
    .max(100)
    .optional(),
  audience: Joi.string()
    .valid('student', 'college', 'worker', 'senior')
    .allow(null)
    .optional()
});

module.exports = {
  updateAudienceSchema,
  updateProfileSchema,
};

