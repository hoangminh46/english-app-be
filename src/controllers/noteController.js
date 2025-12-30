const Note = require('../models/Note');

/**
 * Lấy notes của user (một document duy nhất chứa 3 mảng)
 */
const getNotes = async (req, res) => {
  try {
    let note = await Note.findOne({ userId: req.userId });
    
    // Nếu chưa có, tạo mới với 3 mảng rỗng
    if (!note) {
      note = await Note.create({
        userId: req.userId,
        vocabulary: [],
        formula: [],
        other: []
      });
    }
    
    res.json({
      success: true,
      data: note.toJSON(),
    });
  } catch (error) {
    console.error('Error in getNotes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy notes',
    });
  }
};

/**
 * Lấy notes theo category
 */
const getNotesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { isLearned, page = 1, limit = 20, sortBy = 'updatedAt', sortOrder = 'desc' } = req.query;
    
    if (!['vocabulary', 'formula', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category không hợp lệ. Chỉ chấp nhận: vocabulary, formula, other',
      });
    }
    
    let note = await Note.findOne({ userId: req.userId });
    
    if (!note) {
      note = await Note.create({
        userId: req.userId,
        vocabulary: [],
        formula: [],
        other: []
      });
    }
    
    // Lấy mảng theo category
    let items = note[category] || [];
    
    // Filter theo isLearned nếu có
    if (isLearned !== undefined) {
      items = items.filter(item => item.isLearned === (isLearned === 'true'));
    }
    
    // Sort
    items.sort((a, b) => {
      const aValue = a[sortBy] || new Date(0);
      const bValue = b[sortBy] || new Date(0);
      return sortOrder === 'asc' 
        ? (aValue > bValue ? 1 : -1)
        : (aValue < bValue ? 1 : -1);
    });
    
    // Pagination
    const total = items.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedItems = items.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in getNotesByCategory:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy notes theo category',
    });
  }
};

/**
 * Lấy một note item cụ thể theo ID trong category
 */
const getNoteItemById = async (req, res) => {
  try {
    const { category, itemId } = req.params;
    
    if (!['vocabulary', 'formula', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category không hợp lệ',
      });
    }
    
    const note = await Note.findOne({ userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note không tồn tại',
      });
    }
    
    const item = note[category].id(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Note item không tồn tại',
      });
    }
    
    res.json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error('Error in getNoteItemById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy note item',
    });
  }
};

/**
 * Thêm note item mới vào category
 */
const createNoteItem = async (req, res) => {
  try {
    const { category, title, content, example, isLearned } = req.body;
    
    if (!['vocabulary', 'formula', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category không hợp lệ',
      });
    }
    
    let note = await Note.findOne({ userId: req.userId });
    
    // Nếu chưa có, tạo mới
    if (!note) {
      note = await Note.create({
        userId: req.userId,
        vocabulary: [],
        formula: [],
        other: []
      });
    }
    
    // Thêm item mới vào mảng
    note[category].push({
      title,
      content,
      example: example || '',
      isLearned: isLearned || false
    });
    
    await note.save();
    
    // Lấy item vừa tạo (phần tử cuối cùng)
    const newItem = note[category][note[category].length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Tạo note item thành công',
      data: newItem,
    });
  } catch (error) {
    console.error('Error in createNoteItem:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo note item',
    });
  }
};

/**
 * Cập nhật note item
 */
const updateNoteItem = async (req, res) => {
  try {
    const { category, itemId } = req.params;
    const { title, content, example, isLearned } = req.body;
    
    if (!['vocabulary', 'formula', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category không hợp lệ',
      });
    }
    
    const note = await Note.findOne({ userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note không tồn tại',
      });
    }
    
    const item = note[category].id(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Note item không tồn tại',
      });
    }
    
    // Cập nhật các trường
    if (title !== undefined) item.title = title;
    if (content !== undefined) item.content = content;
    if (example !== undefined) item.example = example;
    if (isLearned !== undefined) item.isLearned = isLearned;
    
    await note.save();
    
    res.json({
      success: true,
      message: 'Cập nhật note item thành công',
      data: item,
    });
  } catch (error) {
    console.error('Error in updateNoteItem:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Dữ liệu không hợp lệ',
        errors: Object.values(error.errors).map(err => err.message),
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật note item',
    });
  }
};

/**
 * Xóa note item
 */
const deleteNoteItem = async (req, res) => {
  try {
    const { category, itemId } = req.params;
    
    if (!['vocabulary', 'formula', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category không hợp lệ',
      });
    }
    
    const note = await Note.findOne({ userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note không tồn tại',
      });
    }
    
    const item = note[category].id(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Note item không tồn tại',
      });
    }
    
    item.remove();
    await note.save();
    
    res.json({
      success: true,
      message: 'Xóa note item thành công',
    });
  } catch (error) {
    console.error('Error in deleteNoteItem:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa note item',
    });
  }
};

