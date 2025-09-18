# Hướng dẫn Deploy lên Vercel

## Cấu trúc dự án đã được tối ưu cho Vercel

### Files quan trọng:
- `api/index.js` - Entry point cho Vercel
- `vercel.json` - Cấu hình Vercel
- `src/app.js` - Express app (không có server.listen)
- `src/server.js` - Server cho development local

### Các bước deploy:

1. **Cài đặt Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login vào Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
vercel
```

4. **Deploy production:**
```bash
vercel --prod
```

### Environment Variables cần thiết:
- `GEMINI_API_KEY`
- `OPENAI_API_KEY` 
- `FRONTEND_URL`
- `MONGO_URI`
- `JWT_SECRET`
- `NODE_ENV`

### Cấu trúc API endpoints:
- `POST /api/chat` - Chat với AI
- `POST /api/quiz/generate` - Tạo quiz tùy chỉnh
- `POST /api/quiz/quick` - Tạo quiz nhanh
- `POST /api/scramble` - Tạo word scramble

### Lưu ý:
- Dự án đã được cấu hình để hoạt động với Vercel serverless functions
- Tất cả routes đều được route qua `api/index.js`
- CORS đã được cấu hình cho production
