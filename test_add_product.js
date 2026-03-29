async function testAddProduct() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@company.com',
                password: 'password123'
            })
        });

        const loginData = await loginRes.json();
        const token = loginData.data?.tokens?.accessToken;

        if (!token) {
            console.log("No token! loginData:", loginData);
            return;
        }

        const productPayload = {
            name: 'Test Product',
            sku: 'TST-001',
            category_id: null,
            brand: 'Test Brand',
            description: 'Test description',
            cost_price: 10,
            base_price: 20,
            tax_rate: 0,
            stock_quantity: 50,
            min_stock_level: 10,
            supplier_id: null,
            barcode: '',
            unit_of_measure: 'pcs',
            is_active: true,
            image_url: ''
        };

        const res = await fetch('http://localhost:5000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(productPayload)
        });

        const data = await res.json();
        console.log("Success:", data);
    } catch (e) {
        console.error("Error:", e);
    }
}

testAddProduct();
