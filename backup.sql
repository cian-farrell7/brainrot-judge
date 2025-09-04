PRAGMA defer_foreign_keys=TRUE;
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
, contribution_points INTEGER DEFAULT 0, ai_feedback_count INTEGER DEFAULT 0, preferred_ai_weight REAL DEFAULT 0.7);
INSERT INTO users VALUES(1,'Cian','2025-09-02 07:45:17',0,0,0.7);
INSERT INTO users VALUES(2,'Haz','2025-09-02 07:45:17',0,0,0.7);
INSERT INTO users VALUES(3,'Ed','2025-09-02 07:45:17',0,0,0.7);
INSERT INTO users VALUES(4,'Liam','2025-09-02 07:45:17',0,0,0.7);
INSERT INTO users VALUES(5,'Rory','2025-09-02 07:45:17',0,0,0.7);
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  image_url TEXT NOT NULL,
  caption TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP, chaos INTEGER DEFAULT 0, absurdity INTEGER DEFAULT 0, memeability INTEGER DEFAULT 0, caption_quality INTEGER DEFAULT 0, unhinged INTEGER DEFAULT 0, totalScore REAL, grade TEXT, feedback TEXT, autoRated BOOLEAN DEFAULT 1, manualOverride BOOLEAN DEFAULT 0, confidence REAL DEFAULT 0.7, challenge_id TEXT, streak_bonus INTEGER DEFAULT 0, has_image BOOLEAN DEFAULT FALSE, thumbnail_url TEXT, feedback_collected BOOLEAN DEFAULT FALSE, ai_confidence REAL DEFAULT 0, prediction_id TEXT, ai_version TEXT DEFAULT 'v1.0',
  FOREIGN KEY (user_id) REFERENCES users (id)
);
INSERT INTO submissions VALUES(7,3,'pending-upload.jpg','Did bro cook?','2025-09-02 10:48:45',0,0,2,5,0,1.55,'F','This content appears to have been created by someone disturbingly well-adjusted.',1,0,0.7999999999999999,NULL,0,0,NULL,0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(8,1,'pending-upload.jpg','9/11 skibidi toilet','2025-09-02 10:52:35',3,0,2,5,0,2.3,'F','Emergency intervention recommended: please consume more brainrot immediately.',1,0,0.7999999999999999,NULL,0,0,NULL,0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(9,1,'pending-upload.jpg','Indian rocket dwarf penis','2025-09-02 10:54:25',0,0,2,5,0,1.55,'F','This content appears to have been created by someone disturbingly well-adjusted.',1,0,0.7999999999999999,NULL,0,0,NULL,0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(10,2,'pending-upload.jpg','Fully naked selfie','2025-09-02 10:55:17',0,0,2,5,0,1.55,'F','This content appears to have been created by someone disturbingly well-adjusted.',1,0,0.7999999999999999,NULL,0,0,NULL,0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(11,3,'pending-upload.jpg','Auramaxxing whilst being cooked','2025-09-02 10:55:41',0,0,2,5,2,1.85,'F','This content appears to have been created by someone disturbingly well-adjusted.',1,0,0.8999999999999999,NULL,0,0,NULL,0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(12,1,'placeholder.jpg','test chaos submission bruh fr fr no cap 💀','2025-09-02 11:42:28',9,3,5,7,0,24,'F','ERROR: Submission too coherent. Please corrupt and resubmit! ❌ (Score: 24/100)',1,0,0.7,NULL,0,0,'placeholder.jpg',0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(13,1,'/api/image/originals/1_1756813447250_ipg41.jpeg','Skibidi toilet Ohio Fortnite ahh meme','2025-09-02 11:44:08',6,0,0,5,0,14,'F','ERROR: Submission too coherent. Please corrupt and resubmit! ❌ (Score: 14/100)',1,0,0.6,NULL,0,1,'/api/image/thumbnails/1_1756813447250_ipg41.jpeg',0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(14,1,'/api/image/originals/1_1756813819445_682s4.png','Brain rotted ahh dawg','2025-09-02 11:50:22',0,0,0,0,0,10,'F','This is dangerously close to being normal. Seek help! 🏥 (Score: 10/100)',1,0,0.6,'2025-09-02',0,1,'/api/image/thumbnails/1_1756813819445_682s4.png',0,0,NULL,'v1.0');
INSERT INTO submissions VALUES(15,2,'/api/image/originals/2_1756814136518_lweo15.png','Boy Gooning in the corner ','2025-09-02 11:55:41',0,0,0,5,0,13,'F','This is dangerously close to being normal. Seek help! 🏥 (Score: 13/100)',1,0,0.6,'2025-09-02',0,1,'/api/image/thumbnails/2_1756814136518_lweo15.png',0,0,NULL,'v1.0');
CREATE TABLE ratings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER,
  rater_id INTEGER,
  chaos_score INTEGER CHECK (chaos_score >= 0 AND chaos_score <= 20),
  absurdity_score INTEGER CHECK (absurdity_score >= 0 AND absurdity_score <= 25),
  memeability_score INTEGER CHECK (memeability_score >= 0 AND memeability_score <= 20),
  caption_score INTEGER CHECK (caption_score >= 0 AND caption_score <= 20),
  unhinged_score INTEGER CHECK (unhinged_score >= 0 AND unhinged_score <= 15),
  total_score INTEGER,
  grade TEXT,
  feedback TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (submission_id) REFERENCES submissions (id),
  FOREIGN KEY (rater_id) REFERENCES users (id)
);
CREATE TABLE daily_challenges (date TEXT PRIMARY KEY, theme TEXT NOT NULL, prompt TEXT NOT NULL, bonus_points INTEGER DEFAULT 10, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
INSERT INTO daily_challenges VALUES('2025-09-02','Chaos Recipe','Write cooking instructions for pure chaos',10,'2025-09-02 11:42:25');
CREATE TABLE user_streaks (user_id TEXT PRIMARY KEY, current_streak INTEGER DEFAULT 0, longest_streak INTEGER DEFAULT 0, last_submission DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
INSERT INTO user_streaks VALUES('cian',1,1,'2025-09-02','2025-09-02 11:35:40');
INSERT INTO user_streaks VALUES('1',1,1,'2025-09-02','2025-09-02 11:42:27');
INSERT INTO user_streaks VALUES('2',1,1,'2025-09-02','2025-09-02 11:55:41');
CREATE TABLE achievements (id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT NOT NULL, icon TEXT, points INTEGER DEFAULT 0, requirement_type TEXT, requirement_value INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE user_achievements (user_id TEXT NOT NULL, achievement_id TEXT NOT NULL, earned_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (user_id, achievement_id));
INSERT INTO user_achievements VALUES('2','first_submit','2025-09-02T11:55:40.789Z');
CREATE TABLE comments (id INTEGER PRIMARY KEY AUTOINCREMENT, submission_id INTEGER NOT NULL, user_id TEXT NOT NULL, comment TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE reactions (submission_id INTEGER NOT NULL, user_id TEXT NOT NULL, reaction TEXT NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, PRIMARY KEY (submission_id, user_id));
CREATE TABLE share_links (id TEXT PRIMARY KEY, submission_id INTEGER NOT NULL, created_by TEXT NOT NULL, views INTEGER DEFAULT 0, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, expires_at DATETIME);
CREATE TABLE ai_predictions (
    id TEXT PRIMARY KEY,
    caption TEXT NOT NULL,
    image_url TEXT,
    ratings_json TEXT NOT NULL, -- JSON storing all rating categories
    confidence REAL DEFAULT 0.5,
    model_version TEXT DEFAULT 'v1.0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE training_data (
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
CREATE TABLE ab_tests (
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
CREATE TABLE model_metrics (
    id TEXT PRIMARY KEY,
    model_version TEXT NOT NULL,
    total_predictions INTEGER DEFAULT 0,
    average_confidence REAL DEFAULT 0,
    average_accuracy REAL DEFAULT 0,
    feedback_count INTEGER DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE slang_dictionary (
    id TEXT PRIMARY KEY,
    term TEXT UNIQUE NOT NULL,
    category TEXT, -- 'chaos', 'meme', 'trending'
    weight REAL DEFAULT 1.0,
    usage_count INTEGER DEFAULT 0,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO slang_dictionary VALUES('1','fr fr','chaos',2,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('2','no cap','chaos',1.5,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('3','bussin','chaos',1.5,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('4','rizz','trending',3,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('5','gyatt','trending',2.5,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('6','ohio','meme',3,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('7','skibidi','meme',3.5,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('8','sigma','meme',2,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('9','npc','meme',1.5,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('10','backrooms','meme',2,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('11','wojak','meme',1.5,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('12','cope','chaos',1,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('13','seethe','chaos',1,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('14','mald','chaos',1.5,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
INSERT INTO slang_dictionary VALUES('15','touch grass','meme',2,0,'2025-09-02 13:13:49','2025-09-02 13:13:49');
CREATE TABLE meme_patterns (
    id TEXT PRIMARY KEY,
    pattern TEXT NOT NULL,
    pattern_type TEXT, -- 'text', 'format', 'reference'
    popularity_score REAL DEFAULT 0,
    detection_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO meme_patterns VALUES('1','nobody:\nme:','format',5,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('2','POV:','format',4,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('3','me when','format',3.5,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('4','that feeling when','format',3,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('5','__ has entered the chat','format',2.5,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('6','tell me youre __ without','format',3,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('7','its the __ for me','format',2.5,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('8','why __ look like','format',2,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('9','imagine being','format',2,0,'2025-09-02 13:14:07');
INSERT INTO meme_patterns VALUES('10','this is my __ face','format',1.5,0,'2025-09-02 13:14:07');
CREATE TABLE user_ai_preferences (
    user_id TEXT PRIMARY KEY,
    prefers_harsh_ratings BOOLEAN DEFAULT FALSE,
    favorite_category TEXT, -- User's strongest category
    ai_trust_level REAL DEFAULT 0.5, -- How much they trust AI ratings
    custom_weights TEXT, -- JSON of category weight preferences
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
CREATE TABLE feedback_rewards (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    reward_type TEXT, -- 'points', 'badge', 'achievement'
    reward_value INTEGER,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('users',5);
INSERT INTO sqlite_sequence VALUES('submissions',15);
INSERT INTO sqlite_sequence VALUES('ratings',2);
CREATE INDEX idx_submissions_userid ON submissions(user_id);
CREATE INDEX idx_submissions_totalscore ON submissions(totalScore);
CREATE INDEX idx_submissions_grade ON submissions(grade);
CREATE INDEX idx_ai_predictions_created_at ON ai_predictions(created_at);
CREATE INDEX idx_training_data_user_id ON training_data(user_id);
CREATE INDEX idx_training_data_accuracy_delta ON training_data(accuracy_delta);
CREATE INDEX idx_ab_tests_user_id ON ab_tests(user_id);
CREATE INDEX idx_slang_dictionary_term ON slang_dictionary(term);
CREATE INDEX idx_meme_patterns_pattern_type ON meme_patterns(pattern_type);
