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

async function testReferrerInfo() {
    try {
        console.log('=== Testing Referrer Name Display ===\n');

        // Get the user who was referred (cus008 from our previous test)
        // First let's get a token for this user
        const loginData = {
            username: 'jane1765968873870@example.com',  // Using email as username
            password: 'password123'
        };

        console.log('1. Logging in as referred user...');
        const loginResponse = await makeRequest('POST', '/api/customers/login', loginData);
        console.log('Login response status:', loginResponse.status);

        if (loginResponse.status !== 200) {
            console.log('Login failed, let\'s check dashboard with existing token from registration');
            // Use a generic dashboard call instead
            return;
        }

        const token = loginResponse.data.token;
        console.log('✅ Login successful!');

        // Get dashboard to see referrer info
        console.log('\n2. Getting customer dashboard...');
        const dashboardResponse = await makeRequest('GET', '/api/customers/cdashboard', null, {
            'Authorization': `Bearer ${token}`
        });
        console.log('Dashboard response:', dashboardResponse);

        if (dashboardResponse.status === 200 && dashboardResponse.data.user) {
            const user = dashboardResponse.data.user;
            console.log('\n--- Referrer Information ---');
            console.log('User ID:', user._id);
            console.log('User Name:', user.name);
            console.log('Referred By ID:', user.referredBy?._id || 'None');
            console.log('Referred By Name:', user.referredBy?.name || 'None');
            console.log('Referred By Email:', user.referredBy?.email || 'None');
            console.log('Referred By Referral Code:', user.referredBy?.referralCode || 'None');
        }

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

testReferrerInfo();