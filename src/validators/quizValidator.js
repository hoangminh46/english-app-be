const Joi = require('joi');

const generateQuizSchema = Joi.object({
  language: Joi.string()
    .valid('Tiếng Anh', 'English', 'Tiếng Việt', 'Vietnamese')
    .required()
    .messages({
      'any.only': 'Language phải là một trong: Tiếng Anh, English, Tiếng Việt, Vietnamese',
      'any.required': 'Language là bắt buộc'
    }),
  
  quantity: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .required()
    .messages({
      'number.base': 'Quantity phải là số',
      'number.integer': 'Quantity phải là số nguyên',
      'number.min': 'Quantity phải ít nhất là 1',
      'number.max': 'Quantity không được vượt quá 50',
      'any.required': 'Quantity là bắt buộc'
    }),
  
  mainTopic: Joi.string()
    .min(1)
    .max(200)
    .required()
    .messages({
      'string.empty': 'MainTopic không được để trống',
      'string.min': 'MainTopic phải có ít nhất 1 ký tự',
      'string.max': 'MainTopic không được vượt quá 200 ký tự',
      'any.required': 'MainTopic là bắt buộc'
    }),
  
  subtopics: Joi.array()
    .items(Joi.string().min(1).max(100))
    .max(10)
    .default([])
    .messages({
      'array.max': 'Subtopics không được vượt quá 10 mục',
      'string.min': 'Mỗi subtopic phải có ít nhất 1 ký tự',
      'string.max': 'Mỗi subtopic không được vượt quá 100 ký tự'
    }),
  
  difficulty: Joi.string()
    .valid('Cơ bản', 'Trung bình', 'Nâng cao', 'Basic', 'Intermediate', 'Advanced')
    .required()
    .messages({
      'any.only': 'Difficulty phải là một trong: Cơ bản, Trung bình, Nâng cao, Basic, Intermediate, Advanced',
      'any.required': 'Difficulty là bắt buộc'
    }),
  
  audience: Joi.string()
    .min(1)
    .max(100)
    .default('general')
    .messages({
      'string.min': 'Audience phải có ít nhất 1 ký tự',
      'string.max': 'Audience không được vượt quá 100 ký tự'
    }),
  
  category: Joi.string()
    .valid('vocabulary', 'grammar', 'communication', 'mixed')
    .default('mixed')
    .messages({
      'any.only': 'Category phải là một trong: vocabulary, grammar, communication, mixed'
    })
});

module.exports = {
  generateQuizSchema
};
