const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    picture: {
      type: String,
      default: null,
    },
    firstName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    audience: {
      type: String,
      enum: ['student', 'college', 'worker', 'senior'],
      default: null,
      index: true,
    },
    language: {
      type: String,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // Tự động thêm createdAt và updatedAt
  }
);

// Index để tối ưu query
userSchema.index({ googleId: 1 });
userSchema.index({ email: 1 });
userSchema.index({ audience: 1 });
userSchema.index({ language: 1 });

// Method để lấy thông tin user (không bao gồm sensitive data)
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  return {
    id: userObject._id,
    email: userObject.email,
    name: userObject.name,
    picture: userObject.picture,
    firstName: userObject.firstName,
    lastName: userObject.lastName,
    audience: userObject.audience,
    language: userObject.language,
    createdAt: userObject.createdAt,
    updatedAt: userObject.updatedAt,
  };
};

const User = mongoose.model('User', userSchema);

module.exports = User;

