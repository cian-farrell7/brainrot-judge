-- Check and fix users table schema
-- Run this to see current structure and fix it

-- First, let's check what columns exist
-- Run this query first to see the current structure:
-- SELECT sql FROM sqlite_master WHERE type='table' AND name='users';

-- If the users table doesn't have an 'id' column or has wrong structure, 
-- we need to recreate it properly:

-- Option 1: If users table exists but with wrong structure
-- Drop and recreate (WARNING: This will delete existing users)
DROP TABLE IF EXISTS users_backup;
ALTER TABLE users RENAME TO users_backup;

-- Create users table with correct structure
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    email TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_name ON users(name);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- If you want to preserve existing users (without passwords), uncomment:
-- INSERT INTO users (id, name, created_at) 
-- SELECT 
--     CASE 
--         WHEN id IS NULL THEN 'user_' || hex(randomblob(16))
--         ELSE id 
--     END as id,
--     name,
--     created_at
-- FROM users_backup;

-- Drop the backup table when done
-- DROP TABLE users_backup;