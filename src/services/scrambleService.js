const axios = require('axios');
const config = require('../config/config');
const aiService = require('./aiService');

class ScrambleService {
  async generateWordScramble(params) {
    const { difficulty, quantity, topics } = params;

    const prompt = this.buildScramblePrompt(difficulty, quantity, topics);
    return await this.generateWithFallback(prompt);
  }

  buildScramblePrompt(difficulty, quantity, topics = []) {
    const wordLengthRange = this.getWordLengthRange(difficulty);
    const topicList = topics.length ? topics.join(', ') : 'common English';
    
    return `Expert English Pedagogy & Game Design. Task: EXACTLY ${quantity} word scrambles for Vietnamese learners.
Level: ${difficulty}. Topics: ${topicList}.
Rules:
1. Word len: ${wordLengthRange.min}-${wordLengthRange.max}.
2. Scramble: Challenging, no letter in original position.
3. Content: word/scrambled (UPPERCASE), hint (VN), explanation (meaning VN, IPA, example EN, example translation VN).

Output: PURE JSON ONLY. No markdown, no preamble. Ensure EXACTLY ${quantity} objects. 

Structure:
{"words": [{"id":1, "word":"...", "scrambled":"...", "hint":"...", "explanation": {"meaning":"...","pronunciation":"/.../","partOfSpeech":"...","example":"...","exampleTranslation":"..."}}]}`.trim();
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

  async generateWithFallback(prompt) {
    return await aiService.generateWithFallback(prompt, {
      tag: 'Scramble',
      systemMessage: 'You are an educational AI that specializes in English puzzles and word games.'
    });
  }
}

module.exports = new ScrambleService();
