require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  cors({
    origin: ["http://localhost:3000", "http://your-frontend-domain.com"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.json({ message: 'Chào mừng đến với API ứng dụng tiếng Anh!' });
});

// API endpoint xử lý chat với AI
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;
    
    // Gọi API Gemini trực tiếp
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // Trích xuất phản hồi từ API Gemini
    let aiResponse = '';
    if (response.data && 
        response.data.candidates && 
        response.data.candidates[0] &&
        response.data.candidates[0].content &&
        response.data.candidates[0].content.parts) {
      aiResponse = response.data.candidates[0].content.parts[0].text;
    }
    
    // Làm sạch chuỗi trước khi parse
    aiResponse = aiResponse.trim();
    // Xử lý các ký tự Unicode đặc biệt
    aiResponse = aiResponse.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
    
    res.json({ response: aiResponse });
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});

// API endpoint xử lý tạo câu hỏi trắc nghiệm
app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { language, quantity, mainTopic,subtopics, difficulty, audience,category } = req.body;
    
    // Tạo prompt hoàn chỉnh phía backend, yêu cầu rõ ràng về định dạng
    const prompt = `Bạn là một giáo viên ${language} với 10 năm kinh nghiệm.

Nhiệm vụ:
- Tạo ${quantity} câu hỏi trắc nghiệm 4 đáp án (1 đúng)
- Ngôn ngữ: ${language}
- Phân loại: ${category}
- Chủ đề chính: ${mainTopic}
- Các chủ đề con: ${subtopics.join(', ')}
- Độ khó: ${difficulty}
- Đối tượng: ${audience}

Yêu cầu:
- Đáp án và giải thích phải ngắn gọn (<100 từ) và bằng tiếng Việt
- TẤT CẢ các giải thích PHẢI LUÔN LUÔN bằng tiếng Việt, NGAY CẢ KHI câu hỏi và đáp án bằng ngôn ngữ khác
- Không trùng lặp nội dung các câu
- Phân bổ đồng đều cho các chủ đề con đã cho

QUAN TRỌNG: CHỈ TRẢ VỀ JSON THUẦN KHÔNG CÓ MARKDOWN, KHÔNG CÓ KÝ TỰ ĐẶC BIỆT, theo định dạng sau:

{
  "questions": [
    {
      "id": số thứ tự (1, 2, 3...),
      "question": "nội dung câu hỏi",
      "options": ["đáp án A", "đáp án B", "đáp án C", "đáp án D"],
      "correct_answer": chỉ số của đáp án đúng (0-3, dạng số không phải chuỗi),
      "explanation": "giải thích ngắn gọn"
    }
  ]
}`.trim();

// Thêm dòng này để kiểm tra prompt trước khi gửi đi
console.log('Prompt length:', prompt.length);
console.log('Prompt content:', prompt);

    const apiKey = process.env.GEMINI_API_KEY;
    
    // Gọi API Gemini
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    
    // Trích xuất phản hồi từ API Gemini
    let aiResponse = '';
    if (response.data?.candidates?.[0]?.content?.parts) {
      aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Loại bỏ các ký tự markdown nếu có
      aiResponse = aiResponse.replace(/```json|```/g, '').trim();
      
      // Làm sạch chuỗi trước khi parse
      aiResponse = aiResponse.trim();
      // Xử lý các ký tự Unicode đặc biệt
      aiResponse = aiResponse.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
      
      // Cố gắng phân tích JSON từ phản hồi
      try {
        const jsonResponse = JSON.parse(aiResponse);
        
        // Đảm bảo correct_answer là số, không phải chuỗi
        if (jsonResponse.questions) {
          jsonResponse.questions.forEach(q => {
            if (typeof q.correct_answer === 'string') {
              q.correct_answer = parseInt(q.correct_answer);
            }
          });
        }
        
        res.json(jsonResponse);
      } catch (e) {
        console.error('JSON parsing error:', e);
        res.status(400).json({ 
          error: 'Không thể xử lý dữ liệu từ AI', 
          raw: aiResponse 
        });
      }
    } else {
      res.status(500).json({ error: 'Không nhận được phản hồi hợp lệ từ AI' });
    }
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Lỗi máy chủ nội bộ' });
  }
});

app.use('/api', (req, res) => {
  res.json({ message: 'API đang được phát triển' });
});

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({ message: 'Không tìm thấy đường dẫn!' });
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server đang chạy tại http://localhost:${port}`);
});

module.exports = app;
