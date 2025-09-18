const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// POST /api/chat - Chat with AI
router.post('/', chatController.chatWithAI);

module.exports = router;
