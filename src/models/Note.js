const mongoose = require('mongoose');

// Schema cho một note item trong mảng
const noteItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 5000
  },
  example: {
    type: String,
    trim: true,
    maxlength: 1000,
    default: ''
  },
  isLearned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true // createdAt và updatedAt tự động cho mỗi item
});

// Schema chính cho Notes
const noteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Mỗi user chỉ có một document Note
    index: true
  },
  vocabulary: {
    type: [noteItemSchema],
    default: []
  },
  formula: {
    type: [noteItemSchema],
    default: []
  },
  other: {
    type: [noteItemSchema],
    default: []
  }
}, {
  timestamps: true // createdAt và updatedAt cho document chính
});

// Index để tối ưu query
noteSchema.index({ userId: 1 });

// Method để lấy thông tin note
noteSchema.methods.toJSON = function () {
  const noteObject = this.toObject();
  return {
    id: noteObject._id,
    userId: noteObject.userId,
    vocabulary: noteObject.vocabulary || [],
    formula: noteObject.formula || [],
    other: noteObject.other || [],
    createdAt: noteObject.createdAt,
    updatedAt: noteObject.updatedAt,
  };
};

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
