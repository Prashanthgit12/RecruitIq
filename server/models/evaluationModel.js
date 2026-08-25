const db = require('../config/db');

const Evaluation = {
  /**
   * Upsert evaluation (create or update if already exists for this interview)
   */
  async upsert({
    interview_id,
    communication_rating,
    problem_solving_rating,
    coding_rating,
    technical_rating,
    overall_rating,
    feedback,
    result,
  }) {
    const queryText = `
      INSERT INTO evaluations (
        interview_id, 
        communication_rating, 
        problem_solving_rating, 
        coding_rating, 
        technical_rating, 
        overall_rating, 
        feedback, 
        result
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (interview_id) 
      DO UPDATE SET
        communication_rating = EXCLUDED.communication_rating,
        problem_solving_rating = EXCLUDED.problem_solving_rating,
        coding_rating = EXCLUDED.coding_rating,
        technical_rating = EXCLUDED.technical_rating,
        overall_rating = EXCLUDED.overall_rating,
        feedback = EXCLUDED.feedback,
        result = EXCLUDED.result
      RETURNING *;
    `;
    const values = [
      interview_id,
      communication_rating,
      problem_solving_rating,
      coding_rating,
      technical_rating,
      overall_rating,
      feedback,
      result,
    ];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  /**
   * Find evaluation by interview ID
   */
  async findByInterviewId(interviewId) {
    const queryText = 'SELECT * FROM evaluations WHERE interview_id = $1;';
    const { rows } = await db.query(queryText, [interviewId]);
    return rows[0];
  },
};

module.exports = Evaluation;
