const jwt = require('jsonwebtoken');
const config = require('../config/config');

/**
 * Middleware xác thực JWT token
 * Token có thể được gửi qua:
 * - Authorization header: Bearer <token>
 * - Query parameter: ?token=<token>
 */
const authenticate = (req, res, next) => {
  try {
    // Lấy token từ header hoặc query
    let token = null;

    // Kiểm tra Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }

    // Nếu không có trong header, kiểm tra query parameter
    if (!token && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token. Vui lòng đăng nhập.',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại.',
      });
    }

    console.error('Error in authenticate middleware:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực',
    });
  }
};

module.exports = {
  authenticate,
};

