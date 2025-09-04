-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    password_hash TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    user_name TEXT,
    caption TEXT NOT NULL,
    image_url TEXT,
    chaos_rating INTEGER DEFAULT 0,
    absurdity_rating INTEGER DEFAULT 0,
    meme_rating INTEGER DEFAULT 0,
    cringe_rating INTEGER DEFAULT 0,
    cursed_rating INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    grade TEXT,
    feedback TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    ai_used BOOLEAN DEFAULT 0,
    prediction_id TEXT,
    challenge_id TEXT,
    ai_confidence REAL
);

-- Daily challenges table
CREATE TABLE IF NOT EXISTS daily_challenges (
    id TEXT PRIMARY KEY,
    date TEXT UNIQUE NOT NULL,
    theme TEXT NOT NULL,
    bonus_points INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Achievements table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    points INTEGER DEFAULT 10,
    icon TEXT,
    requirement_type TEXT,
    requirement_value INTEGER
);

-- User achievements table
CREATE TABLE IF NOT EXISTS user_achievements (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- User streaks table
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id TEXT PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    last_submission_date TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id TEXT PRIMARY KEY,
    model_version TEXT,
    input_text TEXT,
    prediction_data TEXT,
    confidence_score REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Rating feedback table
CREATE TABLE IF NOT EXISTS rating_feedback (
    id TEXT PRIMARY KEY,
    submission_id TEXT,
    prediction_id TEXT,
    user_id TEXT,
    user_ratings TEXT,
    ai_was_accurate BOOLEAN,
    feedback_type TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_created ON submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);