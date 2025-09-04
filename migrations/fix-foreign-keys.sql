-- migrations/fix-foreign-keys-safe.sql
-- This version handles NULL user_ids in existing data

-- 1. First check if we have a backup table already
DROP TABLE IF EXISTS submissions_old;

-- 2. Rename current submissions to old (if it exists)
ALTER TABLE submissions RENAME TO submissions_old;

-- 3. Create new submissions table WITHOUT foreign key constraints
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY,
    user_id TEXT NOT NULL,
    image_url TEXT,
    caption TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    chaos INTEGER DEFAULT 10,
    absurdity INTEGER DEFAULT 10,
    memeability INTEGER DEFAULT 10,
    caption_quality INTEGER DEFAULT 10,
    unhinged INTEGER DEFAULT 10,
    totalScore INTEGER DEFAULT 50,
    grade TEXT DEFAULT 'B',
    feedback TEXT,
    autoRated INTEGER DEFAULT 0,
    manualOverride INTEGER DEFAULT 0,
    confidence REAL DEFAULT 0.5,
    challenge_id TEXT,
    streak_bonus INTEGER DEFAULT 0,
    has_image INTEGER DEFAULT 0,
    thumbnail_url TEXT,
    feedback_collected INTEGER DEFAULT 0,
    ai_confidence REAL DEFAULT 0.5,
    prediction_id TEXT,
    ai_version TEXT DEFAULT 'v1.0'
);

-- 4. Copy only valid data from old table (skip rows with NULL user_id)
INSERT INTO submissions 
SELECT * FROM submissions_old 
WHERE user_id IS NOT NULL AND user_id != '';

-- 5. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_submissions_prediction_id ON submissions(prediction_id);

-- 6. Clean up - optional, comment out if you want to keep the old table
-- DROP TABLE IF EXISTS submissions_old;