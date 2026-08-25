const express = require('express');
const noteController = require('../controllers/noteController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware('interviewer'), noteController.saveNotes);
router.get('/:interviewId', authMiddleware, roleMiddleware('interviewer'), noteController.getNotes);
router.put('/:interviewId', authMiddleware, roleMiddleware('interviewer'), noteController.saveNotes);

module.exports = router;
