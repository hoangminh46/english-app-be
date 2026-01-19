const axios = require('axios');
const config = require('../config/config');

class AIService {
  /**
   * Generates a response using multiple AI providers with fallback logic.
   * Priority: Groq -> OpenRouter -> Gemini
   */
  async generateWithFallback(prompt, options = {}) {
    const { 
      systemMessage = 'You are a helpful assistant.',
      tag = 'AI',
      jsonMode = true,
      history = [],
      returnFullResponse = false,
      maxTokens = 8192,
      serviceSpecificCleaning = (content) => content
    } = options;

    try {
      // 1. Try Groq
      return await this.callGroqAPI(prompt, systemMessage, tag, jsonMode, history, returnFullResponse, maxTokens, serviceSpecificCleaning);
    } catch (error) {
      if (error.response?.status === 429 || error.message.includes('Rate limit')) {
        console.warn(`[${tag}] Groq Rate Limit. Falling back to OpenRouter...`);
        try {
          // 2. Try OpenRouter
          return await this.callOpenRouterAPI(prompt, systemMessage, tag, jsonMode, history, returnFullResponse, maxTokens, serviceSpecificCleaning);
        } catch (orError) {
          console.warn(`[${tag}] OpenRouter Error, falling back to Gemini...`, orError.message);
          // 3. Last fallback: Gemini
          return await this.callGeminiAPI(prompt, tag, jsonMode, history, returnFullResponse, maxTokens, serviceSpecificCleaning);
        }
      }
      
      console.warn(`[${tag}] Groq Error, falling back to Gemini...`, error.message);
      return await this.callGeminiAPI(prompt, tag, jsonMode, history, returnFullResponse, maxTokens, serviceSpecificCleaning);
    }
  }

  async callGroqAPI(prompt, systemMessage, tag, jsonMode, history, returnFullResponse, maxTokens, cleaner) {
    const messages = [
      { role: 'system', content: systemMessage },
      ...history,
      { role: 'user', content: prompt }
    ];

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.7,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const usage = response.data.usage;
    const content = response.data.choices[0]?.message?.content;
    const processedContent = this.processAIResponse(content, cleaner, jsonMode);

    if (returnFullResponse) {
      return {
        content: processedContent,
        tokens_used: usage ? usage.total_tokens : 0
      };
    }
    return processedContent;
  }

  async callOpenRouterAPI(prompt, systemMessage, tag, jsonMode, history, returnFullResponse, maxTokens, cleaner) {
    const messages = [
      { role: 'system', content: systemMessage },
      ...history,
      { role: 'user', content: prompt }
    ];

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages,
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.7,
        max_tokens: maxTokens,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': config.frontendUrl,
          'X-Title': 'English Learning App'
        }
      }
    );

    const usage = response.data.usage;
    const content = response.data.choices[0]?.message?.content;
    const processedContent = this.processAIResponse(content, cleaner, jsonMode);

    if (returnFullResponse) {
      return {
        content: processedContent,
        tokens_used: usage ? usage.total_tokens : 0
      };
    }
    return processedContent;
  }

  async callGeminiAPI(prompt, tag, jsonMode, history, returnFullResponse, maxTokens, cleaner) {
    // Formulate history for Gemini
    const contents = history.map(h => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.content }]
    }));
    
    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
      {
        contents,
        generationConfig: {
          temperature: 0.9,
          topK: 50,
          topP: 0.97,
          maxOutputTokens: maxTokens,
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const usage = response.data.usageMetadata;
    if (response.data?.candidates?.[0]?.content?.parts) {
      const content = response.data.candidates[0].content.parts[0].text;
      const processedContent = this.processAIResponse(content, cleaner, jsonMode);

      if (returnFullResponse) {
        return {
          content: processedContent,
          tokens_used: usage ? usage.totalTokenCount : 0
        };
      }
      return processedContent;
    }
    
    throw new Error('Không nhận được phản hồi từ Gemini');
  }

  processAIResponse(content, cleaner, jsonMode = true) {
    if (!content) {
      throw new Error('Không nhận được phản hồi từ AI');
    }

    let cleaned = content.replace(/```json|```/g, '').trim();

    if (jsonMode) {
      // Chế độ cũ (Quiz, Scramble): Lọc sạch tuyệt đối để parse JSON an toàn
      cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
    } else {
      // Chế độ mới (Chat Assistant): Giữ lại xuống dòng và tab để hiển thị Markdown
      cleaned = cleaned.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
    }

    // Apply service-specific processing if provided
    try {
      if (jsonMode || cleaned.startsWith('{') || cleaned.startsWith('[')) {
        const parsed = JSON.parse(cleaned);
        return cleaner ? cleaner(parsed) : parsed;
      }
      return cleaner ? cleaner(cleaned) : cleaned;
    } catch (e) {
      if (jsonMode) console.error('AI JSON Parsing Error:', e.message);
      return cleaner ? cleaner(cleaned) : cleaned;
    }
  }
}

module.exports = new AIService();
