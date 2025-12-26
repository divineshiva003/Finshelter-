const http = require('http');

function makeRequest(method, path, data, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 8000,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => {
                body += chunk;
            });
            res.on('end', () => {
                try {
                    const parsedBody = JSON.parse(body);
                    resolve({ status: res.statusCode, data: parsedBody });
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        req.end();
    });
}

async function testRegistration() {
    try {
        console.log('=== Testing Registration Fix ===\n');

        // Test user registration
        console.log('1. Testing user registration...');
        const userData = {
            name: 'Test User',
            lastname: 'Smith',
            username: 'testuser' + Date.now(),
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            mobile: '9999999999'
        };

        const response = await makeRequest('POST', '/api/customers/user-register', userData);
        console.log('Registration response:', response);

        if (response.status === 200) {
            console.log('✅ Registration successful!');
            console.log('User ID:', response.data.userId);
            console.log('Referral Code:', response.data.referralCode);
        } else {
            console.log('❌ Registration failed with status:', response.status);
        }

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testRegistration();