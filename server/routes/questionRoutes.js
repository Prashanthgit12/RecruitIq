const express = require('express');
const questionController = require('../controllers/questionController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', authMiddleware, questionController.getAll);
router.get('/:id', authMiddleware, questionController.getById);
router.post('/', authMiddleware, roleMiddleware('interviewer'), questionController.create);
router.put('/:id', authMiddleware, roleMiddleware('interviewer'), questionController.update);
router.delete('/:id', authMiddleware, roleMiddleware('interviewer'), questionController.delete);
router.post('/:id/favorite', authMiddleware, roleMiddleware('interviewer'), questionController.toggleFavorite);

module.exports = router;
