const Evaluation = require('../models/evaluationModel');
const Interview = require('../models/interviewModel');

const evaluationController = {
  /**
   * Save or update an evaluation (Interviewer only)
   */
  async saveEvaluation(req, res, next) {
    try {
      const {
        interview_id,
        communication_rating,
        problem_solving_rating,
        coding_rating,
        technical_rating,
        overall_rating,
        feedback,
        result,
      } = req.body;

      if (!interview_id || !overall_rating || !result) {
        return res.status(400).json({ message: 'Interview ID, overall rating, and result status are required.' });
      }

      // Check if interview exists
      const interview = await Interview.findById(interview_id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      // Verify request is from the interviewer
      if (interview.interviewer_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. Only the assigned interviewer can submit evaluations.' });
      }

      // Save evaluation
      const evaluation = await Evaluation.upsert({
        interview_id,
        communication_rating,
        problem_solving_rating,
        coding_rating,
        technical_rating,
        overall_rating,
        feedback,
        result,
      });

      // Update interview status to completed
      await Interview.update(interview_id, { status: 'completed' });

      return res.status(200).json({
        message: 'Evaluation saved and interview completed successfully.',
        evaluation,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get evaluation for an interview (Filtered by role)
   */
  async getByInterviewId(req, res, next) {
    try {
      const { interviewId } = req.params;
      
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      // Check access
      const isInterviewer = interview.interviewer_id === req.user.id;
      const isCandidate = interview.candidate_id === req.user.id;

      if (!isInterviewer && !isCandidate) {
        return res.status(403).json({ message: 'Access denied. You are not authorized to view this evaluation.' });
      }

      const evaluation = await Evaluation.findByInterviewId(interviewId);
      if (!evaluation) {
        return res.status(404).json({ message: 'No evaluation found for this interview.' });
      }

      if (req.user.role === 'candidate') {
        // Only return result status to the candidate
        return res.status(200).json({
          interview_id: evaluation.interview_id,
          result: evaluation.result,
          created_at: evaluation.created_at,
        });
      }

      // Return full details to the interviewer
      return res.status(200).json(evaluation);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = evaluationController;
