/**
 * Validation middleware với hỗ trợ body, query, params
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    let data;
    
    switch (source) {
      case 'query':
        data = req.query;
        break;
      case 'params':
        data = req.params;
        break;
      case 'body':
      default:
        data = req.body;
        break;
    }
    
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true
    });
    
    if (error) {
      const errorMessage = error.details.map(detail => detail.message).join(', ');
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        error: errorMessage
      });
    }
    
    // Replace với validated value
    switch (source) {
      case 'query':
        req.query = value;
        break;
      case 'params':
        req.params = value;
        break;
      case 'body':
      default:
        req.body = value;
        break;
    }
    
    next();
  };
};

module.exports = { validate };
