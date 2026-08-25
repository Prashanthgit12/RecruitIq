const CodeSubmission = require('../models/codeSubmissionModel');
const Interview = require('../models/interviewModel');
const TestCase = require('../models/testCaseModel');
const Question = require('../models/questionModel');
const db = require('../config/db');
const codeExecutionService = require('../services/codeExecutionService');

const codeController = {
  /**
   * Submit final code (Candidate only)
   * Executes code against BOTH public and hidden test cases, registers outcomes, and saves submission.
   */
  async submitCode(req, res, next) {
    try {
      const { interview_id, language, code } = req.body;

      if (!interview_id || !language || !code) {
        return res.status(400).json({ message: 'Interview ID, programming language, and code are required.' });
      }

      const interview = await Interview.findById(interview_id);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      if (interview.candidate_id !== req.user.id) {
        return res.status(403).json({ message: 'Access denied. Only the assigned candidate can submit code.' });
      }

      // 1. Resolve test cases (from question matching the active question title)
      let testCases = [];
      const questionsList = await Question.getAll(req.user.id, { search: interview.question_title });
      const matchedQuestion = questionsList.find(q => q.title.toLowerCase() === interview.question_title.toLowerCase());
      
      if (matchedQuestion) {
        testCases = await TestCase.findByQuestionId(matchedQuestion.id);
      } else {
        // Fallback test case if no question registered
        testCases = [
          { id: 99, input: '[2,7,11,15]\n9', expected_output: '[0,1]', is_hidden: false }
        ];
      }

      // 2. Execute code securely in VM sandbox (All test cases)
      const execution = await codeExecutionService.execute(language, code, testCases);

      // 3. Save final code submission
      const submission = await CodeSubmission.create({
        interview_id,
        candidate_id: req.user.id,
        language,
        code,
      });

      // 4. Save code execution outcomes inside SQL
      await db.query(`
        INSERT INTO code_execution_results (interview_id, passed_count, total_count, runtime_ms, memory_mb, results)
        VALUES ($1, $2, $3, $4, $5, $6);
      `, [
        interview_id,
        execution.passedCount,
        execution.totalCount,
        execution.runtimeMs,
        parseFloat(execution.memoryMb),
        JSON.stringify(execution.results)
      ]);

      return res.status(201).json({
        message: 'Code submitted and evaluated successfully.',
        submission,
        evaluation: {
          status: execution.status,
          passedCount: execution.passedCount,
          totalCount: execution.totalCount,
          runtimeMs: execution.runtimeMs,
          memoryMb: execution.memoryMb
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get code submission details
   */
  async getSubmission(req, res, next) {
    try {
      const { interviewId } = req.params;

      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found.' });
      }

      const isInterviewer = interview.interviewer_id === req.user.id;
      const isCandidate = interview.candidate_id === req.user.id;

      if (!isInterviewer && !isCandidate) {
        return res.status(403).json({ message: 'Access denied.' });
      }

      const submission = await CodeSubmission.findByInterviewId(interviewId);
      if (!submission) {
        return res.status(404).json({ message: 'No code submissions found.' });
      }

      // Load trial test results to display along with submission
      let executionResults = null;
      try {
        const execRes = await db.query(
          'SELECT * FROM code_execution_results WHERE interview_id = $1 ORDER BY created_at DESC LIMIT 1;',
          [interviewId]
        );
        if (execRes.rows.length > 0) {
          executionResults = execRes.rows[0];
          // Hide hidden test details for candidates in accordance with Phase 27
          if (req.user.role === 'candidate' && executionResults.results) {
            const resultsArr = typeof executionResults.results === 'string' ? JSON.parse(executionResults.results) : executionResults.results;
            executionResults.results = resultsArr.map(tc => {
              if (tc.is_hidden) {
                return { id: tc.id, passed: tc.passed, is_hidden: true, status: tc.status };
              }
              return tc;
            });
          }
        }
      } catch (err) {
        console.error('Error fetching execution results:', err.message);
      }

      return res.status(200).json({
        ...submission,
        executionResults
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Trial run candidate's code against PUBLIC test cases only
   */
  async runCode(req, res, next) {
    try {
      const { language, code, interview_id } = req.body;

      if (!language || !code) {
        return res.status(400).json({ message: 'Programming language and code are required.' });
      }

      let testCases = [];
      if (interview_id) {
        const interview = await Interview.findById(interview_id);
        if (interview) {
          const questionsList = await Question.getAll(req.user.id, { search: interview.question_title });
          const matchedQuestion = questionsList.find(q => q.title.toLowerCase() === interview.question_title.toLowerCase());
          if (matchedQuestion) {
            testCases = await TestCase.findByQuestionId(matchedQuestion.id);
          }
        }
      }

      // If no interview or question resolved, use boilerplate fallback
      if (testCases.length === 0) {
        testCases = [
          { id: 99, input: '[2,7,11,15]\n9', expected_output: '[0,1]', is_hidden: false }
        ];
      }

      // Filter: Candidates can only run public test cases (Phase 27 requirement)
      const publicCases = req.user.role === 'candidate'
        ? testCases.filter(tc => !tc.is_hidden)
        : testCases;

      const execution = await codeExecutionService.execute(language, code, publicCases);

      return res.status(200).json(execution);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = codeController;
