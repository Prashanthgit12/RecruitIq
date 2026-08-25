const Interview = require('../models/interviewModel');

const roomController = {
  /**
   * Get room metadata and verify user authorization
   */
  async getRoomDetails(req, res, next) {
    try {
      const { roomId } = req.params;
      const interview = await Interview.findByRoomId(roomId);

      if (!interview) {
        return res.status(404).json({ message: 'Interview room not found.' });
      }

      // Check if user is candidate or interviewer for this room
      const isInterviewer = interview.interviewer_id === req.user.id;
      const isCandidate = interview.candidate_id === req.user.id;

      if (!isInterviewer && !isCandidate) {
        return res.status(403).json({ message: 'Access denied. You are not authorized to join this interview room.' });
      }

      // Don't leak private notes if a candidate requests details (though notes are stored separately, double check we filter correctly)
      const data = {
        id: interview.id,
        room_id: interview.room_id,
        title: interview.title,
        scheduled_at: interview.scheduled_at,
        duration_minutes: interview.duration_minutes,
        status: interview.status,
        programming_language: interview.programming_language,
        question_title: interview.question_title,
        question_description: interview.question_description,
        difficulty: interview.difficulty,
        interviewer_name: interview.interviewer_name,
        candidate_name: interview.candidate_name,
        interviewer_id: interview.interviewer_id,
        candidate_id: interview.candidate_id,
      };

      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = roomController;
