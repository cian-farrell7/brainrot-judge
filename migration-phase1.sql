-- Phase 1 Database Migration Script
-- Run this with: wrangler d1 execute brainrot-judge-db --file=migration-phase1.sql

-- Daily Challenges Table
CREATE TABLE IF NOT EXISTS daily_challenges (
    date TEXT PRIMARY KEY,
    theme TEXT NOT NULL,
    prompt TEXT NOT NULL,
    bonus_points INTEGER DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Streaks Table
CREATE TABLE IF NOT EXISTS user_streaks (
    user_id TEXT PRIMARY KEY,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_submission DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Achievements Definition Table
CREATE TABLE IF NOT EXISTS achievements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT,
    points INTEGER DEFAULT 0,
    requirement_type TEXT, -- 'score', 'streak', 'count', 'special'
    requirement_value INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Achievements Table (Junction)
CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT NOT NULL,
    achievement_id TEXT NOT NULL,
    earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, achievement_id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);

-- Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    submission_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    comment TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Reactions Table
CREATE TABLE IF NOT EXISTS reactions (
    submission_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    reaction TEXT NOT NULL, -- '🔥', '💀', '😭', '🤯', '🗿'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (submission_id, user_id),
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Share Links Table
CREATE TABLE IF NOT EXISTS share_links (
    id TEXT PRIMARY KEY,
    submission_id INTEGER NOT NULL,
    created_by TEXT NOT NULL,
    views INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME,
    FOREIGN KEY (submission_id) REFERENCES submissions(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- Add new columns to submissions table
ALTER TABLE submissions ADD COLUMN challenge_id TEXT;
ALTER TABLE submissions ADD COLUMN streak_bonus INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN has_image BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN thumbnail_url TEXT;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(date);
CREATE INDEX IF NOT EXISTS idx_user_streaks_user_id ON user_streaks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_submission_id ON comments(submission_id);
CREATE INDEX IF NOT EXISTS idx_reactions_submission_id ON reactions(submission_id);
CREATE INDEX IF NOT EXISTS idx_submissions_challenge_id ON submissions(challenge_id);

-- Insert initial achievements
INSERT OR IGNORE INTO achievements (id, name, description, icon, points, requirement_type, requirement_value) VALUES
('first_aplus', 'Chaos Perfection', 'Earned your first A+ rating', '🏆', 50, 'score', 90),
('chaos_king', 'Chaos King', 'Achieved maximum chaos score', '👑', 30, 'score', 18),
('streak_week', 'Week Warrior', 'Maintained a 7-day streak', '🔥', 25, 'streak', 7),
('streak_month', 'Monthly Menace', 'Maintained a 30-day streak', '💎', 100, 'streak', 30),
('first_submit', 'Welcome to the Void', 'Made your first submission', '🌀', 10, 'special', 1),
('ten_submits', 'Frequent Flyer', 'Made 10 submissions', '✈️', 20, 'count', 10),
('fifty_submits', 'Chaos Veteran', 'Made 50 submissions', '🎖️', 50, 'count', 50),
('hundred_submits', 'Brainrot Legend', 'Made 100 submissions', '🧠', 100, 'count', 100),
('most_improved', 'Glow Up', 'Improved average score by 20 points', '📈', 40, 'special', 20),
('social_butterfly', 'Social Chaos', 'Received 50 reactions on a submission', '🦋', 30, 'special', 50),
('viral_post', 'Gone Viral', 'Submission shared 10 times', '🌐', 40, 'special', 10),
('comment_king', 'Discussion Starter', 'Received 20 comments on a submission', '💬', 30, 'special', 20),
('perfect_week', 'Perfect Week', 'All submissions above B grade for a week', '⭐', 60, 'special', 7),
('challenge_winner', 'Daily Champion', 'Won a daily challenge', '🥇', 35, 'special', 1),
('early_bird', '3AM Thoughts', 'Submitted between 3-4 AM', '🌙', 15, 'special', 1),
('speed_demon', 'Speed Run', '5 submissions in one hour', '⚡', 25, 'special', 5);

-- Create a view for enhanced leaderboard with achievements
CREATE VIEW IF NOT EXISTS leaderboard_enhanced AS
SELECT 
    u.id,
    u.name,
    AVG(s.totalScore) as avg_score,
    COUNT(DISTINCT s.id) as total_submissions,
    COUNT(DISTINCT ua.achievement_id) as achievement_count,
    COALESCE(us.current_streak, 0) as current_streak,
    COALESCE(us.longest_streak, 0) as longest_streak,
    MAX(s.grade = 'A+') as has_aplus
FROM users u
LEFT JOIN submissions s ON u.id = s.user_id
LEFT JOIN user_achievements ua ON u.id = ua.user_id
LEFT JOIN user_streaks us ON u.id = us.user_id
GROUP BY u.id, u.name;

-- Analytics table for tracking engagement
CREATE TABLE IF NOT EXISTS analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL, -- 'view', 'submit', 'share', 'react', 'comment'
    user_id TEXT,
    submission_id INTEGER,
    metadata TEXT, -- JSON string for additional data
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (submission_id) REFERENCES submissions(id)
);

CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics(created_at);