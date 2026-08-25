const express = require('express');
const evaluationController = require('../controllers/evaluationController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('interviewer'), evaluationController.saveEvaluation);
router.get('/:interviewId', authMiddleware, evaluationController.getByInterviewId);
router.put('/:interviewId', authMiddleware, roleMiddleware('interviewer'), evaluationController.saveEvaluation);

module.exports = router;
