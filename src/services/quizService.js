const axios = require('axios');
const config = require('../config/config');
const aiService = require('./aiService');

class QuizService {
  async generateCustomQuiz(params) {
    const {
      language,
      quantity,
      mainTopic,
      subtopics,
      difficulty,
      audience,
      category
    } = params;

    const prompt = this.buildCustomQuizPrompt({
      language,
      quantity,
      mainTopic,
      subtopics,
      difficulty,
      audience,
      category
    });

    return await this.generateWithFallback(prompt, quantity);
  }

  async generateQuickQuiz() {
    const topics = [
      'giao tiếp hàng ngày',
      'công việc văn phòng',
      'du lịch và khách sạn',
      'mạng xã hội',
      'giải trí và thể thao',
      'ẩm thực và nhà hàng',
      'mua sắm và tiêu dùng',
      'giáo dục và học tập',
      'công nghệ thông tin',
      'sức khỏe và thể chất',
      'môi trường và thiên nhiên',
      'nghệ thuật và văn hóa'
    ];

    const selectedTopics = topics.sort(() => 0.5 - Math.random()).slice(0, 3);
    const distribution = this.generateRandomDistribution();

    const prompt = this.buildQuickQuizPrompt(selectedTopics, distribution);
    return await this.generateWithFallback(prompt, 10);
  }

  buildCustomQuizPrompt(params) {
    const { language, quantity, mainTopic, subtopics, difficulty, audience } = params;
    
    // Define difficulty constraints
    const diff = (difficulty || '').toLowerCase();
    let difficultyGuidelines = '';
    let explanationLength = '40-60';
    let persona = `expert ${language} teacher`;

    if (diff.includes('beginner') || diff.includes('cơ bản')) {
      explanationLength = '30-50';
      difficultyGuidelines = `
      - Level: CEFR A1-A2.
      - Vocabulary: High-frequency, everyday words.
      - Grammar: Simple tenses (present, past, future), basic sentence structures.
      - Tone: Encouraging, ultra-clear. Avoid complex idioms or academic jargon.`;
    } else if (diff.includes('intermediate') || diff.includes('trung cấp')) {
      explanationLength = '40-60';
      difficultyGuidelines = `
      - Level: CEFR B1-B2.
      - Vocabulary: Broad range of topics, common idioms, and work/social vocabulary.
      - Grammar: Compound/complex sentences, perfect tenses, conditionals, passive voice.
      - Tone: Natural and conversational.`;
    } else {
      // Advanced
      explanationLength = '50-70';
      persona = `world-class ${language} Professor specializing in academic testing (IELTS/TOEFL/GRE)`;
      difficultyGuidelines = `
      - Level: CEFR C1-C2.
      - Vocabulary: Academic, specialized, and low-frequency sophisticated words.
      - Grammar: Advanced structures (inversion, subjunctive, complex clauses, nuances).
      - Tone: Professional, academic, and highly sophisticated.`;
    }
    
    return `You are a ${persona}.

TASK:
Generate EXACTLY ${quantity} MCQs based on the following:

CORE SPECIFICATIONS:
- Language: ${language}
- Topic: ${mainTopic} (${subtopics.join(', ')})
- Difficulty Level: ${difficulty}
- Audience: ${audience}

DIFFICULTY RULES (MANDATORY):
${difficultyGuidelines}

PEDAGOGICAL REQUIREMENTS:
1. QUALITY: Questions must be contextually rich and grammatically perfect.
2. **UNIQUE ANSWER (CRITICAL)**: There must be ONLY ONE logically and grammatically correct answer. Avoid ambiguous questions where multiple options could fit (e.g., if the options are 4 different locations, the sentence MUST include a hint like "I need to buy medicine" to point to "pharmacy").
3. NO REDUNDANCY: The correct answer MUST NOT already exist in the question sentence.
4. NO INSTRUCTIONS: Only content in the "question" field.
5. NO CLUES: No base forms in parentheses.
6. OPTIONS: NO labels like "A.", "B.". Just clean text.
7. NEW WORDS: Extract only meaningful vocabulary. Avoid ultra-basic pronouns or articles.

DETAILED CONTENT (MANDATORY: VIETNAMESE):
- **LANGUAGE RULE**: All content in "explanation", "formula", "note", and "meaning" fields MUST BE WRITTEN IN VIETNAMESE. Failure to do so is a violation of the task.
- EXPLANATION: Clear, deeply educational, professional Vietnamese. Length: ~${explanationLength} words.
- FORMULA: Relevant grammar pattern (in Vietnamese) or "N/A".
- NOTE: High-level tips, common pitfalls, or cultural nuances in Vietnamese.
- NEW WORDS: Extract 3-5 words ONLY from the "question" text. **CRITICAL: DO NOT include words from the "options" or "correct_answer".** "meaning" field MUST be in Vietnamese.

OUTPUT FORMAT (STRICT):
1. **PURE JSON ONLY**: Do not include any text before or after the JSON block.
2. **NO MARKDOWN**: Do not wrap the response in \`\`\`json blocks.
3. **VALIDATION**: Ensure all quotes are balanced, commas are correctly placed, and the structure matches the example exactly.

JSON Schema to follow:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": 0,
      "explanation": { 
        "summary": "Nội dung giải thích...", 
        "formula": "Cấu trúc...", 
        "note": "Lưu ý..." 
      },
      "new_words": [
        { "word": "...", "pronunciation": "/.../", "meaning": "VN" }
      ]
    }
  ]
}
`.trim();
  }

