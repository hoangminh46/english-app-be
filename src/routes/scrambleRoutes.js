const express = require('express');
const router = express.Router();
const scrambleController = require('../controllers/scrambleController');

// POST /api/scramble - Generate word scramble
router.post('/generate', scrambleController.generateScramble);

module.exports = router;
