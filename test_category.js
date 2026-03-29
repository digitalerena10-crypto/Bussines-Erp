async function testAddCategory() {
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
            console.log('No token! loginData:', loginData);
            return;
        }

        const payload = {
            name: 'Test Category ' + Date.now(),
            description: '',
            parent_id: null
        };

        const res = await fetch('http://localhost:5000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log('Response with null:', data);

        // Also test sending empty string, since that's what the UI was doing originally
        const payload2 = {
            name: 'Test Category 2 ' + Date.now(),
            description: '',
            parent_id: ''
        };

        const res2 = await fetch('http://localhost:5000/api/categories', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload2)
        });

        const data2 = await res2.json();
        console.log('Response with empty string:', data2);

    } catch (e) {
        console.error('Error:', e);
    }
}

testAddCategory();
