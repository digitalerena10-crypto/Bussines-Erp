async function testCreation() {
    const baseUrl = 'http://localhost:5000/api';

    // 1. Login to get token
    console.log('Logging in...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
    });
    const loginData = await loginRes.json();

    if (!loginData.success) {
        console.error('Login failed', loginData);
        return;
    }

    const token = loginData.data.tokens.accessToken;
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    // 2. Try adding a category
    console.log('\nAdding Category...');
    const catRes = await fetch(`${baseUrl}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: 'Test Category', description: 'Test Desc' })
    });
    console.log('Category Add Response:', await catRes.json());

    // 3. Try getting categories
    console.log('\nGetting Categories...');
    const getCatRes = await fetch(`${baseUrl}/categories`, { headers });
    console.log('Categories:', await getCatRes.json());

    // 4. Try adding a product
    console.log('\nAdding Product...');
    const prodRes = await fetch(`${baseUrl}/products`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            name: 'Test Product',
            base_price: 100,
            sku: 'TEST-SKU-' + Math.floor(Math.random() * 1000),
            stock_quantity: 10
        })
    });
    console.log('Product Add Response:', await prodRes.json());

    // 5. Try getting products
    console.log('\nGetting Products...');
    const getProdRes = await fetch(`${baseUrl}/products`, { headers });
    console.log('Products:', await getProdRes.json());
}

testCreation();
