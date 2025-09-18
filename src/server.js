const app = require('./app');
const config = require('./config/config');

const port = config.port || 5000;

const server = app.listen(port, () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = server;
