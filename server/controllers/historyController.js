const db = require('../config/db');

const historyController = {
  /**
   * Get paginated and filtered interview history list
   */
  async getHistory(req, res, next) {
    try {
      const { role, id: userId } = req.user;
      const {
        search = '',
        status = 'completed', // default to completed, but allow all
        startDate,
        endDate,
        page = 1,
        limit = 10,
      } = req.query;

      const offset = (parseInt(page) - 1) * parseInt(limit);
      const values = [];
      let paramIdx = 1;

      // Base query building
      let selectFields = `
        i.*,
        e.overall_rating,
        e.feedback,
        e.result,
        intv.name AS interviewer_name,
        cand.name AS candidate_name
      `;

      let queryText = `
        FROM interviews i
        LEFT JOIN users intv ON i.interviewer_id = intv.id
        LEFT JOIN users cand ON i.candidate_id = cand.id
        LEFT JOIN evaluations e ON i.id = e.interview_id
        WHERE 1=1
      `;

      // Enforce authorization filter
      if (role === 'interviewer') {
        queryText += ` AND i.interviewer_id = $${paramIdx}`;
        values.push(userId);
        paramIdx++;
      } else {
        queryText += ` AND i.candidate_id = $${paramIdx}`;
        values.push(userId);
        paramIdx++;
      }

      // Add status filter if provided
      if (status && status !== 'all') {
        queryText += ` AND i.status = $${paramIdx}`;
        values.push(status);
        paramIdx++;
      }

      // Add search term filter
      if (search) {
        if (role === 'interviewer') {
          queryText += ` AND (i.title ILIKE $${paramIdx} OR cand.name ILIKE $${paramIdx} OR cand.email ILIKE $${paramIdx})`;
        } else {
          queryText += ` AND (i.title ILIKE $${paramIdx} OR intv.name ILIKE $${paramIdx})`;
        }
        values.push(`%${search}%`);
        paramIdx++;
      }

      // Add date range filters
      if (startDate) {
        queryText += ` AND i.scheduled_at >= $${paramIdx}`;
        values.push(startDate);
        paramIdx++;
      }
      if (endDate) {
        queryText += ` AND i.scheduled_at <= $${paramIdx}`;
        values.push(endDate);
        paramIdx++;
      }

      // Get total count
      const countQuery = `SELECT COUNT(*)::int ${queryText};`;
      const countRes = await db.query(countQuery, values);
      const total = countRes.rows[0].count;

      // Add ordering, limit, and offset
      queryText += ` ORDER BY i.scheduled_at DESC LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`;
      values.push(parseInt(limit));
      values.push(offset);

      const finalQuery = `SELECT ${selectFields} ${queryText};`;
      const { rows } = await db.query(finalQuery, values);

      // Map response to hide ratings from candidates
      const results = rows.map((row) => {
        if (role === 'candidate') {
          return {
            id: row.id,
            room_id: row.room_id,
            title: row.title,
            interviewer_name: row.interviewer_name,
            scheduled_at: row.scheduled_at,
            duration_minutes: row.duration_minutes,
            status: row.status,
            result: row.result, // Result (selected/rejected) is visible, ratings are not
          };
        }
        return {
          id: row.id,
          room_id: row.room_id,
          title: row.title,
          candidate_name: row.candidate_name,
          scheduled_at: row.scheduled_at,
          duration_minutes: row.duration_minutes,
          status: row.status,
          overall_rating: row.overall_rating,
          result: row.result,
        };
      });

      return res.status(200).json({
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        results,
      });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = historyController;
