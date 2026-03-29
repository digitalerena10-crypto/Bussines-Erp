const http = require('http');

const request = (options, postData) => {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    resolve({ statusCode: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ statusCode: res.statusCode, data: data });
                }
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
};

async function verifyAudit() {
    try {
        console.log('1. Logging in...');
        const loginData = JSON.stringify({ email: 'admin@company.com', password: 'password123' });
        const loginRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        }, loginData);

        const token = loginRes.data.data.tokens.accessToken;
        console.log('   Login successful.');

        console.log('\n2. Creating a test product category (trigger mutation)...');
        const catData = JSON.stringify({ name: 'Audit Test Category', description: 'Testing Phase 5' });
        const catRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/categories',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(catData)
            }
        }, catData);
        console.log(`   Category created. Status: ${catRes.statusCode}`);

        console.log('\n3. Fetching Audit Logs to verify capture...');
        const auditRes = await request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/admin/audit-logs',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const latestLog = auditRes.data.data[0];
        console.log('   Latest Audit Entry:');
        console.log(`   - Action: ${latestLog.action}`);
        console.log(`   - Resource: ${latestLog.resource}`);
        console.log(`   - User: ${latestLog.user_name}`);

        if (latestLog.action === 'POST' && latestLog.resource === 'Categories') {
            console.log('\n✅ VERIFICATION SUCCESS: Audit middleware captured the mutation.');
        } else {
            console.error('\n❌ VERIFICATION FAILED: Latest log does not match the expected mutation.');
            console.log('Log received:', latestLog);
        }

    } catch (e) {
        console.error('Error during verification:', e.message);
    }
}

verifyAudit();
