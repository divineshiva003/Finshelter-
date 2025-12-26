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

async function testReferrerNameFeature() {
    try {
        console.log('=== Testing Referrer Name Feature ===\n');

        // Step 1: Create referrer
        console.log('1. Creating referrer user...');
        const referrerData = {
            name: 'Alice',
            lastname: 'Johnson',
            username: 'alice' + Date.now(),
            email: 'alice' + Date.now() + '@example.com',
            password: 'password123',
            mobile: '7777777777'
        };

        const referrerResponse = await makeRequest('POST', '/api/customers/user-register', referrerData);
        if (referrerResponse.status !== 200) {
            throw new Error('Failed to create referrer');
        }

        const referrerReferralCode = referrerResponse.data.referralCode;
        console.log('✅ Referrer created: Alice Johnson');
        console.log('Referral Code:', referrerReferralCode);

        // Step 2: Create referred user
        console.log('\n2. Creating referred user with referral code...');
        const referredData = {
            name: 'Bob',
            lastname: 'Wilson',
            username: 'bob' + Date.now(),
            email: 'bob' + Date.now() + '@example.com',
            password: 'password123',
            mobile: '6666666666',
            referralCode: referrerReferralCode
        };

        const referredResponse = await makeRequest('POST', '/api/customers/user-register', referredData);
        if (referredResponse.status !== 200) {
            throw new Error('Failed to create referred user');
        }

        const referredToken = referredResponse.data.token;
        console.log('✅ Referred user created: Bob Wilson');

        // Step 3: Get dashboard to check referrer info
        console.log('\n3. Checking referred user\'s dashboard for referrer information...');
        const dashboardResponse = await makeRequest('GET', '/api/customers/cdashboard', null, {
            'Authorization': `Bearer ${referredToken}`
        });

        if (dashboardResponse.status === 200) {
            const userData = dashboardResponse.data;
            console.log('\n--- Dashboard Data ---');
            console.log('User Name:', userData.user?.name);
            console.log('User ID:', userData.user?._id);
            
            if (userData.user?.referredBy) {
                console.log('\n--- Referrer Information ---');
                console.log('Referred By (ID):', userData.user.referredBy._id || userData.user.referredBy);
                console.log('Referred By (Name):', userData.user.referredBy.name || 'Name not populated');
                console.log('Referred By (Email):', userData.user.referredBy.email || 'Email not populated');
                console.log('Referred By (Referral Code):', userData.user.referredBy.referralCode || 'Code not populated');
                console.log('✅ Referrer information is properly populated!');
            } else {
                console.log('❌ No referrer information found');
                console.log('Full user object:', JSON.stringify(userData.user, null, 2));
            }
        } else {
            console.log('❌ Failed to get dashboard:', dashboardResponse);
        }

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testReferrerNameFeature();