// scripts/test-api.js - Test your API endpoints
const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';
// For local testing, use: 'http://localhost:8787'

// Color codes for console output
const colors = {
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    reset: '\x1b[0m'
};

// Test functions
async function testHealth() {
    console.log(`${colors.blue}Testing health endpoint...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/health`);
        const data = await response.json();
        console.log(`${colors.green}✓ Health check passed:${colors.reset}`, data);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Health check failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testAIRating() {
    console.log(`${colors.blue}Testing AI rating endpoint...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/ai-rate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                caption: 'fr fr no cap this ohio rizz got me acting unwise with that aura farming deadass',
                userId: 'test-user'
            })
        });
        const data = await response.json();
        console.log(`${colors.green}✓ AI rating successful:${colors.reset}`);
        console.log('  Ratings:', data.ratings);
        console.log('  AI Confidence:', data.aiConfidence);
        console.log('  Prediction ID:', data.predictionId);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ AI rating failed:${colors.reset}`, error.message);
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
        console.log(`${colors.green}✓ Slang analysis successful:${colors.reset}`);
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
        console.log(`${colors.green}✓ Daily challenge fetched:${colors.reset}`);
        console.log('  Theme:', data.challenge?.theme);
        console.log('  Bonus points:', data.challenge?.bonus_points);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Daily challenge failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testAddSlang() {
    console.log(`${colors.blue}Testing slang addition...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/slang/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                term: 'test-slang-' + Date.now(),
                weight: 2.5,
                category: 'test',
                variants: ['test-variant']
            })
        });
        const data = await response.json();
        console.log(`${colors.green}✓ Slang term added:${colors.reset}`, data.message);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Slang addition failed:${colors.reset}`, error.message);
        return false;
    }
}

async function testSubmissions() {
    console.log(`${colors.blue}Testing submissions endpoint...${colors.reset}`);
    try {
        const response = await fetch(`${API_URL}/api/submissions`);
        const data = await response.json();
        console.log(`${colors.green}✓ Submissions fetched:${colors.reset}`);
        console.log('  Count:', data.submissions?.length || 0);
        return true;
    } catch (error) {
        console.error(`${colors.red}✗ Submissions fetch failed:${colors.reset}`, error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log(`${colors.yellow}🧪 Starting Brainrot Judge API Tests${colors.reset}`);
    console.log(`${colors.yellow}Testing against: ${API_URL}${colors.reset}\n`);

    const tests = [
        { name: 'Health Check', fn: testHealth },
        { name: 'AI Rating', fn: testAIRating },
        { name: 'Slang Analysis', fn: testSlangAnalysis },
        { name: 'Daily Challenge', fn: testDailyChallenge },
        { name: 'Add Slang', fn: testAddSlang },
        { name: 'Get Submissions', fn: testSubmissions }
    ];

    let passed = 0;
    let failed = 0;

    for (const test of tests) {
        const result = await test.fn();
        if (result) passed++;
        else failed++;
        console.log(''); // Empty line between tests
    }

    console.log(`${colors.yellow}📊 Test Results:${colors.reset}`);
    console.log(`${colors.green}  Passed: ${passed}${colors.reset}`);
    console.log(`${colors.red}  Failed: ${failed}${colors.reset}`);

    if (failed === 0) {
        console.log(`\n${colors.green}🎉 All tests passed! Your API is working correctly.${colors.reset}`);
    } else {
        console.log(`\n${colors.red}⚠️  Some tests failed. Check the errors above.${colors.reset}`);
    }
}

// Run the tests
runAllTests().catch(console.error);