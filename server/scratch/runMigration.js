const db = require('../config/db');

const migrate = async () => {
  try {
    console.log('🔄 Running database migrations for 5 Rounds feature...');
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS current_round INTEGER DEFAULT 1;`);
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round1_score INTEGER DEFAULT NULL;`);
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round2_score INTEGER DEFAULT NULL;`);
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round3_score INTEGER DEFAULT NULL;`);
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round4_score INTEGER DEFAULT NULL;`);
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round5_score INTEGER DEFAULT NULL;`);
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round4_code TEXT DEFAULT '';`);
    await db.query(`ALTER TABLE interviews ADD COLUMN IF NOT EXISTS round5_code TEXT DEFAULT '';`);
    console.log('✅ Database migration successful!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
};

migrate();
