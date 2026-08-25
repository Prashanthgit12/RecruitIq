const db = require('../config/db');

const TestCase = {
  /**
   * Save a test case
   */
  async create({ question_id, interview_id, input, expected_output, is_hidden }) {
    const queryText = `
      INSERT INTO test_cases (question_id, interview_id, input, expected_output, is_hidden)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [
      question_id || null,
      interview_id || null,
      input,
      expected_output,
      is_hidden || false,
    ]);
    return rows[0];
  },

  /**
   * Fetch test cases associated with a question or interview
   */
  async findByQuestionId(questionId) {
    const queryText = 'SELECT * FROM test_cases WHERE question_id = $1 ORDER BY id ASC;';
    const { rows } = await db.query(queryText, [questionId]);
    return rows;
  },

  async findByInterviewId(interviewId) {
    const queryText = 'SELECT * FROM test_cases WHERE interview_id = $1 ORDER BY id ASC;';
    const { rows } = await db.query(queryText, [interviewId]);
    return rows;
  },

  /**
   * Delete test cases for a question
   */
  async deleteByQuestionId(questionId) {
    const queryText = 'DELETE FROM test_cases WHERE question_id = $1;';
    await db.query(queryText, [questionId]);
  },
};

module.exports = TestCase;
