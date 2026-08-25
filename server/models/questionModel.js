const db = require('../config/db');

const Question = {
  /**
   * Fetch questions list with favorites joined
   */
  async getAll(userId, { search = '', category = '', difficulty = '', language = '' }) {
    const values = [];
    let paramIdx = 1;

    let queryText = `
      SELECT q.*, (f.id IS NOT NULL) AS is_favorite
      FROM questions q
      LEFT JOIN question_favorites f ON q.id = f.question_id AND f.user_id = $${paramIdx}
      WHERE 1=1
    `;
    values.push(userId);
    paramIdx++;

    // Title / description search
    if (search) {
      queryText += ` AND (q.title ILIKE $${paramIdx} OR q.description ILIKE $${paramIdx})`;
      values.push(`%${search}%`);
      paramIdx++;
    }

    // Category filter
    if (category && category !== 'all') {
      queryText += ` AND q.category = $${paramIdx}`;
      values.push(category);
      paramIdx++;
    }

    // Difficulty filter
    if (difficulty && difficulty !== 'all') {
      queryText += ` AND q.difficulty = $${paramIdx}`;
      values.push(difficulty);
      paramIdx++;
    }

    // Language filter
    if (language && language !== 'all') {
      queryText += ` AND q.programming_language = $${paramIdx}`;
      values.push(language);
      paramIdx++;
    }

    queryText += ` ORDER BY q.is_custom ASC, q.created_at DESC;`;

    const { rows } = await db.query(queryText, values);
    return rows;
  },

  /**
   * Find question details by ID
   */
  async findById(id) {
    const queryText = 'SELECT * FROM questions WHERE id = $1;';
    const { rows } = await db.query(queryText, [id]);
    return rows[0];
  },

  /**
   * Create custom question
   */
  async create({
    title,
    description,
    difficulty,
    category,
    tags,
    programming_language,
    input_format,
    output_format,
    constraints,
    examples,
    starter_code,
    hints,
    expected_time_complexity,
    expected_space_complexity,
    created_by
  }) {
    const queryText = `
      INSERT INTO questions (
        title, description, difficulty, category, tags,
        programming_language, input_format, output_format, constraints,
        examples, starter_code, hints, expected_time_complexity,
        expected_space_complexity, is_custom, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, true, $15)
      RETURNING *;
    `;
    const values = [
      title,
      description,
      difficulty || 'Medium',
      category,
      tags || [],
      programming_language || 'javascript',
      input_format || '',
      output_format || '',
      constraints || '',
      examples || '[]',
      starter_code || '{}',
      hints || [],
      expected_time_complexity || 'O(n)',
      expected_space_complexity || 'O(1)',
      created_by
    ];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  /**
   * Update question
   */
  async update(id, fields) {
    const setClause = [];
    const values = [];
    let paramIndex = 1;

    for (const [key, val] of Object.entries(fields)) {
      setClause.push(`${key} = $${paramIndex}`);
      values.push(val);
      paramIndex++;
    }

    if (setClause.length === 0) return null;

    values.push(id);
    const queryText = `
      UPDATE questions
      SET ${setClause.join(', ')}, updated_at = NOW()
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  /**
   * Delete custom question
   */
  async delete(id) {
    const queryText = 'DELETE FROM questions WHERE id = $1 RETURNING id;';
    const { rows } = await db.query(queryText, [id]);
    return rows[0];
  },

  /**
   * Toggle bookmark/favorite question
   */
  async addFavorite(userId, questionId) {
    const queryText = `
      INSERT INTO question_favorites (user_id, question_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, question_id) DO NOTHING
      RETURNING id;
    `;
    const { rows } = await db.query(queryText, [userId, questionId]);
    return rows[0];
  },

  async removeFavorite(userId, questionId) {
    const queryText = `
      DELETE FROM question_favorites
      WHERE user_id = $1 AND question_id = $2
      RETURNING id;
    `;
    const { rows } = await db.query(queryText, [userId, questionId]);
    return rows[0];
  },
};

module.exports = Question;
