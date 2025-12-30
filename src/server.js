const app = require('./app');
const config = require('./config/config');
const connectDB = require('./config/database');

const port = config.port || 5000;

let server;

// Kết nối MongoDB trước khi start server
connectDB()
  .then(() => {
    server = app.listen(port, () => {
      console.log(`🚀 Server đang chạy tại http://localhost:${port}`);
      console.log(`📊 Environment: ${config.nodeEnv}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      if (server) {
        server.close(() => {
          console.log('Process terminated');
          process.exit(0);
        });
      }
    });

    process.on('SIGINT', () => {
      console.log('SIGINT received. Shutting down gracefully...');
      if (server) {
        server.close(() => {
          console.log('Process terminated');
          process.exit(0);
        });
      }
    });

    return server;
  })
  .catch((error) => {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  });

module.exports = server;
