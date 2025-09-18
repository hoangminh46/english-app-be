const Joi = require('joi');

const scrambleSchema = Joi.object({
  difficulty: Joi.string()
    .valid('Cơ bản', 'Trung bình', 'Nâng cao', 'Basic', 'Intermediate', 'Advanced')
    .required()
    .messages({
      'any.only': 'Difficulty phải là một trong: Cơ bản, Trung bình, Nâng cao, Basic, Intermediate, Advanced',
      'any.required': 'Difficulty là bắt buộc'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(30)
    .required()
    .messages({
      'number.base': 'Quantity phải là số',
      'number.integer': 'Quantity phải là số nguyên',
      'number.min': 'Quantity phải ít nhất là 1',
      'number.max': 'Quantity không được vượt quá 30',
      'any.required': 'Quantity là bắt buộc'
    }),
  
  topics: Joi.array()
    .items(Joi.string().min(1).max(100))
    .min(1)
    .max(10)
    .required()
    .messages({
      'array.min': 'Topics phải có ít nhất 1 mục',
      'array.max': 'Topics không được vượt quá 10 mục',
      'string.min': 'Mỗi topic phải có ít nhất 1 ký tự',
      'string.max': 'Mỗi topic không được vượt quá 100 ký tự',
      'any.required': 'Topics là bắt buộc'
    })
});

module.exports = scrambleSchema;
