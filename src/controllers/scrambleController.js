const scrambleService = require('../services/scrambleService');

const generateScramble = async (req, res, next) => {
  try {
    const { difficulty, quantity, topics } = req.body;

    // Validation
    if (!difficulty || !quantity || !topics) {
      return res.status(400).json({
        error: 'Các trường difficulty, quantity, topics là bắt buộc'
      });
    }

    const scramble = await scrambleService.generateWordScramble({
      difficulty,
      quantity,
      topics
    });

    res.json(scramble);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateScramble
};
