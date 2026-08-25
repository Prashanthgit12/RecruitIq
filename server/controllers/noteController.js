const Note = require('../models/noteModel');
const Interview = require('../models/interviewModel');

const noteController = {
  /**
   * Save or update private interviewer notes
   */
  async saveNotes(req, res, next) {
    try {
      const { interview_id, notes } = req.body;

      if (!interview_id) {
        return res.status(400).json({ message: 'Interview ID is required.' });
      }

      // Check if interview exists and verify interviewer access
      const interview = await Interview.findById(interview_id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      if (interview.interviewer_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You are not the assigned interviewer.' });
      }

      const note = await Note.upsert({
        interview_id,
        interviewer_id: req.user.id,
        notes: notes || '',
      });

      return res.status(200).json({
        message: 'Notes saved successfully.',
        note,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get private notes for an interview (Interviewer only)
   */
  async getNotes(req, res, next) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      if (interview.interviewer_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. Only the assigned interviewer can view these notes.' });
      }

      const note = await Note.findByInterviewId(interviewId);
      
      // If no notes exist yet, return empty object/notes content
      if (!note) {
        return res.status(200).json({ interview_id: interviewId, notes: '' });
      }

      return res.status(200).json(note);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = noteController;
