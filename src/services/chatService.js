const aiService = require('./aiService');

class ChatService {
  async generateResponse(prompt) {
    return await aiService.generateWithFallback(prompt, {
      tag: 'Chat',
      systemMessage: 'You are a helpful and professional English teacher. Provide clear, supportive, and educational responses.',
      jsonMode: false,
      serviceSpecificCleaning: (content) => this.cleanResponse(content)
    });
  }

  cleanResponse(response) {
    if (typeof response !== 'string') return response;
    // Clean the string before parsing
    let cleaned = response.trim();
    // Handle special Unicode characters
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
    return cleaned;
  }
}

module.exports = new ChatService();
