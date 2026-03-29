
const API_URL = 'http://localhost:5000/api';

async function verifyDashboard() {
    try {
        console.log('--- Verifying Dashboard Stats API (Native Fetch) ---');

        // 1. Login
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'password123'
            })
        });

        const loginResponse = await loginRes.json();
        if (!loginRes.ok) throw new Error(`Login failed: ${JSON.stringify(loginResponse)}`);

        // Token is in data.tokens.accessToken based on AuthService.login structure
        const token = loginResponse.data?.tokens?.accessToken || loginResponse.data?.token;
        if (!token) {
            console.log('Login Response:', JSON.stringify(loginResponse, null, 2));
            throw new Error('Access Token not found in login response');
        }

        console.log('Login successful. Token acquired.');

        // 2. Fetch Dashboard Stats
        console.log('Fetching dashboard stats...');
        const statsRes = await fetch(`${API_URL}/reports/dashboard-stats`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        const statsData = await statsRes.json();
        if (!statsData.success) {
            console.log('❌ FAILURE: Dashboard API returned success: false', statsData);
            return;
        }

        console.log('Dashboard Stats Summary:');
        statsData.data.forEach(s => {
            console.log(` - ${s.title}: ${s.value} ${s.change || ''}`);
        });

        const stats = statsData.data;
        const criticalStock = stats.find(s => s.title === 'Critical Stock');
        if (criticalStock && criticalStock.details && criticalStock.details.length > 0) {
            console.log('✅ SUCCESS: Critical Stock data is present and populated.');
            criticalStock.details.forEach(item => {
                console.log(`    ⚠️ ${item.name}: ${item.quantity} (Min: ${item.min_stock_level})`);
            });
        } else {
            console.log('❌ FAILURE: Critical Stock data is missing or empty.');
        }

        // 3. Fetch Inventory
        console.log('Fetching inventory...');
        const invRes = await fetch(`${API_URL}/inventory`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const invData = await invRes.json();
        console.log('Inventory Table Rows:', invData.data?.length || 0);
        if (invData.data && invData.data.length > 0) {
            console.log('✅ SUCCESS: Inventory table would render correctly.');
            console.log('First Item:', invData.data[0].product_name, '-', invData.data[0].quantity, 'units');
        } else {
            console.log('❌ FAILURE: Inventory is empty.');
        }

        // 4. Verify Chart Data
        console.log('Fetching sales summary...');
        const salesRes = await fetch(`${API_URL}/reports/sales-summary`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const salesData = await salesRes.json();
        if (salesData.data && salesData.data.length > 0) {
            console.log('✅ SUCCESS: Sales chart data is functional.');
            console.log('Data:', JSON.stringify(salesData.data));
        } else {
            console.log('❌ FAILURE: Sales summary empty.');
        }

    } catch (error) {
        console.error('Error during verification:', error.message);
    }
}

verifyDashboard();
