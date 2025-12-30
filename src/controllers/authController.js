const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/User');

/**
 * Tạo JWT token cho user
 */
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

/**
 * Callback sau khi Google OAuth thành công
 */
const googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect(`${config.frontendUrl}/login?error=authentication_failed`);
    }

    // Tạo JWT token
    const token = generateToken(req.user._id);

    // Redirect về frontend với token
    // Frontend sẽ lưu token vào localStorage hoặc cookie
    res.redirect(`${config.frontendUrl}/auth/callback?token=${token}&user=${encodeURIComponent(JSON.stringify(req.user.toJSON()))}`);
  } catch (error) {
    console.error('Error in googleCallback:', error);
    res.redirect(`${config.frontendUrl}/login?error=server_error`);
  }
};

/**
 * Lấy thông tin user hiện tại
 */
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại',
      });
    }

    res.json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin user',
    });
  }
};

/**
 * Đăng xuất (frontend sẽ xóa token)
 */
const logout = (req, res) => {
  res.json({
    success: true,
    message: 'Đăng xuất thành công',
  });
};

/**
 * Verify token và trả về user info
 */
const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại',
      });
    }

    res.json({
      success: true,
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Error in verifyToken:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xác thực token',
    });
  }
};

/**
 * Cập nhật audience của user
 */
const updateAudience = async (req, res) => {
  try {
    const { audience } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại',
      });
    }

    // Cập nhật audience
    user.audience = audience;
    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật audience thành công',
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Error in updateAudience:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật audience',
    });
  }
};

/**
 * Cập nhật profile của user
 */
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, audience } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User không tồn tại',
      });
    }

    // Cập nhật các trường được cung cấp
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (audience !== undefined) user.audience = audience;
    
    await user.save();

    res.json({
      success: true,
      message: 'Cập nhật profile thành công',
      data: user.toJSON(),
    });
  } catch (error) {
    console.error('Error in updateProfile:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật profile',
    });
  }
};

module.exports = {
  googleCallback,
  getCurrentUser,
  logout,
  verifyToken,
  updateAudience,
  updateProfile,
};

