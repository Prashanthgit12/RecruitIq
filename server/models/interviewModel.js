const db = require('../config/db');

const Interview = {
  /**
   * Create an interview
   */
  async create({
    room_id,
    title,
    interviewer_id,
    candidate_id,
    question_title,
    question_description,
    difficulty,
    programming_language,
    scheduled_at,
    duration_minutes,
  }) {
    const crypto = require('crypto');
    // Generate secure random invite token
    const invite_token = crypto.randomBytes(8).toString('hex').toUpperCase();
    // Expiry: 7 days after scheduled date
    const invite_expires_at = new Date(new Date(scheduled_at).getTime() + 7 * 24 * 60 * 60 * 1000);

    const queryText = `
      INSERT INTO interviews (
        room_id, title, interviewer_id, candidate_id, 
        question_title, question_description, difficulty, 
        programming_language, scheduled_at, duration_minutes, status,
        invite_token, invite_expires_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'scheduled', $11, $12)
      RETURNING *;
    `;
    const values = [
      room_id,
      title,
      interviewer_id,
      candidate_id,
      question_title || '',
      question_description || '',
      difficulty || 'Medium',
      programming_language || 'javascript',
      scheduled_at,
      duration_minutes || 60,
      invite_token,
      invite_expires_at
    ];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  /**
   * Find an interview by Room ID
   */
  async findByRoomId(roomId) {
    const queryText = `
      SELECT i.*, 
             intv.name AS interviewer_name, intv.email AS interviewer_email,
             cand.name AS candidate_name, cand.email AS candidate_email
      FROM interviews i
      LEFT JOIN users intv ON i.interviewer_id = intv.id
      LEFT JOIN users cand ON i.candidate_id = cand.id
      WHERE i.room_id = $1;
    `;
    const { rows } = await db.query(queryText, [roomId]);
    return rows[0];
  },

  /**
   * Find an interview by ID
   */
  async findById(id) {
    const queryText = `
      SELECT i.*, 
             intv.name AS interviewer_name, intv.email AS interviewer_email,
             cand.name AS candidate_name, cand.email AS candidate_email
      FROM interviews i
      LEFT JOIN users intv ON i.interviewer_id = intv.id
      LEFT JOIN users cand ON i.candidate_id = cand.id
      WHERE i.id = $1;
    `;
    const { rows } = await db.query(queryText, [id]);
    return rows[0];
  },

  /**
   * Update interview fields (e.g. status, active question, language, etc.)
   */
  async update(id, fields) {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    // Build query dynamically
    for (const [key, val] of Object.entries(fields)) {
      setClause.push(`${key} = $${paramIndex}`);
      values.push(val);
      paramIndex++;
    }

    if (setClause.length === 0) return null;

    values.push(id);
    const queryText = `
      UPDATE interviews
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  /**
   * Get upcoming interviews for candidate
   */
  async getUpcomingForCandidate(candidateId) {
    const queryText = `
      SELECT i.*, u.name AS interviewer_name
      FROM interviews i
      JOIN users u ON i.interviewer_id = u.id
      WHERE i.candidate_id = $1 AND i.status != 'completed' AND i.status != 'cancelled'
      ORDER BY i.scheduled_at ASC;
    `;
    const { rows } = await db.query(queryText, [candidateId]);
    return rows;
  },

  /**
   * Get history of interviews for candidate
   */
  async getHistoryForCandidate(candidateId) {
    const queryText = `
      SELECT i.*, u.name AS interviewer_name, e.result
      FROM interviews i
      JOIN users u ON i.interviewer_id = u.id
      LEFT JOIN evaluations e ON i.id = e.interview_id
      WHERE i.candidate_id = $1 AND i.status = 'completed'
      ORDER BY i.scheduled_at DESC;
    `;
    const { rows } = await db.query(queryText, [candidateId]);
    return rows;
  },

  /**
   * Get upcoming interviews for interviewer
   */
  async getUpcomingForInterviewer(interviewerId) {
    const queryText = `
      SELECT i.*, u.name AS candidate_name, u.email AS candidate_email
      FROM interviews i
      JOIN users u ON i.candidate_id = u.id
      WHERE i.interviewer_id = $1 AND i.status != 'completed'
      ORDER BY i.scheduled_at ASC;
    `;
    const { rows } = await db.query(queryText, [interviewerId]);
    return rows;
  },

  /**
   * Get history of interviews for interviewer
   */
  async getHistoryForInterviewer(interviewerId) {
    const queryText = `
      SELECT i.*, u.name AS candidate_name, u.email AS candidate_email, e.overall_rating, e.result
      FROM interviews i
      JOIN users u ON i.candidate_id = u.id
      LEFT JOIN evaluations e ON i.id = e.interview_id
      WHERE i.interviewer_id = $1 AND i.status = 'completed'
      ORDER BY i.scheduled_at DESC;
    `;
    const { rows } = await db.query(queryText, [interviewerId]);
    return rows;
  },

  /**
   * Count interviews by status and user role
   */
  async getStatsForCandidate(candidateId) {
    const upcomingQuery = 'SELECT COUNT(*)::int FROM interviews WHERE candidate_id = $1 AND status != \'completed\';';
    const completedQuery = 'SELECT COUNT(*)::int FROM interviews WHERE candidate_id = $1 AND status = \'completed\';';
    const totalQuery = 'SELECT COUNT(*)::int FROM interviews WHERE candidate_id = $1;';

    const [upcomingRes, completedRes, totalRes] = await Promise.all([
      db.query(upcomingQuery, [candidateId]),
      db.query(completedQuery, [candidateId]),
      db.query(totalQuery, [candidateId]),
    ]);

    return {
      upcoming: upcomingRes.rows[0].count,
      completed: completedRes.rows[0].count,
      total: totalRes.rows[0].count,
    };
  },

  async getStatsForInterviewer(interviewerId) {
    const totalQuery = 'SELECT COUNT(*)::int FROM interviews WHERE interviewer_id = $1;';
    const upcomingQuery = 'SELECT COUNT(*)::int FROM interviews WHERE interviewer_id = $1 AND status != \'completed\';';
    const completedQuery = 'SELECT COUNT(*)::int FROM interviews WHERE interviewer_id = $1 AND status = \'completed\';';
    const selectedQuery = `
      SELECT COUNT(*)::int 
      FROM interviews i 
      JOIN evaluations e ON i.id = e.interview_id 
      WHERE i.interviewer_id = $1 AND e.result = 'selected';
    `;

    const [totalRes, upcomingRes, completedRes, selectedRes] = await Promise.all([
      db.query(totalQuery, [interviewerId]),
      db.query(upcomingQuery, [interviewerId]),
      db.query(completedQuery, [interviewerId]),
      db.query(selectedQuery, [interviewerId]),
    ]);

    return {
      total: totalRes.rows[0].count,
      upcoming: upcomingRes.rows[0].count,
      completed: completedRes.rows[0].count,
      selected: selectedRes.rows[0].count,
    };
  },

  /**
   * Delete an interview by ID
   */
  async delete(id) {
    const queryText = 'DELETE FROM interviews WHERE id = $1 RETURNING id;';
    const { rows } = await db.query(queryText, [id]);
    return rows[0];
  },
};

module.exports = Interview;
