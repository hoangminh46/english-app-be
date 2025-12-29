require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Import routes
const chatRoutes = require('./routes/chatRoutes');
const quizRoutes = require('./routes/quizRoutes');
const scrambleRoutes = require('./routes/scrambleRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: ["http://localhost:3000", process.env.FRONTEND_URL],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Quá nhiều yêu cầu từ IP này, vui lòng thử lại sau 15 phút.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Chào mừng đến với API ứng dụng tiếng Anh!',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/chat', chatRoutes);
app.use('/api/quiz', quizRoutes);
app.use('/api/scramble', scrambleRoutes);

// 404 handler
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
