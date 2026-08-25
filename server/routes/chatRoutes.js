const express = require('express');
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/:interviewId', authMiddleware, chatController.getChatHistory);

module.exports = router;
