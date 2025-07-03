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
    origin: ["http://localhost:3000", `${process.env.FRONTEND_URL}`],
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
          temperature: 0.9,
          topK: 50,
          topP: 0.97,
          maxOutputTokens: 8192,
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
    const { language, quantity, mainTopic, subtopics, difficulty, audience, category } = req.body;
    
    const prompt = `Bạn là một giáo viên ${language} với 10 năm kinh nghiệm.

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

    const apiKey = process.env.GEMINI_API_KEY;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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

app.post('/api/quick-quiz', async (req, res) => {
  try {
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

    const generateRandomDistribution = () => {
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
    };

    const distribution = generateRandomDistribution();

    const prompt = `Bạn là một giáo viên tiếng Anh với 10 năm kinh nghiệm.

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

    const apiKey = process.env.GEMINI_API_KEY;
    console.log(prompt);
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
      
      aiResponse = aiResponse.replace(/```json|```/g, '').trim();
      
      aiResponse = aiResponse.trim();
      aiResponse = aiResponse.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\uFEFF]/g, '');
      
      try {
        const jsonResponse = JSON.parse(aiResponse);
        
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

app.post('/api/scramble', async (req, res) => {
  try {
    const { difficulty, quantity, topics } = req.body;
    
    // Helper function to get word length range based on difficulty
    const getWordLengthRange = (diff) => {
      switch(diff) {
        case 'Cơ bản':
          return {min: 3, max: 5};
        case 'Trung bình':
          return {min: 5, max: 7};
        case 'Nâng cao':
          return {min: 7, max: 9};
        default:
          return {min: 3, max: 9};
      }
    };

    const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

    const wordLengthRange = getWordLengthRange(difficulty);
    
    const prompt = `Bạn là một ${getRandomElement(perspectives)} 15 năm kinh nghiệm với phương pháp ${getRandomElement(approaches)} . Seed: ${randomSeed}-${timestamp}
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
    console.log(prompt);
    const apiKey = process.env.GEMINI_API_KEY;
    
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
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
      
      try {
        const jsonResponse = JSON.parse(aiResponse);
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
