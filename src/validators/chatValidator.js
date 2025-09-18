const Joi = require('joi');

const chatSchema = Joi.object({
  prompt: Joi.string()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Prompt không được để trống',
      'string.min': 'Prompt phải có ít nhất 1 ký tự',
      'string.max': 'Prompt không được vượt quá 1000 ký tự',
      'any.required': 'Prompt là bắt buộc'
    })
});

module.exports = chatSchema;
