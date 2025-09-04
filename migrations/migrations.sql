-- Database Migrations for AI Integration Phase 1
-- Run these in your Cloudflare D1 database

-- 1. Create AI predictions table to store model outputs
CREATE TABLE IF NOT EXISTS ai_predictions (
    id TEXT PRIMARY KEY,
    caption TEXT NOT NULL,
    image_url TEXT,
    ratings_json TEXT NOT NULL, -- JSON storing all rating categories
    confidence REAL DEFAULT 0.5,
    model_version TEXT DEFAULT 'v1.0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create training data table for feedback collection
CREATE TABLE IF NOT EXISTS training_data (
    id TEXT PRIMARY KEY,
    prediction_id TEXT,
    submission_id TEXT,
    user_id TEXT,
    ai_ratings TEXT NOT NULL, -- JSON of AI predictions
    user_ratings TEXT NOT NULL, -- JSON of user corrections
    feedback_type TEXT CHECK(feedback_type IN ('manual_override', 'thumbs_up', 'thumbs_down')),
    accuracy_delta REAL, -- Difference between AI and user scores
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (prediction_id) REFERENCES ai_predictions(id)
);

-- 3. Add AI-related columns to submissions table
ALTER TABLE submissions ADD COLUMN ai_confidence REAL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN prediction_id TEXT;
ALTER TABLE submissions ADD COLUMN ai_version TEXT DEFAULT 'v1.0';
ALTER TABLE submissions ADD COLUMN feedback_collected BOOLEAN DEFAULT FALSE;

-- 4. Create A/B testing table for model comparison
CREATE TABLE IF NOT EXISTS ab_tests (
    id TEXT PRIMARY KEY,
    test_name TEXT NOT NULL,
    model_a TEXT NOT NULL,
    model_b TEXT NOT NULL,
    submission_id TEXT,
    user_id TEXT,
    selected_model TEXT,
    performance_delta REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

-- 5. Create model performance metrics table
CREATE TABLE IF NOT EXISTS model_metrics (
    id TEXT PRIMARY KEY,
    model_version TEXT NOT NULL,
    total_predictions INTEGER DEFAULT 0,
    average_confidence REAL DEFAULT 0,
    average_accuracy REAL DEFAULT 0,
    feedback_count INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 6. Add contribution points to users table
ALTER TABLE users ADD COLUMN contribution_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN ai_feedback_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN preferred_ai_weight REAL DEFAULT 0.7;

-- 7. Create slang dictionary table for continuous learning
CREATE TABLE IF NOT EXISTS slang_dictionary (
    id TEXT PRIMARY KEY,
    term TEXT UNIQUE NOT NULL,
    category TEXT, -- 'chaos', 'meme', 'trending'
    weight REAL DEFAULT 1.0,
    usage_count INTEGER DEFAULT 0,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 8. Create meme patterns table
CREATE TABLE IF NOT EXISTS meme_patterns (
    id TEXT PRIMARY KEY,
    pattern TEXT NOT NULL,
    pattern_type TEXT, -- 'text', 'format', 'reference'
    popularity_score REAL DEFAULT 0,
    detection_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 9. Create user preferences table for personalized AI
CREATE TABLE IF NOT EXISTS user_ai_preferences (
    user_id TEXT PRIMARY KEY,
    prefers_harsh_ratings BOOLEAN DEFAULT FALSE,
    favorite_category TEXT, -- User's strongest category
    ai_trust_level REAL DEFAULT 0.5, -- How much they trust AI ratings
    custom_weights TEXT, -- JSON of category weight preferences
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. Create feedback rewards table
CREATE TABLE IF NOT EXISTS feedback_rewards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reward_type TEXT, -- 'points', 'badge', 'achievement'
    reward_value INTEGER,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_predictions_created_at ON ai_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_training_data_user_id ON training_data(user_id);
CREATE INDEX IF NOT EXISTS idx_training_data_accuracy_delta ON training_data(accuracy_delta);
CREATE INDEX IF NOT EXISTS idx_ab_tests_user_id ON ab_tests(user_id);
CREATE INDEX IF NOT EXISTS idx_slang_dictionary_term ON slang_dictionary(term);
CREATE INDEX IF NOT EXISTS idx_meme_patterns_pattern_type ON meme_patterns(pattern_type);

-- Insert initial slang terms
INSERT OR IGNORE INTO slang_dictionary (id, term, category, weight) VALUES
    ('1', 'fr fr', 'chaos', 2.0),
    ('2', 'no cap', 'chaos', 1.5),
    ('3', 'bussin', 'chaos', 1.5),
    ('4', 'rizz', 'trending', 3.0),
    ('5', 'gyatt', 'trending', 2.5),
    ('6', 'ohio', 'meme', 3.0),
    ('7', 'skibidi', 'meme', 3.5),
    ('8', 'sigma', 'meme', 2.0),
    ('9', 'npc', 'meme', 1.5),
    ('10', 'backrooms', 'meme', 2.0),
    ('11', 'wojak', 'meme', 1.5),
    ('12', 'cope', 'chaos', 1.0),
    ('13', 'seethe', 'chaos', 1.0),
    ('14', 'mald', 'chaos', 1.5),
    ('15', 'touch grass', 'meme', 2.0);

-- Insert initial meme patterns
INSERT OR IGNORE INTO meme_patterns (id, pattern, pattern_type, popularity_score) VALUES
    ('1', 'nobody:\nme:', 'format', 5.0),
    ('2', 'POV:', 'format', 4.0),
    ('3', 'me when', 'format', 3.5),
    ('4', 'that feeling when', 'format', 3.0),
    ('5', '__ has entered the chat', 'format', 2.5),
    ('6', 'tell me youre __ without', 'format', 3.0),
    ('7', 'its the __ for me', 'format', 2.5),
    ('8', 'why __ look like', 'format', 2.0),
    ('9', 'imagine being', 'format', 2.0),
    ('10', 'this is my __ face', 'format', 1.5);