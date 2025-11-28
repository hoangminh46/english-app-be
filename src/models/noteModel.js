// Note types
const NoteTypes = {
  VOCABULARY: 'vocabulary',
  FORMULA: 'formula',
  OTHER: 'other'
};

// Note model structure
class Note {
  constructor(data) {
    this.id = data.id || this.generateId();
    this.type = data.type;
    this.title = data.title;
    this.content = data.content;
    this.example = data.example || '';
  }

  generateId() {
    return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validate() {
    const errors = [];

    if (!this.type || !Object.values(NoteTypes).includes(this.type)) {
      errors.push({ field: 'type', message: 'Invalid note type' });
    }

    if (!this.title || this.title.trim().length === 0) {
      errors.push({ field: 'title', message: 'Title is required' });
    }

    if (!this.content || this.content.trim().length === 0) {
      errors.push({ field: 'content', message: 'Content is required' });
    }

    if (this.title && this.title.length > 200) {
      errors.push({ field: 'title', message: 'Title must not exceed 200 characters' });
    }

    if (this.content && this.content.length > 5000) {
      errors.push({ field: 'content', message: 'Content must not exceed 5000 characters' });
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      content: this.content,
      example: this.example,
    };
  }
}

module.exports = { Note, NoteTypes };

