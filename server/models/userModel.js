const db = require('../config/db');

const User = {
  /**
   * Create a new user in the database
   */
  async create({ name, email, passwordHash, role }) {
    const queryText = `
      INSERT INTO users (name, email, password_hash, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, role, created_at;
    `;
    const values = [name, email, passwordHash, role];
    const { rows } = await db.query(queryText, values);
    return rows[0];
  },

  /**
   * Find a user by email
   */
  async findByEmail(email) {
    const queryText = 'SELECT * FROM users WHERE email = $1;';
    const { rows } = await db.query(queryText, [email]);
    return rows[0];
  },

  /**
   * Find a user by ID
   */
  async findById(id) {
    const queryText = 'SELECT id, name, email, role, created_at FROM users WHERE id = $1;';
    const { rows } = await db.query(queryText, [id]);
    return rows[0];
  },
};

module.exports = User;
