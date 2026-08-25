-- Database Expansion Migrations for Priority 1 Features

-- 1. Questions Bank Table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  difficulty VARCHAR(50) DEFAULT 'Medium' CHECK (difficulty IN ('Easy', 'Medium', 'Hard')),
  category VARCHAR(100) NOT NULL,
  tags VARCHAR(255)[] DEFAULT '{}',
  programming_language VARCHAR(50) DEFAULT 'javascript',
  input_format TEXT DEFAULT '',
  output_format TEXT DEFAULT '',
  constraints TEXT DEFAULT '',
  examples JSONB DEFAULT '[]'::jsonb, -- array of {input, output, explanation}
  starter_code JSONB DEFAULT '{}'::jsonb, -- language configurations
  hints TEXT[] DEFAULT '{}',
  expected_time_complexity VARCHAR(50) DEFAULT 'O(n)',
  expected_space_complexity VARCHAR(50) DEFAULT 'O(1)',
  is_custom BOOLEAN DEFAULT FALSE,
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Question Favorites Table (Recruiters)
CREATE TABLE IF NOT EXISTS question_favorites (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, question_id)
);

-- 3. Test Cases Table (Linked to questions or interviews)
CREATE TABLE IF NOT EXISTS test_cases (
  id SERIAL PRIMARY KEY,
  question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
  interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
  input TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  is_hidden BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
  sender_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Code Execution Results Table (Passed trials log)
CREATE TABLE IF NOT EXISTS code_execution_results (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER REFERENCES interviews(id) ON DELETE CASCADE,
  passed_count INTEGER NOT NULL,
  total_count INTEGER NOT NULL,
  runtime_ms INTEGER DEFAULT 0,
  memory_mb NUMERIC(10, 2) DEFAULT 0.00,
  results JSONB DEFAULT '[]'::jsonb, -- detail outcomes for each case
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index optimizations
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_test_cases_question ON test_cases(question_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_interview ON test_cases(interview_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_interview ON chat_messages(interview_id);

-- Invitation & Lobby system columns
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS invite_token VARCHAR(255) UNIQUE;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMP;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS candidate_joined_at TIMESTAMP;
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS interviewer_joined_at TIMESTAMP;

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


