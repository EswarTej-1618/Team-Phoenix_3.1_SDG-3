const http = require('http');

async function testRiskAlert(riskLevel) {
    return new Promise((resolve, reject) => {
        const testData = {
            riskLevel: riskLevel,
            summary: `HR 120, BP 145, SpO2 92, Glucose 150`,
            message: `Test alert: ${riskLevel.toUpperCase()} risk detected. Heart rate elevated, blood pressure high.`
        };

        console.log(`\n=== Testing ${riskLevel.toUpperCase()} Risk Alert ===`);
        console.log('Test Data:', JSON.stringify(testData, null, 2));

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
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (res.statusCode === 200 && json.ok) {
                        console.log(`✓ SUCCESS: ${riskLevel.toUpperCase()} alert sent!`);
                        resolve(true);
                    } else {
                        console.log(`✗ FAILED: ${riskLevel.toUpperCase()} alert not sent`);
                        console.log('Error:', json.error || 'Unknown error');
                        resolve(false);
                    }
                } catch (e) {
                    console.log('✗ Failed to parse response');
                    resolve(false);
                }
            });
        });

        req.on('error', (e) => {
            console.error(`✗ Request failed:`, e.message);
            reject(e);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('=== SafeMom Email Alert Testing ===\n');
    console.log('Testing both HIGH and RISKY risk levels...\n');

    try {
        await testRiskAlert('high');
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        await testRiskAlert('risky');

        console.log('\n=== All Tests Complete ===');
        console.log('Check your email inbox for the test alerts!');
    } catch (e) {
        console.error('\nTest suite failed:', e.message);
        console.error('\nMake sure the server is running: cd server && npm start');
    }
}

runTests();
