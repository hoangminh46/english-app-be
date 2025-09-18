const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');

// POST /api/quiz/generate - Generate custom quiz
router.post('/generate', quizController.generateQuiz);

// POST /api/quiz/quick - Generate quick quiz
router.post('/quick', quizController.generateQuickQuiz);

module.exports = router;
