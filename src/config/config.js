require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Keys
  geminiApiKey: process.env.GEMINI_API_KEY,
  openaiApiKey: process.env.OPENAI_API_KEY,
  groqApiKey: process.env.GROQ_API_KEY,
  openRouterApiKey: process.env.OPENROUTER_API_KEY,
  
  // Frontend URL - tự động detect dựa trên NODE_ENV
  frontendUrl: process.env.FRONTEND_URL || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://mine-english.vercel.app' 
      : 'http://localhost:3000'),
  
  // Database
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/english_app',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  
  // Rate limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  
  // CORS
  corsOrigins: process.env.CORS_ORIGINS ? 
    process.env.CORS_ORIGINS.split(',') : 
    ['http://localhost:3000'],
  
  // Google OAuth2
  googleClientID: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  // Callback URL - nếu có trong env thì dùng, không thì tự động tạo từ base URL
  googleCallbackURL: process.env.GOOGLE_CALLBACK_URL || 
    (process.env.BASE_URL 
      ? `${process.env.BASE_URL}/api/auth/google/callback`
      : 'http://localhost:5000/api/auth/google/callback'),
  baseUrl: process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`,
};

module.exports = config;
