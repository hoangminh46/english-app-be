const chatService = require('../services/chatService');

const chatWithAI = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt là bắt buộc' 
      });
    }

    const response = await chatService.generateResponse(prompt);
    
    res.json({ response });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  chatWithAI
};
