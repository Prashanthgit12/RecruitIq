const db = require('../config/db');

const Chat = {
  /**
   * Save a chat message to DB
   */
  async create({ interview_id, sender_id, message }) {
    const queryText = `
      INSERT INTO chat_messages (interview_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING id, interview_id, sender_id, message, created_at;
    `;
    const { rows } = await db.query(queryText, [interview_id, sender_id, message]);
    return rows[0];
  },

  /**
   * Retrieve chat history for an interview session
   */
  async findByInterviewId(interviewId) {
    const queryText = `
      SELECT cm.*, u.name AS sender_name, u.role AS sender_role
      FROM chat_messages cm
      JOIN users u ON cm.sender_id = u.id
      WHERE cm.interview_id = $1
      ORDER BY cm.created_at ASC;
    `;
    const { rows } = await db.query(queryText, [interviewId]);
    return rows;
  },
};

module.exports = Chat;
