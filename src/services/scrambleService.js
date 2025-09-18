const axios = require('axios');
const config = require('../config/config');

class ScrambleService {
  async generateWordScramble(params) {
    const { difficulty, quantity, topics } = params;

    const prompt = this.buildScramblePrompt(difficulty, quantity, topics);
    return await this.callGeminiAPI(prompt);
  }

  buildScramblePrompt(difficulty, quantity, topics) {
    const wordLengthRange = this.getWordLengthRange(difficulty);
    const perspectives = [
      'giáo viên ngôn ngữ',
      'chuyên gia từ vựng',
      'nhà thiết kế trò chơi giáo dục',
      'giảng viên đại học ngành ngôn ngữ',
      'chuyên gia phát triển ứng dụng học ngôn ngữ'
    ];

    const approaches = [
      'tiếp cận theo tình huống thực tế',
      'tiếp cận theo ngữ cảnh giao tiếp',
      'tiếp cận theo chức năng ngôn ngữ',
      'tiếp cận theo kỹ năng sử dụng'
    ];

    const timestamp = Date.now();
    const randomSeed = Math.floor(Math.random() * 1000);
    const randomPerspective = perspectives[Math.floor(Math.random() * perspectives.length)];
    const randomApproach = approaches[Math.floor(Math.random() * approaches.length)];

    return `Bạn là một ${randomPerspective} 15 năm kinh nghiệm với phương pháp ${randomApproach} . Seed: ${randomSeed}-${timestamp}
    Nhiệm vụ:
    - Tạo ${quantity} câu đố sắp xếp chữ (word scramble)
    - Độ khó: ${difficulty}
    - Chủ đề: ${topics.join(', ')}
    - Thứ tự câu đố được sắp xếp NGẪU NHIÊN

    Ràng buộc độ dài từ:
   - TUYỆT ĐỐI CHỈ chọn từ có độ dài từ ${wordLengthRange.min} đến ${wordLengthRange.max} chữ cái
   - KHÔNG được chọn từ ngắn hơn ${wordLengthRange.min} hoặc dài hơn ${wordLengthRange.max} chữ cái
   - Độ dài được tính cho cả từ ghép (compound words)
    
    Yêu cầu về từ vựng:
    - Ưu tiên chọn từ có tính ứng dụng cao trong giao tiếp thực tế
    - Mỗi từ PHẢI thuộc một trong các dạng sau (phân bổ đều):
      + Từ đơn (single words)
      + Cụm từ thông dụng (common phrases)
      + Từ ghép (compound words)
      + Từ có tiền tố/hậu tố (words with prefixes/suffixes)
    - Đảm bảo cân bằng giữa các loại từ:
      + 30% danh từ (nouns)
      + 30% động từ (verbs)
      + 20% tính từ (adjectives)
      + 20% trạng từ/từ khác (adverbs/others)
    
    Yêu cầu về nội dung:
    - Mỗi câu đố phải có:
      + Từ gốc (word): từ tiếng Anh cần đoán
      + Từ bị xáo trộn (scrambled): các chữ cái xáo trộn theo quy tắc:
        * Không để 2 chữ cái liền kề trong từ gốc đứng cạnh nhau
        * Đảm bảo ít nhất 70% vị trí chữ cái khác với từ gốc
      + Gợi ý (hint): gợi ý bằng tiếng Việt theo một trong các dạng:
        * Định nghĩa ngắn gọn
        * Tình huống sử dụng
        * Từ đồng nghĩa/trái nghĩa
        * Ví dụ thực tế
      + Giải thích (explanation): bao gồm:
        * Nghĩa tiếng Việt
        * Cách phát âm đơn giản
        * Ví dụ câu ngắn
        * Các cụm từ thông dụng (nếu có)
    
    Yêu cầu về độ khó:
    - Cơ bản: Từ thông dụng và phổ biến
    - Trung bình: Từ có tần suất sử dụng vừa phải, có thể gặp trong giao tiếp hàng ngày
    - Nâng cao: Từ chuyên ngành hoặc học thuật, nhưng vẫn đảm bảo tính thực tế
    
    QUAN TRỌNG: 
    - CÁC TỪ PHẢI ĐƯỢC VIẾT HOA HOÀN TOÀN
    - MỖI REQUEST PHẢI TẠO NỘI DUNG HOÀN TOÀN MỚI
    - CHỈ TRẢ VỀ JSON THUẦN KHÔNG CÓ MARKDOWN, KHÔNG CÓ KÝ TỰ ĐẶC BIỆT, theo định dạng sau:
    
    {
      "words": [
        {
          "id": số thứ tự (1, 2, 3...),
          "word": "từ gốc cần đoán",
          "scrambled": "từ đã bị xáo trộn chữ cái",
          "hint": "gợi ý bằng tiếng Việt",
          "explanation": "giải thích ngắn gọn bằng tiếng Việt"
        }
      ]
    }`.trim();
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
