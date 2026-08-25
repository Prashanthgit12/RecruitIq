const Interview = require('../models/interviewModel');
const User = require('../models/userModel');
const generateRoomId = require('../utils/generateRoomId');
const emailService = require('../services/emailService');

const interviewController = {
  /**
   * Create a scheduled interview (Interviewer only)
   */
  async create(req, res, next) {
    try {
      const {
        title,
        candidateEmail,
        scheduledAt,
        durationMinutes,
        programmingLanguage,
        questionTitle,
        questionDescription,
        difficulty,
      } = req.body;

      if (!title || !candidateEmail || !scheduledAt) {
        return res.status(400).json({ message: 'Title, candidate email, and scheduled date/time are required.' });
      }

      // Check if candidate exists in system
      const candidate = await User.findByEmail(candidateEmail);
      if (!candidate) {
        return res.status(404).json({
          message: `The candidate email "${candidateEmail}" is not registered. Please have the candidate register first.`,
        });
      }

      if (candidate.role !== 'candidate') {
        return res.status(400).json({ message: 'The user associated with this email is not a candidate.' });
      }

      // Generate a unique room ID
      const roomId = generateRoomId();

      const interview = await Interview.create({
        room_id: roomId,
        title,
        interviewer_id: req.user.id,
        candidate_id: candidate.id,
        question_title: questionTitle,
        question_description: questionDescription,
        difficulty,
        programming_language: programmingLanguage,
        scheduled_at: scheduledAt,
        duration_minutes: durationMinutes,
      });

      // Dispatch Email Invitation (Run in background asynchronously so UI is instant!)
      const clientUrl = process.env.VITE_CLIENT_URL || 'http://localhost:5173';
      const joinLink = `${clientUrl}/interview/room/${roomId}`;
      emailService.sendInvitation({
        candidateName: candidate.name,
        candidateEmail: candidate.email,
        interviewTitle: interview.title,
        scheduledAt: new Date(scheduledAt).toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' }),
        durationMinutes: durationMinutes || 60,
        joinLink
      }).catch((emailErr) => {
        console.error('Failed to send interview email invitation:', emailErr.message);
      });

      return res.status(201).json({
        message: 'Interview scheduled successfully.',
        interview,
        joinUrl: `/interview/room/${roomId}`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch user dashboard statistics
   */
  async getDashboardStats(req, res, next) {
    try {
      if (req.user.role === 'interviewer') {
        const stats = await Interview.getStatsForInterviewer(req.user.id);
        return res.status(200).json(stats);
      } else {
        const stats = await Interview.getStatsForCandidate(req.user.id);
        return res.status(200).json(stats);
      }
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch all interviews for logged in user (interviewer or candidate)
   */
  async getAll(req, res, next) {
    try {
      let interviews;
      if (req.user.role === 'interviewer') {
        interviews = await Interview.getUpcomingForInterviewer(req.user.id);
      } else {
        interviews = await Interview.getUpcomingForCandidate(req.user.id);
      }
      return res.status(200).json(interviews);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch interview by ID
   */
  async getById(req, res, next) {
    try {
      const interview = await Interview.findById(req.params.id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      // Authorization checks
      if (req.user.role === 'candidate' && interview.candidate_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You are not the candidate for this interview.' });
      }
      if (req.user.role === 'interviewer' && interview.interviewer_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. You are not the interviewer for this interview.' });
      }

      return res.status(200).json(interview);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Update interview (Interviewer only, or state sync)
   */
  async update(req, res, next) {
    try {
      const interview = await Interview.findById(req.params.id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      // Only the assigned interviewer can edit details
      if (interview.interviewer_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. Only the assigned interviewer can edit.' });
      }

      // Filter updates
      const allowedUpdates = [
        'title',
        'question_title',
        'question_description',
        'difficulty',
        'programming_language',
        'scheduled_at',
        'duration_minutes',
        'status',
      ];
      const updates = {};
      
      for (const [key, value] of Object.entries(req.body)) {
        if (allowedUpdates.includes(key)) {
          updates[key] = value;
        }
      }

      const updatedInterview = await Interview.update(req.params.id, updates);
      return res.status(200).json(updatedInterview);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Delete an interview (Interviewer only)
   */
  async delete(req, res, next) {
    try {
      const interview = await Interview.findById(req.params.id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      if (interview.interviewer_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. Only the interviewer can delete this.' });
      }

      await Interview.delete(req.params.id);
      return res.status(200).json({ message: 'Interview cancelled and deleted successfully.' });
    } catch (err) {
      next(err);
    }
  },

  // Role-specific lists
  async getCandidateUpcoming(req, res, next) {
    try {
      const interviews = await Interview.getUpcomingForCandidate(req.user.id);
      return res.status(200).json(interviews);
    } catch (err) {
      next(err);
    }
  },

  async getCandidateHistory(req, res, next) {
    try {
      const history = await Interview.getHistoryForCandidate(req.user.id);
      return res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  },

  async getInterviewerUpcoming(req, res, next) {
    try {
      const interviews = await Interview.getUpcomingForInterviewer(req.user.id);
      return res.status(200).json(interviews);
    } catch (err) {
      next(err);
    }
  },

  async getInterviewerHistory(req, res, next) {
    try {
      const history = await Interview.getHistoryForInterviewer(req.user.id);
      return res.status(200).json(history);
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch room details for Candidate Lobby check (requires login check in controller)
   */
  async getRoomDetails(req, res, next) {
    try {
      const { roomId } = req.params;
      const interview = await Interview.findByRoomId(roomId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview room not found.' });
      }

      if (interview.status === 'completed' || interview.status === 'cancelled') {
        return res.status(400).json({ 
          message: `This interview has already ended.`, 
          status: interview.status 
        });
      }

      // Check if user is candidate or interviewer assigned
      if (req.user.id !== interview.candidate_id && req.user.id !== interview.interviewer_id) {
        return res.status(403).json({ message: 'Access denied. You are not assigned to this interview.' });
      }

      const updates = {};
      // Initialize round started timestamp on candidate entry
      if (req.user.role === 'candidate' && !interview.round_started_at) {
        updates.round_started_at = new Date();
        interview.round_started_at = updates.round_started_at;
      }

      // Transition to waiting when candidate opens the lobby URL (Phase 14)
      if (req.user.role === 'candidate' && interview.status === 'scheduled') {
        updates.status = 'waiting';
        interview.status = 'waiting';
      }

      if (Object.keys(updates).length > 0) {
        await Interview.update(interview.id, updates);
      }

      // Calculate remaining sectional seconds
      const SECTION_TIMERS = {
        1: 25 * 60, // R1: Numerical (25 min)
        2: 25 * 60, // R2: Verbal (25 min)
        3: 25 * 60, // R3: Reasoning (25 min)
        4: 20 * 60, // R4: Advanced Quant (20 min)
        5: 15 * 60, // R5: Advanced Reasoning (15 min)
        6: 30 * 60, // R6: Coding Easy (30 min)
        7: 45 * 60  // R7: Coding Advanced (45 min)
      };

      let secondsLeft = 0;
      if (interview.round_started_at) {
        const roundDuration = SECTION_TIMERS[interview.current_round || 1] || 1800;
        const elapsedSeconds = Math.floor((new Date().getTime() - new Date(interview.round_started_at).getTime()) / 1000);
        secondsLeft = Math.max(0, roundDuration - elapsedSeconds);
      } else {
        secondsLeft = SECTION_TIMERS[interview.current_round || 1] || 1800;
      }

      return res.status(200).json({
        id: interview.id,
        room_id: interview.room_id,
        title: interview.title,
        interviewer_name: interview.interviewer_name,
        candidate_name: interview.candidate_name,
        scheduled_at: interview.scheduled_at,
        duration_minutes: interview.duration_minutes,
        status: interview.status,
        programming_language: interview.programming_language,
        invite_token: interview.invite_token,
        current_round: interview.current_round || 1,
        round1_score: interview.round1_score,
        round2_score: interview.round2_score,
        round3_score: interview.round3_score,
        round4_score: interview.round4_score,
        round5_score: interview.round5_score,
        round6_score: interview.round6_score,
        round7_score: interview.round7_score,
        round4_code: interview.round4_code,
        round5_code: interview.round5_code,
        round6_code: interview.round6_code,
        round7_code: interview.round7_code,
        question_title: interview.question_title,
        question_description: interview.question_description,
        difficulty: interview.difficulty,
        round_started_at: interview.round_started_at,
        seconds_left: secondsLeft
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Candidate or Recruiter registers joining
   */
  async joinSession(req, res, next) {
    try {
      const { id } = req.params;
      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview session not found.' });
      }

      if (req.user.id !== interview.candidate_id && req.user.id !== interview.interviewer_id) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      const updates = {};
      let isCandidateJoin = false;
      if (req.user.role === 'candidate') {
        updates.candidate_joined_at = new Date();
        updates.status = 'active'; // Flow: waiting -> active (Phase 14)
        isCandidateJoin = true;
      } else if (req.user.role === 'interviewer') {
        updates.interviewer_joined_at = new Date();
      }

      const updated = await Interview.update(id, updates);

      // Notify the interviewer via email if the candidate joined
      if (isCandidateJoin) {
        const clientUrl = process.env.VITE_CLIENT_URL || process.env.CORS_ORIGIN || 'http://localhost:5173';
        const roomLink = `${clientUrl}/room/${interview.room_id}`;
        
        emailService.sendCandidateJoinedNotification({
          interviewerName: interview.interviewer_name,
          interviewerEmail: interview.interviewer_email,
          candidateName: interview.candidate_name,
          interviewTitle: interview.title,
          roomLink
        }).catch(err => console.error('Failed to send candidate joined email alert:', err.message));
      }

      return res.status(200).json({
        message: 'Joined successfully.',
        status: updated.status
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Fetch reconnection details (survive refresh)
   */
  async getSessionState(req, res, next) {
    try {
      const { id } = req.params;
      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview session not found.' });
      }

      if (req.user.id !== interview.candidate_id && req.user.id !== interview.interviewer_id) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      return res.status(200).json({
        status: interview.status,
        candidate_joined_at: interview.candidate_joined_at,
        interviewer_joined_at: interview.interviewer_joined_at
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Submit interview round score (MCQ or Coding)
   */
  async submitRound(req, res, next) {
    try {
      const { id } = req.params;
      const { roundNumber, answers, code, passedCount, totalCount } = req.body;

      const interview = await Interview.findById(id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview session not found.' });
      }

      // Check authorization
      if (req.user.id !== interview.candidate_id) {
        return res.status(403).json({ message: 'Only the assigned candidate can submit answers.' });
      }

      const updates = {};
      let score = null;

      if (roundNumber >= 1 && roundNumber <= 5) {
        // Evaluate MCQ round
        const aptitudeQuestions = require('../utils/aptitudeQuestions');
        let categoryQuestions = [];
        if (roundNumber === 1) categoryQuestions = aptitudeQuestions.quantitative;
        else if (roundNumber === 2) categoryQuestions = aptitudeQuestions.verbal;
        else if (roundNumber === 3) categoryQuestions = aptitudeQuestions.reasoning;
        else if (roundNumber === 4) categoryQuestions = aptitudeQuestions.advanced_quant;
        else if (roundNumber === 5) categoryQuestions = aptitudeQuestions.advanced_reasoning;

        let correctCount = 0;
        categoryQuestions.forEach((q) => {
          const candidateAnswer = answers && answers[q.id];
          if (candidateAnswer !== undefined && parseInt(candidateAnswer) === q.correctOption) {
            correctCount++;
          }
        });

        score = correctCount;
        updates[`round${roundNumber}_score`] = score;
      } else if (roundNumber === 6) {
        // Coding Round 1 (Easy)
        updates.round6_score = passedCount;
        updates.round6_code = code || '';
      } else if (roundNumber === 7) {
        // Coding Round 2 (Advanced)
        updates.round7_score = passedCount;
        updates.round7_code = code || '';
        updates.status = 'completed'; // Completing the interview session!
      }

      // Increment round count
      const nextRound = parseInt(roundNumber) + 1;
      updates.current_round = nextRound;
      updates.round_started_at = new Date(); // Reset start time for next round

      // Auto-load coding question details for rounds 6 & 7
      if (nextRound === 6) {
        let qTitle = 'Two Sum';
        let qDesc = `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

### Example 1:
**Input:** nums = [2,7,11,15], target = 9
**Output:** [0,1]
**Explanation:** Because nums[0] + nums[1] == 9, we return [0, 1].

### Example 2:
**Input:** nums = [3,2,4], target = 6
**Output:** [1,2]

### Constraints:
* \`2 <= nums.length <= 10^4\`
* \`-10^9 <= nums[i] <= 10^9\`
* \`-10^9 <= target <= 10^9\``;
        let qDiff = 'Easy';

        try {
          const Question = require('../models/questionModel');
          const dbQuest = await Question.findById(1);
          if (dbQuest) {
            qTitle = dbQuest.title;
            qDesc = dbQuest.description;
            qDiff = dbQuest.difficulty;
          }
        } catch (err) {
          console.warn('Could not fetch preseeded easy question from DB, using fallback.');
        }

        updates.question_title = qTitle;
        updates.question_description = qDesc;
        updates.difficulty = qDiff;
      } else if (nextRound === 7) {
        let qTitle = 'Reverse Linked List';
        let qDesc = `Given the head of a singly linked list, reverse the list, and return the reversed list.

### Example 1:
**Input:** head = [1,2,3,4,5]
**Output:** [5,4,3,2,1]

### Example 2:
**Input:** head = [1,2]
**Output:** [2,1]

### Constraints:
* The number of nodes in the list is the range \`[0, 5000]\`.
* \`-5000 <= Node.val <= 5000\``;
        let qDiff = 'Medium';

        try {
          const Question = require('../models/questionModel');
          const dbQuest = await Question.findById(2);
          if (dbQuest) {
            qTitle = dbQuest.title;
            qDesc = dbQuest.description;
            qDiff = dbQuest.difficulty;
          }
        } catch (err) {
          console.warn('Could not fetch preseeded advanced question from DB, using fallback.');
        }

        updates.question_title = qTitle;
        updates.question_description = qDesc;
        updates.difficulty = qDiff;
      }

      const updated = await Interview.update(id, updates);

      // Notify the interviewer via socket in real-time
      const io = req.app.get('io');
      if (io) {
        // Notify the interviewer's dashboard in real-time
        io.to(`user:${interview.interviewer_id}`).emit('interview-status-update', {
          interviewId: interview.id,
          currentRound: updated.current_round,
          status: updated.status
        });
        
        // Also notify the active room if they are both in the room
        io.to(interview.room_id).emit('round-submitted', {
          currentRound: updated.current_round,
          status: updated.status,
          question_title: updated.question_title,
          question_description: updated.question_description,
          difficulty: updated.difficulty
        });
      }

      return res.status(200).json({
        message: 'Round submitted successfully.',
        currentRound: updated.current_round,
        status: updated.status,
        score
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = interviewController;
