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
            name: 'AI Rating Endpoint',
            url: `${API_URL}/api/ai-rate`,
            method: 'POST',
            body: JSON.stringify({ caption: 'test', userId: 'health-check' }),
            expectedStatus: 200
        },
        {
            name: 'Frontend Site',
            url: FRONTEND_URL,
            expectedStatus: 200
        }
    ];

    let allHealthy = true;

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

            const status = res.status === check.expectedStatus ? '✅' : '⚠️';
            const statusText = res.status === check.expectedStatus ? 'HEALTHY' : 'UNHEALTHY';

            console.log(`${status} ${check.name}: ${statusText} (${res.status}) - ${responseTime}ms`);

            if (res.status !== check.expectedStatus) {
                allHealthy = false;
            }
        } catch (error) {
            console.log(`❌ ${check.name}: ERROR - ${error.message}`);
            allHealthy = false;
        }
    }

    console.log('\n' + '='.repeat(50));
    if (allHealthy) {
        console.log('✅ All systems operational!');
    } else {
        console.log('⚠️ Some services need attention');
        process.exit(1);
    }
}

checkHealth().catch(console.error);