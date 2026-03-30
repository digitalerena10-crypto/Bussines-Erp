// Simulates Railway production environment
process.env.NODE_ENV = 'production';
process.env.DATABASE_URL = 'postgresql://fake:fake@fakehost:5432/fake';
process.env.JWT_SECRET = 'test';
process.env.JWT_REFRESH_SECRET = 'test';
process.env.PORT = '9999';

console.log('=== STARTING TEST ===');

try {
    console.log('1. Loading server.js...');
    require('./backend/server.js');
    console.log('2. Server module loaded successfully');
} catch (e) {
    console.error('FATAL CRASH:', e.message);
    console.error(e.stack);
}

setTimeout(() => {
    console.log('3. Waited 5 seconds. Making test request...');
    const http = require('http');
    http.get('http://localhost:9999/', (res) => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => {
            console.log('4. Response status:', res.statusCode);
            console.log('5. Response body:', body);
            process.exit(0);
        });
    }).on('error', (e) => {
        console.error('4. FAILED to connect:', e.message);
        process.exit(1);
    });
}, 5000);
