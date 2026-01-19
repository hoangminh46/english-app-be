const chatService = require('../services/chatService');
const { v4: uuidv4 } = require('uuid');

const chatWithAI = async (req, res, next) => {
  try {
    const { message, context, history } = req.body;
    
    if (!message) {
      return res.status(400).json({ 
        success: false,
        data: null,
        error: 'Message là bắt buộc anh nhé!' 
      });
    }

    const aiResponse = await chatService.generateResponse(message, context, history || []);
    
    // session_id có thể lấy từ session hiện tại hoặc tạo mới nếu chưa có
    const sessionId = req.sessionID || uuidv4();

    res.json({
      success: true,
      data: {
        answer: aiResponse.content,
        tokens_used: aiResponse.tokens_used,
        session_id: sessionId
      },
      error: null
    });
  } catch (error) {
    console.error('Chat Assistant Error:', error);
    res.status(500).json({
      success: false,
      data: null,
      error: 'Ôi, hình như có lỗi gì đó rồi anh ơi! Để em kiểm tra lại nha 😅'
    });
  }
};

module.exports = {
  chatWithAI
};
