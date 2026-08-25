const express = require('express');
const codeController = require('../controllers/codeController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/submit', authMiddleware, codeController.submitCode);
router.get('/:interviewId', authMiddleware, codeController.getSubmission);
router.post('/run', authMiddleware, codeController.runCode); // Mock execution runner

module.exports = router;
