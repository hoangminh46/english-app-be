const express = require('express');
const passport = require('passport');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { updateAudienceSchema, updateLanguageSchema, updateProfileSchema } = require('../validators/userValidator');

/**
 * Route để bắt đầu quá trình đăng nhập Google OAuth
 * Frontend sẽ redirect user đến route này
 */
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

/**
 * Callback route sau khi Google xác thực thành công
 */
router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false, // Không sử dụng session, dùng JWT
    failureRedirect: '/api/v1/auth/google/failure',
  }),
  authController.googleCallback
);

/**
 * Route xử lý khi Google OAuth thất bại
 */
router.get('/google/failure', (req, res) => {
  res.status(401).json({
    success: false,
    message: 'Đăng nhập Google thất bại',
  });
});

/**
 * Route để verify token và lấy thông tin user
 */
router.get('/verify', authenticate, authController.verifyToken);

/**
 * Route để lấy thông tin user hiện tại
 */
router.get('/me', authenticate, authController.getCurrentUser);

/**
 * Route đăng xuất
 */
router.post('/logout', authenticate, authController.logout);

/**
 * Route cập nhật audience của user
 */
router.put('/audience', authenticate, validate(updateAudienceSchema), authController.updateAudience);

/**
 * Route cập nhật language của user
 */
router.put('/language', authenticate, validate(updateLanguageSchema), authController.updateLanguage);

/**
 * Route cập nhật profile của user
 */
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;

