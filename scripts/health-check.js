// scripts/health-check.js
const API_URL = 'https://brainrot-api.w4hf9yq226.workers.dev';
const FRONTEND_URL = 'https://brainrot-judge.netlify.app';

async function checkHealth() {
    console.log('🏥 Running Health Checks...\n');

    const checks = [
        {
            name: 'API Health',
            url: `${API_URL}/api/health`,
            expectedStatus: 200
        },
        {
            name: 'Submissions Endpoint',
            url: `${API_URL}/api/submissions`,
            expectedStatus: 200
        },
        {
            name: 'Leaderboard Endpoint',
            url: `${API_URL}/api/leaderboard`,
            expectedStatus: 200
        },
        {
            name: 'Daily Challenge',
            url: `${API_URL}/api/daily-challenge`,
            expectedStatus: 200
        },
        {
            name: 'Frontend Site',
            url: FRONTEND_URL,
            expectedStatus: 200
        }
    ];

    let allHealthy = true;
    const results = [];

    for (const check of checks) {
        try {
            const options = {
                method: check.method || 'GET',
                headers: check.body ? { 'Content-Type': 'application/json' } : {}
            };
            if (check.body) options.body = check.body;

            const start = Date.now();
            const res = await fetch(check.url, options);
            const responseTime = Date.now() - start;

            const isHealthy = res.status === check.expectedStatus;
            const status = isHealthy ? '✅' : '⚠️';
            const statusText = isHealthy ? 'HEALTHY' : 'UNHEALTHY';

            console.log(`${status} ${check.name}: ${statusText} (${res.status}) - ${responseTime}ms`);

            results.push({
                name: check.name,
                healthy: isHealthy,
                status: res.status,
                responseTime
            });

            if (!isHealthy) {
                allHealthy = false;
            }
        } catch (error) {
            console.log(`❌ ${check.name}: ERROR - ${error.message}`);
            results.push({
                name: check.name,
                healthy: false,
                error: error.message
            });
            allHealthy = false;
        }
    }

    // Additional Auth Test (informational only)
    console.log('\n📋 Auth-Required Endpoints (info only):');
    await testAuthEndpoints();

    console.log('\n' + '='.repeat(50));
    if (allHealthy) {
        console.log('✅ All public systems operational!');
        console.log('Note: Auth endpoints require valid token for full testing');
    } else {
        console.log('⚠️ Some services need attention');

        // Show summary of issues
        const unhealthy = results.filter(r => !r.healthy);
        if (unhealthy.length > 0) {
            console.log('\n🔍 Issues detected:');
            unhealthy.forEach(item => {
                if (item.error) {
                    console.log(`  - ${item.name}: ${item.error}`);
                } else {
                    console.log(`  - ${item.name}: Expected 200, got ${item.status}`);
                }
            });
        }
        process.exit(1);
    }
}

// Test auth endpoints separately (informational)
async function testAuthEndpoints() {
    const authEndpoints = [
        { name: 'AI Rating', path: '/api/ai-rate', method: 'POST' },
        { name: 'Submit', path: '/api/submit', method: 'POST' },
        { name: 'Auth Verify', path: '/api/auth/verify', method: 'GET' }
    ];

    for (const endpoint of authEndpoints) {
        try {
            const res = await fetch(`${API_URL}${endpoint.path}`, {
                method: endpoint.method,
                headers: { 'Content-Type': 'application/json' },
                body: endpoint.method === 'POST' ? JSON.stringify({ test: true }) : undefined
            });

            if (res.status === 401) {
                console.log(`  ℹ️ ${endpoint.name}: Requires authentication (working correctly)`);
            } else if (res.status === 400) {
                console.log(`  ✓ ${endpoint.name}: Endpoint accessible (validation working)`);
            } else {
                console.log(`  ? ${endpoint.name}: Status ${res.status}`);
            }
        } catch (error) {
            console.log(`  ❌ ${endpoint.name}: Network error`);
        }
    }
}

// Performance metrics
async function checkPerformance() {
    console.log('\n📊 Performance Metrics:');

    const endpoints = [
        { name: 'API Health', url: `${API_URL}/api/health` },
        { name: 'Frontend', url: FRONTEND_URL }
    ];

    for (const endpoint of endpoints) {
        const times = [];

        // Take 3 samples
        for (let i = 0; i < 3; i++) {
            const start = Date.now();
            try {
                await fetch(endpoint.url);
                times.push(Date.now() - start);
            } catch (e) {
                times.push(-1);
            }
        }

        const validTimes = times.filter(t => t > 0);
        if (validTimes.length > 0) {
            const avg = Math.round(validTimes.reduce((a, b) => a + b, 0) / validTimes.length);
            const min = Math.min(...validTimes);
            const max = Math.max(...validTimes);
            console.log(`  ${endpoint.name}: avg ${avg}ms (min: ${min}ms, max: ${max}ms)`);
        } else {
            console.log(`  ${endpoint.name}: Failed to measure`);
        }
    }
}

// Main execution
async function main() {
    try {
        await checkHealth();
        await checkPerformance();

        console.log('\n✨ Health check complete!');
        console.log('Tip: Run "npm run test:api" for detailed API testing');
    } catch (error) {
        console.error('Health check failed:', error);
        process.exit(1);
    }
}

main();