const axios = require('axios');
const config = require('../config/config');

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

    return await this.callGeminiAPI(prompt);
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
    return await this.callGeminiAPI(prompt);
  }

  buildCustomQuizPrompt(params) {
    const { language, quantity, mainTopic, subtopics, difficulty, audience, category } = params;
    
    return `You are an expert ${language} teacher with 10 years of experience creating professional multiple-choice questions.

TASK:
Generate ${quantity} multiple-choice questions (4 options each, 1 correct answer).

CONTEXT SETTINGS:
- Language: ${language}
- Category: ${category}
- Main topic: ${mainTopic}
- Subtopics: ${subtopics.join(', ')}
- Difficulty: ${difficulty}
- Target audience: ${audience}

REQUIREMENTS:
1. Each question must be grammatically correct, unambiguous, and logically sound.
2. Use diverse question types (fill-in-the-blank, situational, synonym/antonym, grammar, collocation, context-based, etc.).
3. Ensure **no repetition** of question structure, examples, or content.
4. Randomize question order and vary the phrasing and focus of each question.
5. Include real-life or practical contexts whenever possible.

EXPLANATION RULES:
- The explanation must be an **object with separate fields** (not a single string).
- Each field must be in Vietnamese and include:
  - **summary**: The main concept with definition and why the answer is correct (combine concept, definition, and reasoning in one field)
  - **formula**: The grammar formula or pattern (if applicable, e.g., "S + V + O", "have/has + past participle", or "N/A" if not applicable)
  - **note**: Important note tailored to the category:
    * For **Grammar**: Focus on common grammar mistakes, exceptions to rules, or confusing grammar points
    * For **Vocabulary**: Focus on word usage, collocations, synonyms/antonyms, or contextual nuances
    * For **Communication**: Focus on tone, formality level, cultural context, or appropriate situations to use
- Each field should be **concise (30-50 words for summary, 15-25 words for note)**, clear, and educational.
- Focus on helping learners understand the concept, not just memorize the answer.

NEW WORDS:
- Extract **3–5 new or useful words or phrases** from the *question text only* (not from the options).
- Prioritize diversity: include a mix of **vocabulary types** (verbs, adjectives, idioms, collocations, or topic-related terms).
- For each word or phrase, include:
  - Accurate **phonetic transcription** (IPA preferred)
  - **Meaning in Vietnamese** (clear and natural)
- Choose words that are:
  - Commonly used in real-life English
  - Relevant to the topic or context of the question
  - Useful for learners’ vocabulary building

GRAMMAR CHECKLIST:
- Inanimate subject + verb → use passive voice.
- Verb tense must match time expressions.
- Modal verbs must agree with the subject.
- Ensure subject-verb agreement and logical consistency.

OUTPUT FORMAT:
Return **pure JSON only** (no markdown, no explanations, no additional text).

**CRITICAL**: The "explanation" field MUST be an object with 3 nested fields (summary, formula, note).
DO NOT return summary, formula, note as separate top-level fields.

Correct structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": {
        "summary": "The main concept with definition and why the answer is correct (Vietnamese)",
        "formula": "Grammar formula or pattern (e.g., 'S + V + O' or 'N/A')",
        "note": "Important note or common mistake to avoid (Vietnamese)"
      },
      "new_words": [
        {
          "word": "new or key term",
          "pronunciation": "phonetic transcription",
          "meaning": "Vietnamese meaning"
        }
      ]
    }
  ]
}

IMPORTANT:
- Only output valid JSON (UTF-8, no markdown or quotes escaping).
- Every question must pass grammar and logic validation before output.
- No duplicated ideas, grammar patterns, or contexts.
- **CRITICAL**: "explanation" MUST be an object containing 3 fields: {summary, formula, note}.
- The formula field should contain grammar patterns when applicable, or "N/A" if not relevant to the question.
- The note field must be tailored to the category (${category}) to provide relevant learning insights.

`.trim();
  }

  buildQuickQuizPrompt(selectedTopics, distribution) {
    return `You are an expert English teacher with 10 years of experience designing professional multiple-choice exercises for English learners.

TASK:
Generate 10 multiple-choice questions (4 options each, 1 correct answer).

CONTEXT SETTINGS:
- Language: English
- Focus topics: ${selectedTopics.join(', ')}
- Question distribution:
  + ${distribution.vocabulary} questions on vocabulary and common expressions
  + ${distribution.grammar} questions on practical grammar
  + ${distribution.communication} questions on communication and phrasing
- Target audience: English learners seeking real-life, conversational improvement

REQUIREMENTS:
1. Each question must be grammatically correct, unambiguous, and contextually sound.
2. Use **diverse question types** — including fill-in-the-blank, sentence completion, situational choice, synonym/antonym, and conversational response.
3. Ensure **no repetition** in question structure, topic, or content.
4. Randomize question order (do not group by category).
5. Use **natural, real-life English** — avoid overly academic or unnatural phrasing.
6. All questions must focus on **language used in daily conversation or practical scenarios**.

EXPLANATION RULES:
- The explanation must be an **object with separate fields** (not a single string).
- Each field must be in Vietnamese and include:
  - **summary**: The main concept with definition and why the answer is correct (combine concept, definition, and reasoning in one field)
  - **formula**: The grammar formula or pattern (if applicable, e.g., "S + V + O", "have/has + past participle", or "N/A" if not applicable)
  - **note**: Important note tailored to the question type:
    * For **Grammar questions**: Focus on common grammar mistakes, exceptions to rules, or confusing grammar points
    * For **Vocabulary questions**: Focus on word usage, collocations, synonyms/antonyms, or contextual nuances
    * For **Communication questions**: Focus on tone, formality level, cultural context, or appropriate situations to use
- Each field should be **concise (30-50 words for summary, 15-25 words for note)**, clear, and educational.
- Focus on helping learners understand the concept, not just memorize the answer.

NEW WORDS:
- Extract **3–5 important or useful words or phrases** from the **question text only** (not from the options).
- Include:
  - Key or challenging vocabulary
  - Common phrases or idioms
  - Technical or topic-related terms (if relevant)
- Each new word must have:
  - Accurate **phonetic transcription (IPA preferred)**
  - **Vietnamese meaning**
- Prioritize **variety**: include different word types (verbs, adjectives, nouns, idioms).

GRAMMAR & LOGIC CHECKLIST:
- Inanimate noun + verb → use passive voice.
- Verb tense must align with time expressions.
- Modal verbs must match the subject.
- Ensure subject–verb agreement and logical consistency.
- Avoid questions that can have more than one valid answer.

OUTPUT FORMAT:
Return **pure JSON only** (UTF-8, no markdown, comments, or extra text).

**CRITICAL**: The "explanation" field MUST be an object with 3 nested fields (summary, formula, note).
DO NOT return summary, formula, note as separate top-level fields.

Correct structure:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_answer": 0,
      "explanation": {
        "summary": "The main concept with definition and why the answer is correct (Vietnamese)",
        "formula": "Grammar formula or pattern (e.g., 'S + V + O' or 'N/A')",
        "note": "Important note or common mistake to avoid (Vietnamese)"
      },
      "new_words": [
        {
          "word": "new or key term",
          "pronunciation": "phonetic transcription",
          "meaning": "Vietnamese meaning"
        }
      ]
    }
  ]
}

IMPORTANT:
- Only output valid JSON (UTF-8, no quotes escaping or markdown).
- Each question must pass grammar and logic validation before output.
- No duplicated ideas, grammar patterns, or contexts.
- Maintain natural, conversational tone in all question texts.
- **CRITICAL**: "explanation" MUST be an object containing 3 fields: {summary, formula, note}.
- The formula field should contain grammar patterns when applicable, or "N/A" if not relevant to the question.
- The note field must be tailored to the question type (Grammar/Vocabulary/Communication) to provide relevant learning insights.
`.trim();
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
            maxOutputTokens: 8192,
          }
        },
        { headers: { 'Content-Type': 'application/json' } }
      );
      
      let aiResponse = '';
      if (response.data?.candidates?.[0]?.content?.parts) {
        aiResponse = response.data.candidates[0].content.parts[0].text;
        
        // Remove markdown if present
        aiResponse = aiResponse.replace(/```json|```/g, '').trim();
        
        // Clean the response
        aiResponse = aiResponse.trim();
        aiResponse = aiResponse.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
        
        // Parse JSON response
        const jsonResponse = JSON.parse(aiResponse);
        
        // Ensure correct_answer is a number, not a string
        if (jsonResponse.questions) {
          jsonResponse.questions.forEach(q => {
            if (typeof q.correct_answer === 'string') {
              q.correct_answer = parseInt(q.correct_answer);
            }
          });
        }
        
        return jsonResponse;
      } else {
        throw new Error('Không nhận được phản hồi hợp lệ từ AI');
      }
    } catch (error) {
      console.error('Quiz service error:', error.response?.data || error.message);
      throw new Error('Lỗi khi tạo câu hỏi trắc nghiệm');
    }
  }
}

module.exports = new QuizService();
