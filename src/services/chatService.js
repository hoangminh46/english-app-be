const axios = require('axios');
const config = require('../config/config');

class ChatService {
  async generateResponse(prompt) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.9,
            topK: 50,
            topP: 0.97,
            maxOutputTokens: 8192,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Extract response from Gemini API
      let aiResponse = '';
      if (response.data && 
          response.data.candidates && 
          response.data.candidates[0] &&
          response.data.candidates[0].content &&
          response.data.candidates[0].content.parts) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
      }
      
      // Clean the response
      aiResponse = this.cleanResponse(aiResponse);
      
      return aiResponse;
    } catch (error) {
      console.error('Chat service error:', error.response?.data || error.message);
      throw new Error('Lỗi khi tạo phản hồi từ AI');
    }
  }

  cleanResponse(response) {
    // Clean the string before parsing
    let cleaned = response.trim();
    // Handle special Unicode characters
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
    return cleaned;
  }
}

module.exports = new ChatService();
