const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const {
  createNoteSchema,
  updateNoteSchema,
  querySchema,
  searchSchema,
} = require('../validators/noteValidator');

/**
 * Tạo notes mặc định cho user nếu chưa có
 */
router.post('/default', authenticate, noteController.createDefaultNotes);

/**
 * Lấy thống kê notes của user
 */
router.get('/stats', authenticate, noteController.getNotesStats);

/**
 * Tìm kiếm notes
 */
router.get('/search', authenticate, validate(searchSchema, 'query'), noteController.searchNotes);

/**
 * Lấy tất cả notes của user (một document chứa 3 mảng)
 */
router.get('/', authenticate, noteController.getNotes);

/**
 * Lấy notes theo category
 * Params: category (vocabulary, formula, other)
 */
router.get('/category/:category', authenticate, validate(querySchema, 'query'), noteController.getNotesByCategory);

/**
 * Lấy một note item cụ thể theo ID trong category
 */
router.get('/category/:category/item/:itemId', authenticate, noteController.getNoteItemById);

/**
 * Thêm note item mới vào category
 */
router.post('/', authenticate, validate(createNoteSchema), noteController.createNoteItem);

/**
 * Cập nhật note item
 */
router.put('/category/:category/item/:itemId', authenticate, validate(updateNoteSchema), noteController.updateNoteItem);

/**
 * Toggle trạng thái isLearned của note item
 */
router.patch('/category/:category/item/:itemId/toggle-learned', authenticate, noteController.toggleLearned);

/**
 * Xóa note item
 */
router.delete('/category/:category/item/:itemId', authenticate, noteController.deleteNoteItem);

module.exports = router;
