const { NoteTypes } = require('../models/noteModel');

const validateNoteCreate = (req, res, next) => {
  const { type, title, content } = req.body;
  const errors = [];

  // Validate type
  if (!type) {
    errors.push({ field: 'type', message: 'Type is required' });
  } else if (!Object.values(NoteTypes).includes(type)) {
    errors.push({ 
      field: 'type', 
      message: `Invalid type. Must be one of: ${Object.values(NoteTypes).join(', ')}` 
    });
  }

  // Validate title
  if (!title) {
    errors.push({ field: 'title', message: 'Title is required' });
  } else if (typeof title !== 'string') {
    errors.push({ field: 'title', message: 'Title must be a string' });
  } else if (title.trim().length === 0) {
    errors.push({ field: 'title', message: 'Title cannot be empty' });
  } else if (title.length > 200) {
    errors.push({ field: 'title', message: 'Title must not exceed 200 characters' });
  }

  // Validate content
  if (!content) {
    errors.push({ field: 'content', message: 'Content is required' });
  } else if (typeof content !== 'string') {
    errors.push({ field: 'content', message: 'Content must be a string' });
  } else if (content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Content cannot be empty' });
  } else if (content.length > 5000) {
    errors.push({ field: 'content', message: 'Content must not exceed 5000 characters' });
  }

  // Validate example (optional)
  if (req.body.example !== undefined) {
    if (typeof req.body.example !== 'string') {
      errors.push({ field: 'example', message: 'Example must be a string' });
    } else if (req.body.example.length > 1000) {
      errors.push({ field: 'example', message: 'Example must not exceed 1000 characters' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors
      }
    });
  }

  next();
};

const validateNoteUpdate = (req, res, next) => {
  const errors = [];

  // For update, all fields are optional, but if provided, must be valid
  if (req.body.type !== undefined) {
    if (!Object.values(NoteTypes).includes(req.body.type)) {
      errors.push({ 
        field: 'type', 
        message: `Invalid type. Must be one of: ${Object.values(NoteTypes).join(', ')}` 
      });
    }
  }

  if (req.body.title !== undefined) {
    if (typeof req.body.title !== 'string') {
      errors.push({ field: 'title', message: 'Title must be a string' });
    } else if (req.body.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title cannot be empty' });
    } else if (req.body.title.length > 200) {
      errors.push({ field: 'title', message: 'Title must not exceed 200 characters' });
    }
  }

  if (req.body.content !== undefined) {
    if (typeof req.body.content !== 'string') {
      errors.push({ field: 'content', message: 'Content must be a string' });
    } else if (req.body.content.trim().length === 0) {
      errors.push({ field: 'content', message: 'Content cannot be empty' });
    } else if (req.body.content.length > 5000) {
      errors.push({ field: 'content', message: 'Content must not exceed 5000 characters' });
    }
  }

  if (req.body.example !== undefined) {
    if (typeof req.body.example !== 'string') {
      errors.push({ field: 'example', message: 'Example must be a string' });
    } else if (req.body.example.length > 1000) {
      errors.push({ field: 'example', message: 'Example must not exceed 1000 characters' });
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors
      }
    });
  }

  next();
};

module.exports = {
  validateNoteCreate,
  validateNoteUpdate
};

