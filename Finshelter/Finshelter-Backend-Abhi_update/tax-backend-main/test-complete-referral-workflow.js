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

async function testReferralWorkflow() {
    try {
        console.log('=== Testing Complete Referral Workflow ===\n');

        // Step 1: Create referrer
        console.log('1. Creating referrer user...');
        const referrerData = {
            name: 'Sarah',
            lastname: 'Connor',
            username: 'sarah' + Date.now(),
            email: 'sarah' + Date.now() + '@example.com',
            password: 'password123',
            mobile: '5555555555'
        };

        const referrerResponse = await makeRequest('POST', '/api/customers/user-register', referrerData);
        if (referrerResponse.status !== 200) {
            throw new Error('Failed to create referrer');
        }

        const referrerReferralCode = referrerResponse.data.referralCode;
        console.log('✅ Referrer created: Sarah Connor');
        console.log('Referral Code:', referrerReferralCode);

        // Step 2: Create referred user
        console.log('\n2. Creating referred user with referral code...');
        const referredData = {
            name: 'John',
            lastname: 'Connor',
            username: 'john' + Date.now(),
            email: 'john' + Date.now() + '@example.com',
            password: 'password123',
            mobile: '4444444444',
            referralCode: referrerReferralCode
        };

        const referredResponse = await makeRequest('POST', '/api/customers/user-register', referredData);
        if (referredResponse.status !== 200) {
            throw new Error('Failed to create referred user');
        }

        console.log('✅ Referred user created: John Connor');
        const referredUserId = referredResponse.data.userId;

        // Step 3: Wait a moment for database to sync
        console.log('\n3. Waiting 2 seconds for database sync...');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Step 4: Check admin dashboard for referrer information
        console.log('\n4. Checking admin dashboard for referrer information...');
        const adminResponse = await makeRequest('GET', '/api/admin/dashboard');
        
        if (adminResponse.status === 200) {
            const users = adminResponse.data.users;
            
            // Find our newly created referred user
            const johnUser = users.find(user => user._id === referredUserId);
            
            if (johnUser) {
                console.log('\n--- Referred User in Admin Panel ---');
                console.log('Name:', johnUser.name);
                console.log('Email:', johnUser.email);
                console.log('User ID:', johnUser._id);
                console.log('');
                console.log('--- Referrer Information ---');
                console.log('Referred By (Object):', johnUser.referredBy ? 'Yes' : 'No');
                console.log('Referrer Name:', johnUser.referrerName || 'Not set');
                console.log('Referrer Email:', johnUser.referrerEmail || 'Not set');
                console.log('Referrer Code:', johnUser.referrerCode || 'Not set');
                
                if (johnUser.referredBy && typeof johnUser.referredBy === 'object') {
                    console.log('Referrer ID:', johnUser.referredBy._id);
                    console.log('Referrer Name (from object):', johnUser.referredBy.name);
                    console.log('Referrer Email (from object):', johnUser.referredBy.email);
                }

                if (johnUser.referrerName) {
                    console.log('\n✅ SUCCESS: Referrer information is properly visible in admin panel!');
                    console.log(`${johnUser.name} was referred by ${johnUser.referrerName}`);
                } else {
                    console.log('\n❌ ISSUE: Referrer information is not showing in admin panel');
                }
            } else {
                console.log('❌ Could not find the newly created user in admin panel');
            }

            // Show summary of all users with referrers
            const usersWithReferrers = users.filter(user => user.referrerName);
            console.log(`\n--- Summary: ${usersWithReferrers.length} total users have referrer information ---`);
            usersWithReferrers.forEach(user => {
                console.log(`- ${user.name} was referred by ${user.referrerName}`);
            });

        } else {
            console.log('❌ Failed to fetch admin dashboard data');
        }

        console.log('\n=== Test Complete ===');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.error('Full error:', error);
    }
}

testReferralWorkflow();