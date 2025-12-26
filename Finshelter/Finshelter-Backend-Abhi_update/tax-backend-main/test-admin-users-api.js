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

async function testAdminUsersAPI() {
    try {
        console.log('=== Testing Admin Users API ===\n');

        console.log('1. Fetching users from admin dashboard API...');
        const adminResponse = await makeRequest('GET', '/api/admin/dashboard');
        
        if (adminResponse.status === 200) {
            const users = adminResponse.data.users;
            console.log(`✅ Retrieved ${users.length} users from admin API`);

            // Find users with referredBy data
            const usersWithReferrers = users.filter(user => user.referredBy || user.referrerName);
            console.log(`\nUsers with referrer information: ${usersWithReferrers.length}`);

            usersWithReferrers.forEach((user, index) => {
                console.log(`\n--- User ${index + 1} ---`);
                console.log('Name:', user.name);
                console.log('Email:', user.email);
                console.log('User ID:', user._id);
                console.log('Referred By (raw):', user.referredBy);
                console.log('Referrer Name:', user.referrerName);
                console.log('Referrer Email:', user.referrerEmail);
                
                if (typeof user.referredBy === 'object' && user.referredBy) {
                    console.log('Referred By Object:');
                    console.log('  - ID:', user.referredBy._id);
                    console.log('  - Name:', user.referredBy.name);
                    console.log('  - Email:', user.referredBy.email);
                }
            });

            // Test recent users (last 5)
            console.log('\n--- Recent Users (Last 5) ---');
            const recentUsers = users.slice(-5);
            recentUsers.forEach((user, index) => {
                console.log(`${index + 1}. ${user.name} - Referred By: ${
                    user.referredBy ? 
                        (typeof user.referredBy === 'object' ? 
                            user.referredBy.name : 
                            user.referrerName || user.referredBy
                        ) : "None"
                }`);
            });

        } else {
            console.log('❌ Failed to fetch admin data:', adminResponse);
        }

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testAdminUsersAPI();