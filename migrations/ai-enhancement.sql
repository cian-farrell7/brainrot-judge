-- migrations/ai-enhancement.sql
-- Run this entire file on your Cloudflare D1 database

-- 1. Create AI predictions table
CREATE TABLE IF NOT EXISTS ai_predictions (
    id TEXT PRIMARY KEY,
    caption TEXT NOT NULL,
    image_url TEXT,
    ratings_json TEXT NOT NULL,
    confidence REAL DEFAULT 0.5,
    model_version TEXT DEFAULT 'v1.0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create training data table
CREATE TABLE IF NOT EXISTS training_data (
    id TEXT PRIMARY KEY,
    prediction_id TEXT,
    submission_id TEXT,
    user_id TEXT,
    ai_ratings TEXT NOT NULL,
    user_ratings TEXT NOT NULL,
    feedback_type TEXT CHECK(feedback_type IN ('manual_override', 'thumbs_up', 'thumbs_down')),
    accuracy_delta REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create slang dictionary table
CREATE TABLE IF NOT EXISTS slang_dictionary (
    id TEXT PRIMARY KEY,
    term TEXT UNIQUE NOT NULL,
    category TEXT,
    weight REAL DEFAULT 1.0,
    variants TEXT,
    usage_count INTEGER DEFAULT 0,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 4. Create model metrics table
CREATE TABLE IF NOT EXISTS model_metrics (
    id TEXT PRIMARY KEY,
    model_version TEXT NOT NULL,
    total_predictions INTEGER DEFAULT 0,
    average_confidence REAL DEFAULT 0,
    average_accuracy REAL DEFAULT 0,
    feedback_count INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Add AI columns to submissions table (if they don't exist)
-- Note: SQLite doesn't support IF NOT EXISTS for columns, so these might error if already present
ALTER TABLE submissions ADD COLUMN ai_confidence REAL DEFAULT 0;
ALTER TABLE submissions ADD COLUMN prediction_id TEXT;
ALTER TABLE submissions ADD COLUMN ai_version TEXT DEFAULT 'v1.0';
ALTER TABLE submissions ADD COLUMN feedback_collected BOOLEAN DEFAULT FALSE;

-- 6. Add contribution columns to users table (if they don't exist)
ALTER TABLE users ADD COLUMN contribution_points INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN ai_feedback_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN preferred_ai_weight REAL DEFAULT 0.7;

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_predictions_created_at ON ai_predictions(created_at);
CREATE INDEX IF NOT EXISTS idx_training_data_user_id ON training_data(user_id);
CREATE INDEX IF NOT EXISTS idx_training_data_accuracy_delta ON training_data(accuracy_delta);
CREATE INDEX IF NOT EXISTS idx_slang_dictionary_term ON slang_dictionary(term);
CREATE INDEX IF NOT EXISTS idx_slang_dictionary_category ON slang_dictionary(category);

-- 8. Insert initial slang terms
INSERT OR IGNORE INTO slang_dictionary (id, term, category, weight, variants) VALUES
    ('slang-001', 'fr fr', 'chaos', 2.5, '["fr", "frfr", "on god fr"]'),
    ('slang-002', 'no cap', 'chaos', 2.0, '["nocap"]'),
    ('slang-003', 'bussin', 'chaos', 2.5, '["bussin bussin", "straight bussin"]'),
    ('slang-004', 'rizz', 'trending', 3.5, '["rizzler", "rizzing", "rizzed up", "w rizz", "l rizz"]'),
    ('slang-005', 'gyatt', 'trending', 3.5, '["gyat", "GYATTTT"]'),
    ('slang-006', 'ohio', 'meme', 3.5, '["only in ohio", "ohio final boss"]'),
    ('slang-007', 'skibidi', 'meme', 4.0, '["skibidi toilet", "skibidi bop"]'),
    ('slang-008', 'sigma', 'meme', 2.5, '["sigma male", "sigma grindset"]'),
    ('slang-009', 'deadass', 'chaos', 2.5, '["dead ass", "deadahh"]'),
    ('slang-010', 'ahh', 'chaos', 2.0, '["ahhh", "ahhhh", "-ahh"]'),
    ('slang-011', 'shi', 'chaos', 2.0, '["shii", "shiii"]'),
    ('slang-012', 'fade', 'chaos', 2.5, '["catch this fade", "run the fade"]'),
    ('slang-013', 'run it', 'chaos', 2.0, '["run it back", "we runnin it"]'),
    ('slang-014', 'juice', 'chaos', 1.5, '["juiced", "juicing"]'),
    ('slang-015', 'aura', 'trending', 4.0, '["aura points", "-1000 aura", "+aura"]'),
    ('slang-016', 'aura farming', 'trending', 4.5, '["aura farm", "farming aura"]'),
    ('slang-017', 'generational aura', 'elite', 5.0, '["generational"]'),
    ('slang-018', 'aura loss', 'trending', 4.0, '["losing aura", "negative aura"]'),
    ('slang-019', 'aura debt', 'elite', 4.5, '["aura bankruptcy"]'),
    ('slang-020', 'penjamin', 'meme', 3.5, '["benjamin but pen"]'),
    ('slang-021', 'pennifer', 'meme', 3.5, '["jennifer but pen"]'),
    ('slang-022', 'pen wallace', 'meme', 3.5, '["wallace but pen"]'),
    ('slang-023', 'goon', 'chaos', 3.0, '["gooning", "gooned"]'),
    ('slang-024', 'gooning', 'chaos', 3.5, '["goon cave", "goonmaxxing"]'),
    ('slang-025', 'goober', 'wholesome', 2.0, '["silly goober", "gooby"]'),
    ('slang-026', 'peaky blinder', 'meme', 3.5, '["peaky blinders"]'),
    ('slang-027', 'npc', 'meme', 1.5, '["npc behavior", "npc energy"]'),
    ('slang-028', 'cope', 'chaos', 1.0, '["copium", "coping"]'),
    ('slang-029', 'seethe', 'chaos', 1.0, '["seething", "seethe and cope"]'),
    ('slang-030', 'mald', 'chaos', 1.5, '["malding", "malded"]'),
    ('slang-031', 'touch grass', 'meme', 1.5, '["go touch grass"]'),
    ('slang-032', 'based', 'reaction', 1.5, '["based and redpilled"]'),
    ('slang-033', 'cringe', 'reaction', 1.0, '["cringy", "cringey"]'),
    ('slang-034', 'sus', 'meme', 1.5, '["sussy", "suspicious"]'),
    ('slang-035', 'bruh', 'reaction', 1.0, '["bruhhh", "bruhhhh"]'),
    ('slang-036', 'ong', 'chaos', 2.5, '["on god", "on g"]'),
    ('slang-037', 'sheesh', 'reaction', 2.0, '["sheeesh", "sheeeesh"]');

-- 9. Create daily challenges table if not exists
CREATE TABLE IF NOT EXISTS daily_challenges (
    id TEXT PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    theme TEXT NOT NULL,
    bonus_points INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 10. Create user streaks table if not exists
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id TEXT PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    best_streak INTEGER DEFAULT 0,
    last_submission_date DATE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Create achievements table if not exists
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    points INTEGER DEFAULT 10,
    requirement_type TEXT,
    requirement_value INTEGER
);

-- 12. Create user achievements table if not exists  
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT,
    achievement_id TEXT,
    unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id)
);

-- 13. Insert sample achievements if not exists
INSERT OR IGNORE INTO achievements (id, name, description, icon, points, requirement_type, requirement_value) VALUES
    ('ach-001', 'First Brainrot', 'Submit your first caption', '🧠', 10, 'submissions', 1),
    ('ach-002', 'Chaos Apprentice', 'Score over 50 points', '💀', 20, 'score', 50),
    ('ach-003', 'Meme Lord', 'Score over 80 points', '👑', 50, 'score', 80),
    ('ach-004', 'Touch Grass', 'Take a 3-day break', '🌱', 30, 'break', 3),
    ('ach-005', 'Streak Master', 'Maintain a 7-day streak', '🔥', 40, 'streak', 7),
    ('ach-006', 'AI Trainer', 'Provide 10 feedback items', '🤖', 25, 'feedback', 10),
    ('ach-007', 'Slang Scholar', 'Use 10 different slang terms', '📚', 30, 'slang', 10),
    ('ach-008', 'Ohio Native', 'Use "ohio" 5 times', '🏠', 15, 'specific_term', 5);

-- 14. Create initial model metrics entry
INSERT OR IGNORE INTO model_metrics (id, model_version, total_predictions, average_confidence) 
VALUES ('metrics-v1', 'v1.0', 0, 0.7);