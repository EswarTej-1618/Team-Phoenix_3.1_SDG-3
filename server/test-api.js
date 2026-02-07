const http = require('http');

const API_URL = 'http://localhost:3001/api/send-risk-alert';

const testData = {
    riskLevel: 'high',
    summary: 'HR 120, BP 145, SpO2 92, Glucose 150',
    message: 'Test alert: High risk detected. Heart rate elevated, blood pressure high, oxygen saturation low.'
};

console.log('=== Testing Risk Alert API ===\n');
console.log('Target URL:', API_URL);
console.log('Test Data:', JSON.stringify(testData, null, 2));
console.log('\nSending request...\n');

const postData = JSON.stringify(testData);

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/send-risk-alert',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
    }
};

const req = http.request(options, (res) => {
    console.log('Response Status:', res.statusCode);
    console.log('Response Headers:', JSON.stringify(res.headers, null, 2));
    console.log('');

    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        console.log('Response Body:', data);
        try {
            const json = JSON.parse(data);
            console.log('\nParsed Response:', JSON.stringify(json, null, 2));

            if (res.statusCode === 200 && json.ok) {
                console.log('\n✓ SUCCESS: Email alert sent successfully!');
            } else {
                console.log('\n✗ FAILED: Email alert was not sent');
                console.log('Error:', json.error || 'Unknown error');
            }
        } catch (e) {
            console.log('\n✗ Failed to parse response as JSON');
        }
    });
});

req.on('error', (e) => {
    console.error('\n✗ Request failed:', e.message);
    console.error('\nPossible issues:');
    console.error('1. Server is not running on port 3001');
    console.error('2. Run: cd server && npm start');
    console.error('3. Check if another process is using port 3001');
});

req.write(postData);
req.end();
