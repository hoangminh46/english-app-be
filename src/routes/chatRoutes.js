const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/v1/chat/ask - Chat with Mine Assistant
router.post('/ask', chatController.chatWithAI);

module.exports = router;
