// scripts/test-api.js - Test your API endpoints with authentication
const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';
// For local testing, use: 'http://localhost:8787'

// Test credentials - you can modify these
const TEST_USER = {
    username: 'test-user-' + Date.now(),
    password: 'testpass123'
};

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    reset: '\x1b[0m'
};

// Store auth token for authenticated requests
let authToken = null;

// Helper function for authenticated requests
async function authenticatedFetch(url, options = {}) {
    if (!authToken) {
        throw new Error('No auth token available. Please register/login first.');
    }

    return fetch(url, {
        ...options,
        headers: {
            ...options.headers,
            'Authorization': `Bearer ${authToken}`
        }
    });
}

// Test functions
async function testHealth() {
    console.log(`${colors.blue}Testing health endpoint...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        console.log(`${colors.green}✔ Health check passed:${colors.reset}`, data);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Health check failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testRegister() {
    console.log(`${colors.blue}Testing user registration...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        if (response.status === 400) {
            // User might already exist, try login instead
            console.log(`${colors.yellow}  User might already exist, trying login...${colors.reset}`);
            return await testLogin();
        }

        const data = await response.json();
        if (data.success && data.token) {
            authToken = data.token;
            console.log(`${colors.green}✔ Registration successful:${colors.reset}`);
            console.log(`  Username: ${data.user.username}`);
            console.log(`  Token received: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            throw new Error(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error(`${colors.red}✗ Registration failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testLogin() {
    console.log(`${colors.blue}Testing user login...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });

        const data = await response.json();
        if (data.success && data.token) {
            authToken = data.token;
            console.log(`${colors.green}✔ Login successful:${colors.reset}`);
            console.log(`  Username: ${data.user.username}`);
            console.log(`  Token received: ${authToken.substring(0, 20)}...`);
            return true;
        } else {
            throw new Error(data.error || 'Login failed');
        }
    } catch (error) {
        console.error(`${colors.red}✗ Login failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testVerifyAuth() {
    console.log(`${colors.blue}Testing auth verification...${colors.reset}`);
    try {
        const response = await authenticatedFetch(`${API_URL}/api/auth/verify`);
        const data = await response.json();

        if (data.authenticated) {
            console.log(`${colors.green}✔ Auth verification successful:${colors.reset}`);
            console.log(`  User: ${data.user.username}`);
            return true;
        } else {
            throw new Error('Token not valid');
        }
    } catch (error) {
        console.error(`${colors.red}✗ Auth verification failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testAIRating() {
    console.log(`${colors.blue}Testing AI rating endpoint (with auth)...${colors.reset}`);
    try {
        const response = await authenticatedFetch(`${API_URL}/api/ai-rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caption: 'fr fr no cap this ohio rizz got me acting unwise with that aura farming deadass'
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`${colors.green}✔ AI rating successful:${colors.reset}`);
        console.log('  Ratings:', JSON.stringify(data.ratings, null, 2));
        console.log('  AI Confidence:', data.aiConfidence);
        console.log('  Prediction ID:', data.predictionId);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ AI rating failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testSubmit() {
    console.log(`${colors.blue}Testing submission endpoint (with auth)...${colors.reset}`);
    try {
        const response = await authenticatedFetch(`${API_URL}/api/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caption: 'skibidi ohio rizz got that generational aura fr no cap',
                useAI: true
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || `Status: ${response.status}`);
        }

        const data = await response.json();
        console.log(`${colors.green}✔ Submission successful:${colors.reset}`);
        console.log('  Grade:', data.grade);
        console.log('  Score:', data.totalScore);
        console.log('  ID:', data.id);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Submission failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testSlangAnalysis() {
    console.log(`${colors.blue}Testing slang analysis...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/slang/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: 'deadass this is bussin with mad aura, penjamin and goon energy fr fr'
            })
        });
        const data = await response.json();
        console.log(`${colors.green}✔ Slang analysis successful:${colors.reset}`);
        console.log('  Score:', data.score);
        console.log('  Detected terms:', data.analysis?.detectedTerms?.length || 0);
        console.log('  Density:', data.analysis?.density?.toFixed(2) + '%');
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Slang analysis failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testDailyChallenge() {
    console.log(`${colors.blue}Testing daily challenge...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/daily-challenge`);
        const data = await response.json();
        console.log(`${colors.green}✔ Daily challenge fetched:${colors.reset}`);
        console.log('  Theme:', data.challenge?.theme);
        console.log('  Bonus points:', data.challenge?.bonus_points);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Daily challenge failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testSubmissions() {
    console.log(`${colors.blue}Testing submissions endpoint...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/submissions`);
        const data = await response.json();
        console.log(`${colors.green}✔ Submissions fetched:${colors.reset}`);
        console.log('  Count:', data.submissions?.length || 0);
        if (data.submissions?.length > 0) {
            console.log('  Latest:', data.submissions[0].user_id, '-', data.submissions[0].grade);
        }
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Submissions fetch failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testLeaderboard() {
    console.log(`${colors.blue}Testing leaderboard endpoint...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/leaderboard`);
        const data = await response.json();
        console.log(`${colors.green}✔ Leaderboard fetched:${colors.reset}`);
        console.log('  Leaders:', data.leaderboard?.length || 0);
        if (data.leaderboard?.length > 0) {
            console.log('  Top user:', data.leaderboard[0].user_name,
                '- Avg:', data.leaderboard[0].avg_score?.toFixed(1));
        }
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Leaderboard fetch failed:${colors.reset}`, error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log(`${colors.magenta}🧪 Starting Brainrot Judge API Tests${colors.reset}`);
    console.log(`${colors.magenta}Testing against: ${API_URL}${colors.reset}\n`);

    const tests = [
        { name: 'Health Check', fn: testHealth, requiresAuth: false },
        { name: 'User Registration', fn: testRegister, requiresAuth: false },
        { name: 'Auth Verification', fn: testVerifyAuth, requiresAuth: true },
        { name: 'AI Rating', fn: testAIRating, requiresAuth: true },
        { name: 'Submit Content', fn: testSubmit, requiresAuth: true },
        { name: 'Slang Analysis', fn: testSlangAnalysis, requiresAuth: false },
        { name: 'Daily Challenge', fn: testDailyChallenge, requiresAuth: false },
        { name: 'Get Submissions', fn: testSubmissions, requiresAuth: false },
        { name: 'Get Leaderboard', fn: testLeaderboard, requiresAuth: false }
    ];

    let passed = 0;
    let failed = 0;
    let skipped = 0;

    console.log(`${colors.cyan}━━━ Public Endpoints ━━━${colors.reset}\n`);

    for (const test of tests) {
        if (!test.requiresAuth) {
            const result = await test.fn();
            if (result) passed++;
            else failed++;
            console.log('');
        }
    }

    console.log(`${colors.cyan}━━━ Authenticated Endpoints ━━━${colors.reset}\n`);

    for (const test of tests) {
        if (test.requiresAuth) {
            if (!authToken && test.requiresAuth) {
                console.log(`${colors.yellow}⊘ Skipping ${test.name} (no auth token)${colors.reset}`);
                skipped++;
            } else {
                const result = await test.fn();
                if (result) passed++;
                else failed++;
            }
            console.log('');
        }
    }

    console.log(`${colors.magenta}📊 Test Results:${colors.reset}`);
    console.log(`${colors.green}  Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}  Failed: ${failed}${colors.reset}`);
    if (skipped > 0) {
        console.log(`${colors.yellow}  Skipped: ${skipped}${colors.reset}`);
    }

    if (failed === 0 && skipped === 0) {
        console.log(`\n${colors.green}🎉 All tests passed! Your API is working correctly.${colors.reset}`);
    } else if (failed === 0 && skipped > 0) {
        console.log(`\n${colors.yellow}⚠️ Public tests passed. Some auth tests were skipped.${colors.reset}`);
    } else {
        console.log(`\n${colors.red}⚠️ Some tests failed. Check the errors above.${colors.reset}`);
        process.exit(1);
    }
}

// Run the tests
runAllTests().catch(console.error);