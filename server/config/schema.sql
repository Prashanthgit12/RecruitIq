-- PostgreSQL Database Schema for Smart Interview Room

-- Enable UUID extension if supported (optional, we can also use SERIAL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('candidate', 'interviewer')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Interviews Table
CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  room_id VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  interviewer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  candidate_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  question_title VARCHAR(255) DEFAULT '',
  question_description TEXT DEFAULT '',
  difficulty VARCHAR(50) DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  programming_language VARCHAR(50) DEFAULT 'javascript',
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  status VARCHAR(50) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'active', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Code Submissions Table
CREATE TABLE IF NOT EXISTS code_submissions (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
  candidate_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  language VARCHAR(50) NOT NULL,
  code TEXT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Evaluations Table
CREATE TABLE IF NOT EXISTS evaluations (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
  communication_rating INTEGER CHECK (communication_rating BETWEEN 1 AND 5),
  problem_solving_rating INTEGER CHECK (problem_solving_rating BETWEEN 1 AND 5),
  coding_rating INTEGER CHECK (coding_rating BETWEEN 1 AND 5),
  technical_rating INTEGER CHECK (technical_rating BETWEEN 1 AND 5),
  overall_rating INTEGER CHECK (overall_rating BETWEEN 1 AND 5),
  feedback TEXT,
  result VARCHAR(50) CHECK (result IN ('selected', 'rejected', 'on_hold')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Interviewer Notes Table
CREATE TABLE IF NOT EXISTS interviewer_notes (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER UNIQUE REFERENCES interviews(id) ON DELETE CASCADE,
  interviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Assessment 5 Rounds columns
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round1_score INTEGER DEFAULT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round2_score INTEGER DEFAULT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round3_score INTEGER DEFAULT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round4_score INTEGER DEFAULT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round5_score INTEGER DEFAULT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round6_score INTEGER DEFAULT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round7_score INTEGER DEFAULT NULL;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round4_code TEXT DEFAULT '';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round5_code TEXT DEFAULT '';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round6_code TEXT DEFAULT '';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round7_code TEXT DEFAULT '';
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round_started_at TIMESTAMP DEFAULT NULL;

