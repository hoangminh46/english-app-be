const quizService = require('../services/quizService');

const generateQuiz = async (req, res, next) => {
  try {
    const { 
      language, 
      quantity, 
      mainTopic, 
      subtopics, 
      difficulty, 
      audience, 
      category 
    } = req.body;

    // Validation
    if (!language || !quantity || !mainTopic || !difficulty) {
      return res.status(400).json({
        error: 'Các trường language, quantity, mainTopic, difficulty là bắt buộc'
      });
    }

    const quiz = await quizService.generateCustomQuiz({
      language,
      quantity,
      mainTopic,
      subtopics: subtopics || [],
      difficulty,
      audience: audience || 'general',
      category: category || 'mixed'
    });

    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

const generateQuickQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.generateQuickQuiz();
    res.json(quiz);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuiz,
  generateQuickQuiz
};
