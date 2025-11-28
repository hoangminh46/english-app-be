const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { validateNoteCreate, validateNoteUpdate } = require('../validators/noteValidator');

// Get all notes (with optional filters: type, tags, difficulty, search)
router.get('/', noteController.getAllNotes.bind(noteController));

// Get a single note by ID
router.get('/:id', noteController.getNoteById.bind(noteController));

// Create a new note
router.post('/', validateNoteCreate, noteController.createNote.bind(noteController));

// Update a note
router.put('/:id', validateNoteUpdate, noteController.updateNote.bind(noteController));

// Delete a note
router.delete('/:id', noteController.deleteNote.bind(noteController));

module.exports = router;

