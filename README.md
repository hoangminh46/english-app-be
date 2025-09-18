# English Learning App Backend

API backend cho ứng dụng học tiếng Anh sử dụng Express.js và AI.

## Cấu trúc dự án

```
src/
├── app.js                 # Cấu hình Express app
├── server.js             # Entry point của server
├── config/
│   └── config.js         # Cấu hình ứng dụng
├── controllers/          # Controllers xử lý request/response
│   ├── chatController.js
│   ├── quizController.js
│   └── scrambleController.js
├── services/             # Business logic
│   ├── chatService.js
│   ├── quizService.js
│   └── scrambleService.js
├── routes/               # Route definitions
│   ├── chatRoutes.js
│   ├── quizRoutes.js
│   └── scrambleRoutes.js
├── middleware/           # Custom middleware
│   ├── errorHandler.js
│   ├── notFound.js
│   └── validation.js
└── validators/           # Joi validation schemas
    ├── chatValidator.js
    ├── quizValidator.js
    └── scrambleValidator.js
```

## Cài đặt

1. Clone repository
2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Tạo file `.env` từ `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Cấu hình các biến môi trường trong file `.env`

5. Chạy ứng dụng:
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Chat
- `POST /api/chat` - Chat với AI

### Quiz
- `POST /api/quiz/generate` - Tạo câu hỏi trắc nghiệm tùy chỉnh
- `POST /api/quiz/quick` - Tạo câu hỏi trắc nghiệm nhanh

### Scramble
- `POST /api/scramble` - Tạo câu đố sắp xếp chữ

## Công nghệ sử dụng

- **Express.js** - Web framework
- **Joi** - Data validation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing
- **Express Rate Limit** - Rate limiting
- **Axios** - HTTP client
- **Google Gemini AI** - AI service

## Scripts

- `npm start` - Chạy production server
- `npm run dev` - Chạy development server với nodemon
- `npm run lint` - Chạy ESLint
- `npm run lint:fix` - Tự động sửa lỗi ESLint
