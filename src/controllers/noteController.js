const noteService = require('../services/noteService');

class NoteController {
  // Get all notes with optional filters
  async getAllNotes(req, res) {
    try {
      const { type, tags, difficulty, search } = req.query;
      
      let notes;
      
      if (search) {
        notes = await noteService.searchNotes(search);
      } else {
        const filters = {};
        if (type) filters.type = type;
        if (tags) filters.tags = tags.split(',');
        if (difficulty) filters.difficulty = difficulty;
        
        notes = await noteService.getAllNotes(filters);
      }

      res.json({
        success: true,
        data: notes,
        message: 'Notes retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting notes:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch notes',
          details: [{ message: error.message }]
        }
      });
    }
  }

  // Get a single note by ID
  async getNoteById(req, res) {
    try {
      const { id } = req.params;
      const note = await noteService.getNoteById(id);

      res.json({
        success: true,
        data: note,
        message: 'Note retrieved successfully'
      });
    } catch (error) {
      console.error('Error getting note:', error);
      
      if (error.message === 'Note not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Note not found',
            details: [{ message: error.message }]
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch note',
          details: [{ message: error.message }]
        }
      });
    }
  }

  // Create a new note
  async createNote(req, res) {
    try {
      const { type, title, content, example } = req.body;

      const noteData = {
        type,
        title,
        content,
        example,
      };

      const newNote = await noteService.createNote(noteData);

      res.status(201).json({
        success: true,
        data: newNote,
        message: 'Note created successfully'
      });
    } catch (error) {
      console.error('Error creating note:', error);

      if (error.details) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message || 'Validation failed',
            details: error.details
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create note',
          details: [{ message: error.message }]
        }
      });
    }
  }

  // Update a note
  async updateNote(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updatedNote = await noteService.updateNote(id, updateData);

      res.json({
        success: true,
        data: updatedNote,
        message: 'Note updated successfully'
      });
    } catch (error) {
      console.error('Error updating note:', error);

      if (error.message === 'Note not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Note not found',
            details: [{ message: error.message }]
          }
        });
      }

      if (error.details) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: error.message || 'Validation failed',
            details: error.details
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'UPDATE_ERROR',
          message: 'Failed to update note',
          details: [{ message: error.message }]
        }
      });
    }
  }

  // Delete a note
  async deleteNote(req, res) {
    try {
      const { id } = req.params;
      await noteService.deleteNote(id);

      res.json({
        success: true,
        message: 'Note deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting note:', error);

      if (error.message === 'Note not found') {
        return res.status(404).json({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Note not found',
            details: [{ message: error.message }]
          }
        });
      }

      res.status(500).json({
        success: false,
        error: {
          code: 'DELETE_ERROR',
          message: 'Failed to delete note',
          details: [{ message: error.message }]
        }
      });
    }
  }
}

module.exports = new NoteController();

