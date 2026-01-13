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
      tag = 'AI', // For logging identification
      jsonMode = true,
      serviceSpecificCleaning = (content) => content
    } = options;

    try {
      // 1. Try Groq
      return await this.callGroqAPI(prompt, systemMessage, tag, jsonMode, serviceSpecificCleaning);
    } catch (error) {
      if (error.response?.status === 429 || error.message.includes('Rate limit')) {
        console.warn(`[${tag}] Groq Rate Limit. Falling back to OpenRouter...`);
        try {
          // 2. Try OpenRouter
          return await this.callOpenRouterAPI(prompt, systemMessage, tag, jsonMode, serviceSpecificCleaning);
        } catch (orError) {
          console.warn(`[${tag}] OpenRouter Error, falling back to Gemini...`, orError.message);
          // 3. Last fallback: Gemini
          return await this.callGeminiAPI(prompt, tag, serviceSpecificCleaning);
        }
      }
      
      console.warn(`[${tag}] Groq Error, falling back to Gemini...`, error.message);
      return await this.callGeminiAPI(prompt, tag, serviceSpecificCleaning);
    }
  }

  async callGroqAPI(prompt, systemMessage, tag, jsonMode, cleaner) {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.7,
        max_tokens: 8192,
      },
      {
        headers: {
          'Authorization': `Bearer ${config.groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const usage = response.data.usage;
    if (usage) {
      console.log(`[Groq-${tag} Usage] Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`);
    }

    const content = response.data.choices[0]?.message?.content;
    return this.processAIResponse(content, cleaner);
  }

  async callOpenRouterAPI(prompt, systemMessage, tag, jsonMode, cleaner) {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: prompt }
        ],
        response_format: jsonMode ? { type: 'json_object' } : undefined,
        temperature: 0.7,
        max_tokens: 8192,
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
    if (usage) {
      console.log(`[OpenRouter-${tag} Usage] Prompt: ${usage.prompt_tokens}, Completion: ${usage.completion_tokens}, Total: ${usage.total_tokens}`);
    }

    const content = response.data.choices[0]?.message?.content;
    return this.processAIResponse(content, cleaner);
  }

  async callGeminiAPI(prompt, tag, cleaner) {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topK: 50,
          topP: 0.97,
          maxOutputTokens: 8192,
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );

    const usage = response.data.usageMetadata;
    if (usage) {
      console.log(`[Gemini-${tag} Usage] Prompt: ${usage.promptTokenCount}, Completion: ${usage.candidatesTokenCount}, Total: ${usage.totalTokenCount}`);
    }

    if (response.data?.candidates?.[0]?.content?.parts) {
      const content = response.data.candidates[0].content.parts[0].text;
      return this.processAIResponse(content, cleaner);
    }
    
    throw new Error('Không nhận được phản hồi từ Gemini');
  }

  processAIResponse(content, cleaner) {
    if (!content) {
      throw new Error('Không nhận được phản hồi từ AI');
    }

    // Basic cleaning for any AI response
    let cleaned = content.replace(/```json|```/g, '').trim();
    cleaned = cleaned.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');

    // Apply service-specific processing if provided
    try {
      // If it looks like JSON or we are in JSON mode, try to parse
      if (cleaned.startsWith('{') || cleaned.startsWith('[')) {
        const parsed = JSON.parse(cleaned);
        return cleaner ? cleaner(parsed) : parsed;
      }
      return cleaner ? cleaner(cleaned) : cleaned;
    } catch (e) {
      console.error('AI Response Processing Error:', e.message);
      // If parsing fails, retun cleaned string as fallback
      return cleaned;
    }
  }
}

module.exports = new AIService();
