const fs = require('fs').promises;
const path = require('path');
const { Note } = require('../models/noteModel');

class NoteService {
  constructor() {
    this.dataFilePath = path.join(__dirname, '../../data/notes.json');
    this.ensureDataFileExists();
  }

  async ensureDataFileExists() {
    try {
      const dir = path.dirname(this.dataFilePath);
      await fs.mkdir(dir, { recursive: true });
      
      try {
        await fs.access(this.dataFilePath);
      } catch {
        await fs.writeFile(this.dataFilePath, JSON.stringify({ notes: [] }, null, 2));
      }
    } catch (error) {
      console.error('Error ensuring data file exists:', error);
    }
  }

  async readNotesFromFile() {
    try {
      const data = await fs.readFile(this.dataFilePath, 'utf-8');
      const jsonData = JSON.parse(data);
      return jsonData.notes || [];
    } catch (error) {
      console.error('Error reading notes from file:', error);
      return [];
    }
  }

  async writeNotesToFile(notes) {
    try {
      await fs.writeFile(
        this.dataFilePath,
        JSON.stringify({ notes }, null, 2),
        'utf-8'
      );
    } catch (error) {
      console.error('Error writing notes to file:', error);
      throw new Error('Failed to save notes');
    }
  }

  async getAllNotes(filters = {}) {
    const notes = await this.readNotesFromFile();
    
    let filteredNotes = notes;

    // Filter by type if provided
    if (filters.type) {
      filteredNotes = filteredNotes.filter(note => note.type === filters.type);
    }

    // Filter by tags if provided
    if (filters.tags && filters.tags.length > 0) {
      filteredNotes = filteredNotes.filter(note =>
        filters.tags.some(tag => note.tags.includes(tag))
      );
    }

    // Filter by difficulty if provided
    if (filters.difficulty) {
      filteredNotes = filteredNotes.filter(note => note.difficulty === filters.difficulty);
    }

    // Sort by updatedAt descending (newest first)
    filteredNotes.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

    return filteredNotes;
  }

  async getNoteById(id) {
    const notes = await this.readNotesFromFile();
    const note = notes.find(n => n.id === id);
    
    if (!note) {
      throw new Error('Note not found');
    }

    return note;
  }

  async createNote(noteData) {
    const note = new Note(noteData);
    
    // Validate note
    const validation = note.validate();
    if (!validation.isValid) {
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    const notes = await this.readNotesFromFile();
    
    // Check for duplicate title
    const existingNote = notes.find(n => n.title.toLowerCase() === note.title.toLowerCase());
    if (existingNote) {
      const error = new Error('Validation failed');
      error.details = [{ field: 'title', message: 'A note with this title already exists' }];
      throw error;
    }

    notes.push(note.toJSON());
    await this.writeNotesToFile(notes);

    return note.toJSON();
  }

  async updateNote(id, updateData) {
    const notes = await this.readNotesFromFile();
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    const existingNote = notes[noteIndex];
    
    // Merge existing data with update data
    const updatedNoteData = {
      ...existingNote,
      ...updateData,
      id: existingNote.id, // Preserve ID
      createdAt: existingNote.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString() // Update modification date
    };

    const updatedNote = new Note(updatedNoteData);
    
    // Validate updated note
    const validation = updatedNote.validate();
    if (!validation.isValid) {
      const error = new Error('Validation failed');
      error.details = validation.errors;
      throw error;
    }

    // Check for duplicate title (excluding current note)
    if (updateData.title) {
      const duplicateNote = notes.find(
        n => n.id !== id && n.title.toLowerCase() === updateData.title.toLowerCase()
      );
      if (duplicateNote) {
        const error = new Error('Validation failed');
        error.details = [{ field: 'title', message: 'A note with this title already exists' }];
        throw error;
      }
    }

    notes[noteIndex] = updatedNote.toJSON();
    await this.writeNotesToFile(notes);

    return updatedNote.toJSON();
  }

  async deleteNote(id) {
    const notes = await this.readNotesFromFile();
    const noteIndex = notes.findIndex(n => n.id === id);

    if (noteIndex === -1) {
      throw new Error('Note not found');
    }

    notes.splice(noteIndex, 1);
    await this.writeNotesToFile(notes);

    return true;
  }

  async searchNotes(searchTerm) {
    const notes = await this.readNotesFromFile();
    
    if (!searchTerm || searchTerm.trim().length === 0) {
      return notes;
    }

    const term = searchTerm.toLowerCase();
    
    return notes.filter(note =>
      note.title.toLowerCase().includes(term) ||
      note.content.toLowerCase().includes(term) ||
      (note.example && note.example.toLowerCase().includes(term))
    );
  }
}

module.exports = new NoteService();

