// src/index.js - Complete Cloudflare Worker with Authentication and All Features
import { BrainrotSlangEngine, BRAINROT_DICTIONARY, calculateBrainrotScore } from './slang.js';

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);

        // CORS headers
        const corsHeaders = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        };

        if (request.method === 'OPTIONS') {
            return new Response(null, { headers: corsHeaders });
        }

        // ===== AUTHENTICATION ENDPOINTS =====
        if (url.pathname === '/api/auth/register' && request.method === 'POST') {
            return await handleRegister(request, env, corsHeaders);
        }

        if (url.pathname === '/api/auth/login' && request.method === 'POST') {
            return await handleLogin(request, env, corsHeaders);
        }

        if (url.pathname === '/api/auth/verify' && request.method === 'GET') {
            return await handleVerifyToken(request, env, corsHeaders);
        }

        // ===== AI ENDPOINTS =====
        if (url.pathname === '/api/ai-rate' && request.method === 'POST') {
            return await handleAIRating(request, env, ctx, corsHeaders);
        }

        if (url.pathname === '/api/feedback' && request.method === 'POST') {
            return await collectRatingFeedback(request, env, corsHeaders);
        }

        if (url.pathname === '/api/training-data' && request.method === 'GET') {
            return await getTrainingData(env, corsHeaders);
        }

        // ===== SLANG ENDPOINTS =====
        if (url.pathname === '/api/slang/add' && request.method === 'POST') {
            return await handleAddSlang(request, env, corsHeaders);
        }

        if (url.pathname === '/api/slang/bulk-import' && request.method === 'POST') {
            return await handleBulkImportSlang(request, env, corsHeaders);
        }

        if (url.pathname === '/api/slang/analyze' && request.method === 'POST') {
            return await handleSlangAnalyze(request, env, corsHeaders);
        }

        // ===== MAIN ENDPOINTS =====
        if (url.pathname === '/api/submit' && request.method === 'POST') {
            return await handleSubmitWithAI(request, env, ctx, corsHeaders);
        }

        if (url.pathname === '/api/submissions' && request.method === 'GET') {
            return await getSubmissions(env, corsHeaders);
        }

        if (url.pathname === '/api/leaderboard' && request.method === 'GET') {
            return await getLeaderboard(env, corsHeaders);
        }

        if (url.pathname === '/api/daily-challenge' && request.method === 'GET') {
            return await getDailyChallenge(env, corsHeaders);
        }

        if (url.pathname === '/api/achievements' && request.method === 'GET') {
            return await getUserAchievements(request, env, corsHeaders);
        }

        if (url.pathname === '/api/streak' && request.method === 'GET') {
            return await getUserStreak(request, env, corsHeaders);
        }

        // Health check
        if (url.pathname === '/api/health' && request.method === 'GET') {
            return new Response(JSON.stringify({
                status: 'healthy',
                version: env.API_VERSION || '2.2.0',
                ai_enabled: true,
                auth_enabled: true
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response('Not Found', { status: 404, headers: corsHeaders });

    },
};

// ===== AUTHENTICATION HANDLERS =====

async function handleRegister(request, env, corsHeaders) {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
        return new Response(JSON.stringify({
            error: 'Username and password are required'
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Validate username format (matching frontend pattern)
    const usernamePattern = /^[a-zA-Z0-9_-]+$/;
    if (!usernamePattern.test(username) || username.length < 3 || username.length > 20) {
        return new Response(JSON.stringify({
            error: 'Username must be 3-20 characters and contain only letters, numbers, underscore, and hyphen'
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Validate password
    if (password.length < 6) {
        return new Response(JSON.stringify({
            error: 'Password must be at least 6 characters'
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Check if user already exists
    const existingUser = await env.DB.prepare(
        'SELECT id FROM users WHERE name = ?'
    ).bind(username).first();

    if (existingUser) {
        return new Response(JSON.stringify({
            error: 'Username already exists'
        }), {
            status: 409,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Hash password (using Web Crypto API)
    const passwordHash = await hashPassword(password);

    // Create user
    const userId = generateUserId();
    await env.DB.prepare(
        'INSERT INTO users (id, name, password_hash, created_at, last_login) VALUES (?, ?, ?, datetime("now"), datetime("now"))'
    ).bind(userId, username, passwordHash).run();

    // Generate JWT token
    const token = await generateJWT(userId, username, env.JWT_SECRET || 'your-secret-key');

    return new Response(JSON.stringify({
        success: true,
        token,
        user: { id: userId, username }
    }), {
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleLogin(request, env, corsHeaders) {
    const { username, password } = await request.json();

    // Validate input
    if (!username || !password) {
        return new Response(JSON.stringify({
            error: 'Username and password are required'
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // GET USER WITH ADMIN FIELDS - THIS IS THE KEY CHANGE
    const user = await env.DB.prepare(`
        SELECT 
            id, 
            name, 
            password_hash,
            is_admin,
            role
        FROM users 
        WHERE name = ?
    `).bind(username).first();

    if (!user) {
        return new Response(JSON.stringify({
            error: 'Invalid username or password'
        }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Verify password
    const passwordValid = await verifyPassword(password, user.password_hash);
    if (!passwordValid) {
        return new Response(JSON.stringify({
            error: 'Invalid username or password'
        }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // DETERMINE IF USER IS ADMIN
    const isAdmin = user.is_admin === 1;
    const role = user.role || 'user';

    // Update last login
    await env.DB.prepare(
        'UPDATE users SET last_login = datetime("now") WHERE id = ?'
    ).bind(user.id).run();

    // GENERATE TOKEN WITH ADMIN INFO
    const token = await generateJWT(
        user.id,
        user.name,
        isAdmin,
        role,
        env.JWT_SECRET || 'your-secret-key'
    );

    // RETURN USER DATA WITH ADMIN STATUS
    return new Response(JSON.stringify({
        success: true,
        token,
        user: {
            id: user.id,
            username: user.name,
            isAdmin: user.is_admin === 1,
            role: user.role || 'user'
        }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}


// ===== AUTHENTICATION HELPERS =====

async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function verifyPassword(password, hash) {
    const passwordHash = await hashPassword(password);
    return passwordHash === hash;
}

function generateUserId() {
    return 'user_' + crypto.randomUUID();
}

async function generateJWT(userId, username, isAdmin, role, secret) {
    const header = {
        alg: 'HS256',
        typ: 'JWT'
    };

    const payload = {
        userId,
        username,
        isAdmin: isAdmin || false,  // ADD THIS
        role: role || 'user',        // ADD THIS
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
    };

    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));

    const signature = await createSignature(
        `${encodedHeader}.${encodedPayload}`,
        secret
    );

    return `${encodedHeader}.${encodedPayload}.${signature}`;
}

async function createSignature(message, secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );

    const signature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(message)
    );

    return btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function verifyAuth(request, env) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { authenticated: false };
    }

    const token = authHeader.substring(7);

    const [header, payload, signature] = token.split('.');

    // Verify signature
    const expectedSignature = await createSignature(
        `${header}.${payload}`,
        env.JWT_SECRET || 'your-secret-key'
    );

    if (signature !== expectedSignature) {
        return { authenticated: false };
    }

    // Decode and check payload
    const decodedPayload = JSON.parse(atob(payload));

    // Check expiration
    if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        return { authenticated: false };
    }

    return {
        authenticated: true,
        user: {
            id: decodedPayload.userId,
            username: decodedPayload.username
        }
    };
}

async function handleVerifyToken(request, env, corsHeaders) {
    const authCheck = await verifyAuth(request, env);

    return new Response(JSON.stringify({
        authenticated: authCheck.authenticated,
        user: authCheck.user
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// ===== AI RATING ENDPOINTS =====

async function handleAIRating(request, env, ctx, corsHeaders) {
    try {
        // Verify authentication
        const authCheck = await verifyAuth(request, env);
        if (!authCheck.authenticated) {
            return new Response(JSON.stringify({ error: 'Authentication required' }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Parse request body
        let caption, image;
        try {
            const body = await request.json();
            caption = body.caption;
            image = body.image;
        } catch (parseError) {
            console.error('Error parsing request body:', parseError);
            return new Response(JSON.stringify({
                error: 'Invalid request body',
                details: parseError.message
            }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Validate caption
        if (!caption || typeof caption !== 'string' || caption.trim().length === 0) {
            return new Response(JSON.stringify({ error: 'Caption is required and must be a non-empty string' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        let ratings;
        let predictionId;
        let slangAnalysis;

        try {
            // Initialize slang engine
            const slangEngine = new BrainrotSlangEngine(BRAINROT_DICTIONARY);
            slangAnalysis = slangEngine.analyzeText(caption);
        } catch (slangError) {
            console.error('Error analyzing slang:', slangError);
            // Continue with default values if slang analysis fails
            slangAnalysis = {
                score: 0,
                detectedTerms: [],
                density: 0,
                categories: {}
            };
        }

        try {
            // Calculate ratings
            ratings = calculateBrainrotScore(
                caption,
                slangAnalysis,
                !image  // hasImage parameter
            );
        } catch (ratingError) {
            console.error('Error calculating ratings:', ratingError);
            // Use fallback ratings if calculation fails
            ratings = {
                chaos_rating: 10,
                absurdity_rating: 10,
                meme_rating: 10,
                cursed_rating: 10,
                confidence: 0.5
            };
        }

        // Generate prediction ID
        predictionId = crypto.randomUUID();

        // Try to store prediction in database with error handling
        try {
            // First, check if the table exists
            const tableCheck = await env.DB.prepare(
                "SELECT name FROM sqlite_master WHERE type='table' AND name='ai_predictions'"
            ).first();

            if (!tableCheck) {
                console.log('ai_predictions table does not exist, creating it...');
                // Create the table if it doesn't exist
                await env.DB.prepare(`
                    CREATE TABLE IF NOT EXISTS ai_predictions (
                        id TEXT PRIMARY KEY,
                        caption TEXT NOT NULL,
                        image_url TEXT,
                        ratings_json TEXT NOT NULL,
                        confidence REAL DEFAULT 0.5,
                        model_version TEXT DEFAULT 'v1.0',
                        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                    )
                `).run();
            }

            // Now insert the prediction
            await env.DB.prepare(`
                INSERT INTO ai_predictions 
                (id, caption, image_url, ratings_json, confidence, model_version, created_at)
                VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
            `).bind(
                predictionId,
                caption.substring(0, 1000),  // Limit caption length to prevent DB errors
                image ? image.substring(0, 500) : null,  // Limit image URL/data length
                JSON.stringify(ratings),
                ratings.confidence || 0.85,
                'v1.0'
            ).run();
        } catch (dbError) {
            console.error('Database error storing prediction:', dbError);
            // Continue without storing - the rating still works
            console.log('Continuing without database storage');
        }

        // Return successful response
        return new Response(JSON.stringify({
            success: true,
            ratings,
            analysis: slangAnalysis,
            predictionId,
            aiConfidence: ratings.confidence || 0.85
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        // Catch-all error handler
        console.error('Unexpected error in handleAIRating:', error);
        return new Response(JSON.stringify({
            error: 'Internal server error',
            message: error.message,
            stack: error.stack
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function collectRatingFeedback(request, env, corsHeaders) {
    const { predictionId, feedback, userRatings } = await request.json();

    await env.DB.prepare(`
            INSERT INTO rating_feedback 
            (id, prediction_id, feedback_type, user_ratings, created_at)
            VALUES (?, ?, ?, ?, datetime('now'))
        `).bind(
        crypto.randomUUID(),
        predictionId,
        feedback, // 'agree', 'disagree', 'partial'
        JSON.stringify(userRatings)
    ).run();

    return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function getTrainingData(env, corsHeaders) {

    const data = await env.DB.prepare(`
            SELECT * FROM training_data 
            ORDER BY created_at DESC 
            LIMIT 100
        `).all();

    return new Response(JSON.stringify({
        success: true,
        data: data.results
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// ===== SLANG ENDPOINTS =====

async function handleAddSlang(request, env, corsHeaders) {

    const { term, weight, category, variants } = await request.json();

    const id = crypto.randomUUID();
    await env.DB.prepare(`
            INSERT INTO slang_dictionary (id, term, category, weight, variants, created_at)
            VALUES (?, ?, ?, ?, ?, datetime('now'))
        `).bind(id, term.toLowerCase(), category, weight, variants || '').run();

    return new Response(JSON.stringify({ success: true, id }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleBulkImportSlang(request, env, corsHeaders) {

    const { terms } = await request.json();

    for (const term of terms) {
        const id = crypto.randomUUID();
        await env.DB.prepare(`
                INSERT OR IGNORE INTO slang_dictionary (id, term, category, weight, created_at)
                VALUES (?, ?, ?, ?, datetime('now'))
            `).bind(id, term.term.toLowerCase(), term.category, term.weight).run();
    }

    return new Response(JSON.stringify({ success: true, imported: terms.length }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function handleSlangAnalyze(request, env, corsHeaders) {

    const { text } = await request.json();

    const slangEngine = new BrainrotSlangEngine(BRAINROT_DICTIONARY);
    const analysis = slangEngine.analyzeText(text);

    return new Response(JSON.stringify({
        success: true,
        analysis
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// ===== MAIN SUBMISSION ENDPOINT =====

async function handleSubmitWithAI(request, env, ctx, corsHeaders) {
    const authCheck = await verifyAuth(request, env);
    if (!authCheck.authenticated) {
        return new Response(JSON.stringify({ error: 'Authentication required' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
    const bodyText = await request.text();
    const { caption, image, useAI = true } = JSON.parse(bodyText);

    const userName = authCheck.user?.username || authCheck.user?.id;

    if (!userName) {
        return new Response(JSON.stringify({
            error: 'User information missing from token'
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    if (!caption || caption.trim() === '') {
        return new Response(JSON.stringify({ error: 'Caption is required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    // Generate AI ratings if requested
    let aiRatings = null;
    let predictionId = null;

    if (useAI) {
        const slangEngine = new BrainrotSlangEngine(BRAINROT_DICTIONARY);
        const slangAnalysis = slangEngine.analyzeText(caption);

        aiRatings = calculateBrainrotScore(
            caption,
            slangAnalysis,
            !!image
        );

        predictionId = crypto.randomUUID();

        await env.DB.prepare(`
                        INSERT INTO ai_predictions 
                        (id, caption, image_url, ratings_json, confidence, model_version, created_at)
                        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
                    `).bind(
            predictionId,
            caption,
            image || null,
            JSON.stringify(aiRatings),
            aiRatings.confidence || 0.85,
            'v1.0'
        ).run();
    }

    const id = Math.floor(Math.random() * 1000000000);

    const ratings = aiRatings || {
        chaos_rating: 10,
        absurdity_rating: 10,
        meme_rating: 10,
        cringe_rating: 10,
        cursed_rating: 10,
        total_score: 50,
        confidence: 0.5
    };

    const totalScore = ratings.total_score || 50;
    const grade = totalScore >= 80 ? 'S' :
        totalScore >= 60 ? 'A' :
            totalScore >= 40 ? 'B' :
                totalScore >= 20 ? 'C' : 'F';

    await env.DB.prepare(`
                    INSERT INTO submissions 
                    (id, user_id, image_url, caption, created_at, chaos, absurdity, 
                     memeability, caption_quality, unhinged, totalScore, grade, 
                     feedback, autoRated, manualOverride, confidence, challenge_id, 
                     streak_bonus, has_image, thumbnail_url, feedback_collected, 
                     ai_confidence, prediction_id, ai_version)
                    VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).bind(
        id,
        userName,  // Use the userName variable
        image || '',
        caption,
        ratings.chaos_rating || 10,
        ratings.absurdity_rating || 10,
        ratings.meme_rating || 10,
        10,
        ratings.cursed_rating || 10,
        totalScore,
        grade,
        `${grade} Grade! Score: ${totalScore}/100`,
        useAI ? 1 : 0,
        0,
        0.7,
        null,
        0,
        image ? 1 : 0,
        null,
        0,
        ratings.confidence || 0.85,
        predictionId,
        'v1.0'
    ).run();
    return new Response(JSON.stringify({
        success: true,
        id,
        ratings,
        grade,
        totalScore,
        predictionId,
        message: useAI ? 'AI-powered submission received!' : 'Manual submission received!'
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// ===== QUERY ENDPOINTS =====

async function getSubmissions(env, corsHeaders) {

    const submissions = await env.DB.prepare(`
            SELECT * FROM submissions 
            ORDER BY created_at DESC 
            LIMIT 50
        `).all();

    return new Response(JSON.stringify({
        success: true,
        submissions: submissions.results
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function getLeaderboard(env, corsHeaders) {

    const leaderboard = await env.DB.prepare(`
        SELECT 
            user_id as user_name,
            COUNT(*) as submission_count,
            AVG(totalScore) as avg_score,
            MAX(totalScore) as max_score
        FROM submissions
        WHERE created_at >= datetime('now', '-30 days')
        GROUP BY user_id
        ORDER BY avg_score DESC
        LIMIT 10
    `).all();

    return new Response(JSON.stringify({
        success: true,
        leaderboard: leaderboard.results || []
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

async function getDailyChallenge(env, corsHeaders) {
    try {
        const today = new Date().toISOString().split('T')[0];

        return new Response(JSON.stringify({
            success: true,
            challenge: {
                theme: 'Maximum Chaos Mode',
                bonus_points: 10,
                date: today
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        return new Response(JSON.stringify({
            success: true,
            challenge: { theme: 'Chaos Mode', bonus_points: 10 }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
async function getUserAchievements(request, env, corsHeaders) {
    try {
        const url = new URL(request.url);
        const userId = url.searchParams.get('user_id');

        const achievements = await env.DB.prepare(`
            SELECT * FROM achievements
        `).all();

        return new Response(JSON.stringify({
            success: true,
            achievements: achievements.results || []
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (error) {
        // Return empty array if error
        return new Response(JSON.stringify({
            success: true,
            achievements: []
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}

async function getUserStreak(request, env, corsHeaders) {
    const url = new URL(request.url);
    const userId = url.searchParams.get('user_id');

    if (!userId) {
        return new Response(JSON.stringify({ error: 'User ID required' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const streak = await env.DB.prepare(`
            SELECT * FROM user_streaks
            WHERE user_id = ?
        `).bind(userId).first();

    return new Response(JSON.stringify({
        success: true,
        streak: streak || { current_streak: 0, max_streak: 0 }
    }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// ===== HELPER FUNCTIONS =====

async function updateUserStreak(userId, env) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const streak = await env.DB.prepare(`
            SELECT * FROM user_streaks WHERE user_id = ?
        `).bind(userId).first();

    if (!streak) {
        // Create new streak
        await env.DB.prepare(`
                INSERT INTO user_streaks (user_id, current_streak, max_streak, last_submission_date)
                VALUES (?, 1, 1, date('now'))
            `).bind(userId).run();
    } else {
        // Update existing streak
        const lastDate = new Date(streak.last_submission_date);
        const today = new Date();
        const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

        if (daysDiff === 1) {
            // Continue streak
            const newStreak = streak.current_streak + 1;
            const maxStreak = Math.max(newStreak, streak.max_streak);

            await env.DB.prepare(`
                    UPDATE user_streaks 
                    SET current_streak = ?, max_streak = ?, last_submission_date = date('now')
                    WHERE user_id = ?
                `).bind(newStreak, maxStreak, userId).run();
        } else if (daysDiff > 1) {
            // Reset streak
            await env.DB.prepare(`
                    UPDATE user_streaks 
                    SET current_streak = 1, last_submission_date = date('now')
                    WHERE user_id = ?
                `).bind(userId).run();
        }
        // If daysDiff === 0, user already submitted today, don't update
    }
}