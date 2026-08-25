const express = require('express');
const interviewController = require('../controllers/interviewController');
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

// Stats route (Must go before /:id routes to avoid parameter capture)
router.get('/stats', authMiddleware, interviewController.getDashboardStats);

// Role specific query shortcuts
router.get('/candidate/upcoming', authMiddleware, roleMiddleware('candidate'), interviewController.getCandidateUpcoming);
router.get('/candidate/history', authMiddleware, roleMiddleware('candidate'), interviewController.getCandidateHistory);
router.get('/interviewer/upcoming', authMiddleware, roleMiddleware('interviewer'), interviewController.getInterviewerUpcoming);
router.get('/interviewer/history', authMiddleware, roleMiddleware('interviewer'), interviewController.getInterviewerHistory);

// Lobby and Session status resolution
router.get('/room/:roomId', authMiddleware, interviewController.getRoomDetails);
router.post('/:id/join', authMiddleware, interviewController.joinSession);
router.get('/:id/session', authMiddleware, interviewController.getSessionState);
router.post('/:id/submit-round', authMiddleware, interviewController.submitRound);

// Base CRUD endpoints
router.post('/', authMiddleware, roleMiddleware('interviewer'), interviewController.create);
router.get('/', authMiddleware, interviewController.getAll);
router.get('/:id', authMiddleware, interviewController.getById);
router.put('/:id', authMiddleware, roleMiddleware('interviewer'), interviewController.update);
router.delete('/:id', authMiddleware, roleMiddleware('interviewer'), interviewController.delete);

module.exports = router;
