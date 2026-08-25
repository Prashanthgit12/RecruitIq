const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_interview_room_token_key_12345';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Helper to generate JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

const authController = {
  /**
   * Register a new user
   */
  async register(req, res, next) {
    try {
      const { name, email, password, confirmPassword, role, passcode } = req.body;

      if (!name || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ message: 'Passwords do not match.' });
      }

      if (role === 'interviewer') {
        const requiredPasscode = process.env.INTERVIEWER_REGISTRATION_PASSCODE || 'INTERVIEWER2026';
        if (passcode !== requiredPasscode) {
          return res.status(400).json({ message: 'Invalid recruiter access passcode.' });
        }
      }

      if (role !== 'candidate' && role !== 'interviewer') {
        return res.status(400).json({ message: 'Invalid role selection.' });
      }

      // Check if user already exists
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already registered.' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Create user
      const user = await User.create({ name, email, passwordHash, role });

      // Generate token
      const token = generateToken(user);

      return res.status(201).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Log in user
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
      }

      // Find user
      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials.' });
      }

      // Generate token
      const token = generateToken(user);

      return res.status(200).json({
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current user profiles
   */
  async getMe(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated.' });
      }
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found.' });
      }
      return res.status(200).json(user);
    } catch (err) {
      next(err);
    }
  },

  async resetDatabase(req, res, next) {
    try {
      const db = require('../config/db');
      try {
        await db.query('TRUNCATE users CASCADE;');
      } catch (err) {
        // Ignored if not connected to Postgres
      }

      if (db.mockDb) {
        db.mockDb.users = [];
        db.mockDb.interviews = [];
        db.mockDb.evaluations = [];
        db.mockDb.notes = [];
        db.mockDb.submissions = [];
        db.mockDb.chat_messages = [];
        db.mockDb.code_execution_results = [];
      }

      return res.status(200).json({ message: 'Database reset successfully. All users and interviews cleared.' });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