  buildQuickQuizPrompt(selectedTopics, distribution) {
    return `You are an expert English teacher specializing in practical, real-life communication.

TASK:
Generate EXACTLY 10 professional MCQs based on the following:

CORE SPECIFICATIONS:
- Topics: ${selectedTopics.join(', ')}
- Distribution: Vocab ${distribution.vocabulary}, Grammar ${distribution.grammar}, Communication ${distribution.communication}
- Audience: English learners seeking real-life conversation skills.

PEDAGOGICAL REQUIREMENTS:
1. QUALITY: Questions must be contextually rich and grammatically perfect.
2. **UNIQUE ANSWER (CRITICAL)**: Ensure ONLY ONE option is correct. If using multiple similar nouns, provide context (e.g., "I'm hungry, where is the ___?" -> restaurant).
3. NO REDUNDANCY: The correct answer MUST NOT already exist in the sentence.
4. NO INSTRUCTIONS: Only content in the "question" field.
5. NO CLUES: No base forms in parentheses.
6. OPTIONS: NO labels like "A.", "B.". Just clean text.
7. NEW WORDS: Extract only meaningful vocabulary. Avoid ultra-basic pronouns or articles.

DETAILED CONTENT (MANDATORY: VIETNAMESE):
- **LANGUAGE RULE**: All content in "explanation", "formula", "note", and "meaning" fields MUST BE WRITTEN IN VIETNAMESE.
- EXPLANATION: Clear, educational, and detailed Vietnamese. Length: ~40-60 words.
- FORMULA: Relevant grammar pattern (in Vietnamese) or "N/A".
- NOTE: Useful tips, common pitfalls, or cultural nuances in Vietnamese.
- NEW WORDS: Extract 3-5 words ONLY from the "question" text. **DO NOT include words from "options".**

OUTPUT FORMAT (STRICT):
1. **PURE JSON ONLY**: No text before/after.
2. **NO MARKDOWN**: Do not use \`\`\`json blocks.
3. **VALIDATION**: Ensure the structure matches exactly.

JSON Schema:
{
  "questions": [
    {
      "id": 1,
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correct_answer": 0,
      "explanation": { "summary": "...", "formula": "...", "note": "..." },
      "new_words": [{ "word": "...", "pronunciation": "/.../", "meaning": "VN" }]
    }
  ]
}`.trim();
  }

  generateRandomDistribution() {
    let vocabulary = 2;
    let grammar = 2;
    let communication = 2;
    
    let remaining = 4;
    while (remaining > 0) {
      const rand = Math.floor(Math.random() * 3);
      if (rand === 0) vocabulary++;
      else if (rand === 1) grammar++;
      else communication++;
      remaining--;
    }
    
    return { vocabulary, grammar, communication };
  }

  async generateWithFallback(prompt, quantity) {
    return await aiService.generateWithFallback(prompt, {
      tag: 'Quiz',
      systemMessage: 'You are a helpful assistant that generates English quiz questions in JSON format.',
      serviceSpecificCleaning: (data) => {
        if (data.questions) {
          data.questions.forEach(q => {
            if (typeof q.correct_answer === 'string') {
              q.correct_answer = parseInt(q.correct_answer);
            }
          });
        }
        return data;
      }
    });
  }
}

module.exports = new QuizService();
