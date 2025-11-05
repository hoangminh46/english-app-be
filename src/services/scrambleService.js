const axios = require('axios');
const config = require('../config/config');

class ScrambleService {
  async generateWordScramble(params) {
    const { difficulty, quantity, topics } = params;

    const prompt = this.buildScramblePrompt(difficulty, quantity, topics);
    return await this.callGeminiAPI(prompt);
  }

  buildScramblePrompt(difficulty, quantity, topics = []) {
    const wordLengthRange = this.getWordLengthRange(difficulty);
  
    const perspectives = [
      'language teacher',
      'vocabulary expert',
      'educational game designer',
      'university linguistics lecturer',
      'language learning app developer'
    ];
  
    const approaches = [
      'real-world scenario-based learning',
      'contextual communication approach',
      'functional language approach',
      'skill-oriented teaching method'
    ];
  
    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);
    const randomPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];
    const randomApproach = approaches[Math.floor(Math.random() * approaches.length)];
    const topicList = topics.length ? topics.join(', ') : 'random English vocabulary';
  
    return `
  You are an experienced ${randomPerspective} with 15 years of expertise applying the ${randomApproach} method.
  Seed: ${randomSeed}-${timestamp}
  
  TASK:
  Generate ${quantity} English **word scramble puzzles** (single words or short phrases).
  
  CONTEXT:
  - Difficulty: ${difficulty}
  - Topics: ${topicList}
  - Randomized order (no predictable sequence)
  
  WORD LENGTH RULES:
  1. Include only words or phrases between ${wordLengthRange.min} and ${wordLengthRange.max} letters long.
  2. Exclude any word outside this range (including compound words if total length mismatches).
  
  VOCABULARY SELECTION:
  1. Focus on practical, real-life vocabulary.
  2. Include a balanced mix of:
     - Single words
     - Common phrases
     - Compound words
     - Words with prefixes or suffixes
  3. Maintain part-of-speech balance:
     - 30% nouns
     - 30% verbs
     - 20% adjectives
     - 20% adverbs or others
  
  SCRAMBLING RULES:
  1. Rearrange letters so that:
     - No two adjacent letters from the original remain together.
     - At least 70% of letter positions differ from the original.
  2. Ensure the scrambled result is solvable and not nonsensical.
  3. All words must be UPPERCASE (e.g., "COMMUNICATION").
  
  CONTENT STRUCTURE:
  Each puzzle must include:
  - **word**: original word or phrase (uppercase)
  - **scrambled**: shuffled version following the above rules
  - **hint** (Vietnamese): one of the following types —
    - Short definition
    - Usage situation
    - Synonym or antonym
    - Real-life example
  - **explanation** (object with separate fields):
    - **meaning** (Vietnamese): meaning of the word
    - **pronunciation** (IPA): IPA pronunciation in format "/.../"
    - **partOfSpeech** (Vietnamese): part of speech (danh từ, động từ, tính từ, etc.)
    - **example** (English): short example sentence in English
    - **exampleTranslation** (Vietnamese): Vietnamese translation of the example sentence
  
  DIFFICULTY LEVELS:
  - Basic → very common everyday words
  - Intermediate → moderately frequent words or expressions
  - Advanced → specialized or academic terms still useful in practice
  
  OUTPUT FORMAT:
  Return **pure JSON only**, no markdown, comments, or special characters.
  Use the following structure:
  
  {
    "words": [
      {
        "id": 1,
        "word": "ORIGINAL WORD",
        "scrambled": "SCRAMBLED VERSION",
        "hint": "Vietnamese hint",
        "explanation": {
          "meaning": "Meaning in Vietnamese",
          "pronunciation": "/IPA pronunciation/",
          "partOfSpeech": "danh từ/động từ/tính từ",
          "example": "Short example sentence in English",
          "exampleTranslation": "Vietnamese translation of the example"
        }
      }
    ]
  }
  
  VALIDATION:
  - Each entry must meet all word length and category rules.
  - No duplicates or repeated scrambles.
  - Grammar, logic, and meaning must be correct and contextually valid.
  - All hints and explanation fields (meaning, partOfSpeech, exampleTranslation) must be natural, short, and in Vietnamese.
  - Example sentences must be in natural English and grammatically correct.
  - Example translations must accurately reflect the meaning of the English example.
    `.trim();
  }
  

  getWordLengthRange(difficulty) {
    switch(difficulty) {
      case 'Cơ bản':
        return {min: 3, max: 5};
      case 'Trung bình':
        return {min: 5, max: 7};
      case 'Nâng cao':
        return {min: 7, max: 9};
      default:
        return {min: 3, max: 9};
    }
  }

  async callGeminiAPI(prompt) {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${config.geminiApiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.9,
            topK: 50,
            topP: 0.97,
            maxOutputTokens: 4096,
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      let aiResponse = '';
      if (response.data?.candidates?.[0]?.content?.parts) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
        
        aiResponse = aiResponse.replace(/```json|```/g, '').trim();
        aiResponse = aiResponse.trim();
        aiResponse = aiResponse.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
        
        const jsonResponse = JSON.parse(aiResponse);
        return jsonResponse;
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ từ AI');
      }
    } catch (error) {
      console.error('Scramble service error:', error.response?.data || error.message);
      throw new Error('Lỗi khi tạo câu đố sắp xếp chữ');
    }
  }
}

module.exports = new ScrambleService();
