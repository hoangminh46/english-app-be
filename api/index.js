const app = require('../src/app');
const connectDB = require('../src/config/database');

// Kết nối database
connectDB();

module.exports = app;
