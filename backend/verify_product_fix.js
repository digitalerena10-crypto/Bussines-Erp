const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testProductCreation() {
    try {
        console.log('--- Phase 1: Login ---');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@company.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful, token received.');

        const config = {
            headers: { Authorization: `Bearer ${token}` }
        };

        console.log('\n--- Phase 2: Create Product ---');
        const productData = {
            name: 'Test Debug Product',
            base_price: 1500,
            stock_quantity: 10,
            unit_of_measure: 'pcs',
            category_id: '1'
        };

        const createRes = await axios.post(`${API_URL}/products`, productData, config);
        console.log('Create Product Response:', createRes.data);

        console.log('\n--- Phase 3: Verify Persistence ---');
        const listRes = await axios.get(`${API_URL}/products`, config);
        const products = listRes.data.data;
        const found = products.find(p => p.name === 'Test Debug Product');

        if (found) {
            console.log('SUCCESS: Product found in list!');
            console.log('Record details:', found);
        } else {
            console.log('FAILURE: Product NOT found in list.');
        }

    } catch (error) {
        console.error('Test Error:', error.response?.data || error.message);
    }
}

testProductCreation();
