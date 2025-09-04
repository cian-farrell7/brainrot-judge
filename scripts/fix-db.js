// scripts/fix-db.js - ES Module Version
import { execSync } from 'child_process';

const commands = [
    `CREATE TABLE IF NOT EXISTS ai_predictions (id TEXT PRIMARY KEY, caption TEXT NOT NULL, image_url TEXT, ratings_json TEXT NOT NULL, confidence REAL DEFAULT 0.5, model_version TEXT DEFAULT 'v1.0', created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS training_data (id TEXT PRIMARY KEY, prediction_id TEXT, submission_id TEXT, user_id TEXT, ai_ratings TEXT NOT NULL, user_ratings TEXT NOT NULL, feedback_type TEXT, accuracy_delta REAL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`,
    `CREATE TABLE IF NOT EXISTS rating_feedback (id TEXT PRIMARY KEY, prediction_id TEXT, feedback_type TEXT, user_ratings TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)`
];

console.log('🔧 Fixing database tables...\n');

commands.forEach((cmd, i) => {
    try {
        console.log(`Running migration ${i + 1}/${commands.length}...`);
        execSync(`npx wrangler d1 execute brainrot-judge-db --remote --command="${cmd}"`, { stdio: 'inherit' });
        console.log(`✅ Migration ${i + 1} complete\n`);
    } catch (error) {
        console.error(`❌ Migration ${i + 1} failed:`, error.message);
    }
});

console.log('✨ Database fixes complete!');