/**
 * Tìm kiếm notes
 */
const searchNotes = async (req, res) => {
  try {
    const { q, category, isLearned, page = 1, limit = 20 } = req.query;
    
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập từ khóa tìm kiếm',
      });
    }
    
    const note = await Note.findOne({ userId: req.userId });
    
    if (!note) {
      return res.json({
        success: true,
        data: [],
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
          pages: 0
        }
      });
    }
    
    // Tìm kiếm trong tất cả categories hoặc category cụ thể
    const categoriesToSearch = category && ['vocabulary', 'formula', 'other'].includes(category)
      ? [category]
      : ['vocabulary', 'formula', 'other'];
    
    let results = [];
    
    categoriesToSearch.forEach(cat => {
      const items = (note[cat] || []).filter(item => {
        const matchesSearch = 
          item.title.toLowerCase().includes(q.toLowerCase()) ||
          item.content.toLowerCase().includes(q.toLowerCase()) ||
          item.example.toLowerCase().includes(q.toLowerCase());
        
        const matchesLearned = isLearned === undefined 
          ? true 
          : item.isLearned === (isLearned === 'true');
        
        return matchesSearch && matchesLearned;
      });
      
      // Thêm category vào mỗi item để biết nó thuộc category nào
      results.push(...items.map(item => ({
        ...item.toObject(),
        category: cat
      })));
    });
    
    // Sort theo updatedAt
    results.sort((a, b) => {
      return (b.updatedAt || new Date(0)) - (a.updatedAt || new Date(0));
    });
    
    // Pagination
    const total = results.length;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedResults = results.slice(skip, skip + parseInt(limit));
    
    res.json({
      success: true,
      data: paginatedResults,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in searchNotes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tìm kiếm notes',
    });
  }
};

/**
 * Toggle trạng thái isLearned của note item
 */
const toggleLearned = async (req, res) => {
  try {
    const { category, itemId } = req.params;
    
    if (!['vocabulary', 'formula', 'other'].includes(category)) {
      return res.status(400).json({
        success: false,
        message: 'Category không hợp lệ',
      });
    }
    
    const note = await Note.findOne({ userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Note không tồn tại',
      });
    }
    
    const item = note[category].id(itemId);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Note item không tồn tại',
      });
    }
    
    item.isLearned = !item.isLearned;
    await note.save();
    
    res.json({
      success: true,
      message: `Đã ${item.isLearned ? 'đánh dấu' : 'bỏ đánh dấu'} đã học`,
      data: item,
    });
  } catch (error) {
    console.error('Error in toggleLearned:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật trạng thái',
    });
  }
};

/**
 * Lấy thống kê notes của user
 */
const getNotesStats = async (req, res) => {
  try {
    const note = await Note.findOne({ userId: req.userId });
    
    if (!note) {
      return res.json({
        success: true,
        data: {
          vocabulary: { total: 0, learned: 0, notLearned: 0 },
          formula: { total: 0, learned: 0, notLearned: 0 },
          other: { total: 0, learned: 0, notLearned: 0 },
          total: { total: 0, learned: 0, notLearned: 0 }
        }
      });
    }
    
    const stats = {
      vocabulary: { total: 0, learned: 0, notLearned: 0 },
      formula: { total: 0, learned: 0, notLearned: 0 },
      other: { total: 0, learned: 0, notLearned: 0 },
      total: { total: 0, learned: 0, notLearned: 0 }
    };
    
    ['vocabulary', 'formula', 'other'].forEach(category => {
      const items = note[category] || [];
      stats[category].total = items.length;
      stats[category].learned = items.filter(item => item.isLearned).length;
      stats[category].notLearned = stats[category].total - stats[category].learned;
      
      stats.total.total += stats[category].total;
      stats.total.learned += stats[category].learned;
      stats.total.notLearned += stats[category].notLearned;
    });
    
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in getNotesStats:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thống kê',
    });
  }
};

/**
 * Tạo notes mặc định cho user nếu chưa có
 */
const createDefaultNotes = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Kiểm tra xem user đã có notes chưa
    const existingNote = await Note.findOne({ userId });
    
    if (existingNote) {
      return res.json({
        success: true,
        message: 'User đã có notes rồi',
        data: existingNote.toJSON()
      });
    }
    
    // Tạo document mới với 3 mảng rỗng
    const note = await Note.create({
      userId,
      vocabulary: [],
      formula: [],
      other: []
    });
    
    res.status(201).json({
      success: true,
      message: 'Đã tạo notes mặc định',
      data: note.toJSON()
    });
  } catch (error) {
    console.error('Error in createDefaultNotes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo notes mặc định',
    });
  }
};

module.exports = {
  getNotes,
  getNotesByCategory,
  getNoteItemById,
  createNoteItem,
  updateNoteItem,
  deleteNoteItem,
  searchNotes,
  toggleLearned,
  getNotesStats,
  createDefaultNotes,
};
