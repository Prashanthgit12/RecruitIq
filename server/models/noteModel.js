const db = require('../config/db');

const Note = {
  /**
   * Save or update private notes for an interview
   */
  async upsert({ interview_id, interviewer_id, notes }) {
    const queryText = `
      INSERT INTO interviewer_notes (interview_id, interviewer_id, notes, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (interview_id)
      DO UPDATE SET
        notes = EXCLUDED.notes,
        updated_at = NOW()
      RETURNING *;
    `;
    const values = [interview_id, interviewer_id, notes];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  /**
   * Find notes by interview ID
   */
  async findByInterviewId(interviewId) {
    const queryText = 'SELECT * FROM interviewer_notes WHERE interview_id = $1;';
    const { rows } = await db.query(queryText, [interviewId]);
    return rows[0];
  },
};

module.exports = Note;
