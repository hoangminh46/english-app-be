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
    
    return `Bạn là một giáo viên ${language} với 10 năm kinh nghiệm.

Nhiệm vụ:
- Tạo ${quantity} câu hỏi trắc nghiệm 4 đáp án (1 đúng)
- Ngôn ngữ: ${language}
- Phân loại: ${category}
- Chủ đề chính: ${mainTopic}
- Các chủ đề con: ${subtopics.join(', ')}
- Độ khó: ${difficulty}
- Đối tượng: ${audience}

YÊU CẦU CHUNG:
- Đáp án và giải thích phải ngắn gọn (<100 từ) và bằng tiếng Việt
- TẤT CẢ các giải thích PHẢI LUÔN LUÔN bằng tiếng Việt, NGAY CẢ KHI câu hỏi và đáp án bằng ngôn ngữ khác
- TUYỆT ĐỐI KHÔNG trùng lặp nội dung giữa các câu hỏi
- Thứ tự câu hỏi được sắp xếp ngẫu nhiên
- Mỗi câu hỏi PHẢI có cách tiếp cận và góc nhìn KHÁC NHAU
- KHÔNG được sử dụng cùng một cấu trúc câu hỏi quá 2 lần
- Sử dụng nhiều dạng câu hỏi KHÁC NHAU (điền từ, tình huống, đồng nghĩa/trái nghĩa, ngữ cảnh, v.v.)
- Phân bổ đồng đều và đa dạng cho các chủ đề con đã cho
- Tránh sử dụng các cấu trúc câu hỏi lặp lại
- Đảm bảo mỗi câu hỏi độc lập và không liên quan đến nhau
- Sử dụng các ví dụ và tình huống thực tế KHÁC NHAU
- Với mỗi câu hỏi, trích xuất các từ mới CHỈ từ nội dung câu hỏi (KHÔNG lấy từ các đáp án), bao gồm:
  + Từ vựng quan trọng hoặc khó
  + Cụm từ thông dụng
  + Thuật ngữ chuyên ngành (nếu có)

YÊU CẦU BẮT BUỘC: 
   - Mỗi câu hỏi PHẢI được kiểm tra ngữ pháp và logic trước khi xuất
   - Đảm bảo không có câu hỏi mơ hồ/nhiều nghĩa
   - Với câu điền khuyết: Xác định rõ chủ ngữ có thể thực hiện hành động không
   
TIÊU CHÍ NGỮ PHÁP:
   - Danh từ vô tri + động từ → bắt buộc dùng bị động
   - Thì động từ phải khớp với trạng từ thời gian
   - Động từ khuyết thiếu phải phù hợp với chủ ngữ

QUAN TRỌNG: CHỈ TRẢ VỀ JSON THUẦN KHÔNG CÓ MARKDOWN, KHÔNG CÓ KÝ TỰ ĐẶC BIỆT, theo định dạng sau:

{
  "questions": [
    {
      "id": số thứ tự (1, 2, 3...),
      "question": "nội dung câu hỏi",
      "options": ["đáp án A", "đáp án B", "đáp án C", "đáp án D"],
      "correct_answer": chỉ số của đáp án đúng (0-3, dạng số không phải chuỗi),
      "explanation": "giải thích ngắn gọn",
      "new_words": [
        {
          "word": "từ hoặc cụm từ mới",
          "pronunciation": "phiên âm",
          "meaning": "nghĩa tiếng Việt"
        }
      ]
    }
  ]
}`.trim();
  }

  buildQuickQuizPrompt(selectedTopics, distribution) {
    return `Bạn là một giáo viên tiếng Anh với 10 năm kinh nghiệm.

Nhiệm vụ:
- Tạo 10 câu hỏi trắc nghiệm 4 đáp án (1 đúng)
- Ngôn ngữ: Tiếng Anh
- Chủ đề tập trung: ${selectedTopics.join(', ')}
- Phân bổ: 
  + ${distribution.vocabulary} câu về từ vựng và cụm từ thông dụng
  + ${distribution.grammar} câu về ngữ pháp thực tế
  + ${distribution.communication} câu về cách diễn đạt và giao tiếp

YÊU CẦU CHUNG:
- Đáp án và giải thích phải ngắn gọn (<100 từ) và bằng tiếng Việt
- Các câu hỏi PHẢI đa dạng về hình thức
- Thứ tự câu hỏi được sắp xếp ngẫu nhiên, không theo phân bổ đã cho
- TẤT CẢ các giải thích PHẢI LUÔN LUÔN bằng tiếng Việt, NGAY CẢ KHI câu hỏi và đáp án bằng ngôn ngữ khác
- Câu hỏi phải đa dạng và thực tế, không trùng lặp nội dung các câu
- Tập trung vào kiến thức thường dùng trong giao tiếp hàng ngày
- Với mỗi câu hỏi, trích xuất các từ mới CHỈ từ nội dung câu hỏi (KHÔNG lấy từ các đáp án), bao gồm:
  + Từ vựng quan trọng hoặc khó
  + Cụm từ thông dụng
  + Thuật ngữ chuyên ngành (nếu có)

YÊU CẦU BẮT BUỘC: 
   - Mỗi câu hỏi PHẢI được kiểm tra ngữ pháp và logic trước khi xuất
   - Đảm bảo không có câu hỏi mơ hồ/nhiều nghĩa
   - Với câu điền khuyết: Xác định rõ chủ ngữ có thể thực hiện hành động không
   
TIÊU CHÍ NGỮ PHÁP:
   - Danh từ vô tri + động từ → bắt buộc dùng bị động
   - Thì động từ phải khớp với trạng từ thời gian
   - Động từ khuyết thiếu phải phù hợp với chủ ngữ

QUAN TRỌNG: CHỈ TRẢ VỀ JSON THUẦN KHÔNG CÓ MARKDOWN, KHÔNG CÓ KÝ TỰ ĐẶC BIỆT, theo định dạng sau:

{
  "questions": [
    {
      "id": số thứ tự (1, 2, 3...),
      "question": "nội dung câu hỏi",
      "options": ["đáp án A", "đáp án B", "đáp án C", "đáp án D"],
      "correct_answer": chỉ số của đáp án đúng (0-3, dạng số không phải chuỗi),
      "explanation": "giải thích ngắn gọn",
      "new_words": [
        {
          "word": "từ hoặc cụm từ mới",
          "pronunciation": "phiên âm",
          "meaning": "nghĩa tiếng Việt"
        }
      ]
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
