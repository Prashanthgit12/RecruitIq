const Chat = require('../models/chatModel');
const Interview = require('../models/interviewModel');

const chatController = {
  /**
   * Fetch chat history for an interview room (Requires session authorization)
   */
  async getChatHistory(req, res, next) {
    try {
      const { interviewId } = req.params;
      const userId = req.user.id;

      // Verify interview details and permissions
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview session not found.' });
      }

      if (interview.candidate_id !== userId && interview.interviewer_id !== userId) {
        return res.status(403).json({ message: 'Access denied. You are not a participant in this room.' });
      }

      const history = await Chat.findByInterviewId(interviewId);
      return res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = chatController;
