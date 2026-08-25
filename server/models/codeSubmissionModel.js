const db = require('../config/db');

const CodeSubmission = {
  /**
   * Save a code submission
   */
  async create({ interview_id, candidate_id, language, code }) {
    const queryText = `
      INSERT INTO code_submissions (interview_id, candidate_id, language, code)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const { rows } = await db.query(queryText, [interview_id, candidate_id, language, code]);
    return rows[0];
  },

  /**
   * Find code submission by interview ID
   */
  async findByInterviewId(interviewId) {
    const queryText = `
      SELECT cs.*, u.name AS candidate_name
      FROM code_submissions cs
      JOIN users u ON cs.candidate_id = u.id
      WHERE cs.interview_id = $1
      ORDER BY cs.submitted_at DESC
      LIMIT 1;
    `;
    const { rows } = await db.query(queryText, [interviewId]);
    return rows[0];
  },
};

module.exports = CodeSubmission;
