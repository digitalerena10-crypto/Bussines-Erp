const https = require('https');

https.get('https://bussines-erp-production.up.railway.app/', (res) => {
    console.log('STATUS:', res.statusCode);
    console.log('HEADERS:', res.headers);
    res.on('data', d => process.stdout.write(d));
}).on('error', (e) => {
    console.error(e);
});
