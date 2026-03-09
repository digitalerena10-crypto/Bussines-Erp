/**
 * Simple Mock Database logic to allow the ERP to run without PostgreSQL
 */
const bcrypt = require('bcryptjs');

const MOCK_DATA = {
    roles: [
        { id: '1', name: 'Super Admin' },
        { id: '2', name: 'Admin' }
    ],
    branches: [
        { id: '1', name: 'Main Headquarters' }
    ],
    users: [
        {
            id: '1',
            email: 'admin@company.com',
            password_hash: '', // Will be set below
            first_name: 'Super',
            last_name: 'Admin',
            role_id: '1',
            branch_id: '1',
            is_active: true
        }
    ],
    permissions: [
        { id: '1', name: 'view_dashboard' },
        { id: '2', name: 'manage_users' },
        { id: '3', name: 'manage_roles' },
        { id: '4', name: 'view_inventory' },
        { id: '5', name: 'manage_inventory' },
        { id: '6', name: 'view_sales' },
        { id: '7', name: 'manage_sales' },
        { id: '8', name: 'view_purchases' },
        { id: '9', name: 'manage_purchases' },
        { id: '10', name: 'view_media' },
        { id: '11', name: 'upload_files' }
    ],
    role_permissions: [
        { role_id: '1', permission_id: '1' },
        { role_id: '1', permission_id: '2' },
        { role_id: '1', permission_id: '3' },
        { role_id: '1', permission_id: '4' },
        { role_id: '1', permission_id: '5' },
        { role_id: '1', permission_id: '6' },
        { role_id: '1', permission_id: '7' },
        { role_id: '1', permission_id: '8' },
        { role_id: '1', permission_id: '9' },
        { role_id: '1', permission_id: '10' },
        { role_id: '1', permission_id: '11' }
    ],
    employees: [
        { id: '1', first_name: 'John', last_name: 'Doe', email: 'john.doe@company.com', designation: 'Senior Manager', department: 'Operations', salary: 5000, join_date: '2023-01-15' },
        { id: '2', first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@company.com', designation: 'Sales Executive', department: 'Sales', salary: 3500, join_date: '2023-03-10' },
        { id: '3', first_name: 'Mike', last_name: 'Ross', email: 'mike.ross@company.com', designation: 'Accountant', department: 'Finance', salary: 4000, join_date: '2023-06-01' }
    ],
    attendance: [
        { id: '1', employee_id: '1', date: '2024-03-01', status: 'Present' },
        { id: '2', employee_id: '2', date: '2024-03-01', status: 'Present' },
        { id: '3', employee_id: '3', date: '2024-03-01', status: 'Absent' }
    ],
    payroll: [
        { id: '1', employee_id: '1', month: 'February 2024', basic_salary: 5000, bonus: 500, deductions: 200, net_salary: 5300, status: 'Paid' },
        { id: '2', employee_id: '2', month: 'February 2024', basic_salary: 3500, bonus: 200, deductions: 100, net_salary: 3600, status: 'Paid' }
    ],
    products: [
        { id: '1', name: 'MacBook Pro', sku: 'LAP-001', base_price: 2500, stock: 15, min_stock_level: 10, is_active: true, unit_of_measure: 'pcs' },
        { id: '2', name: 'iPhone 15', sku: 'PHN-001', base_price: 999, stock: 42, min_stock_level: 20, is_active: true, unit_of_measure: 'pcs' },
        { id: '3', name: 'AirPods Max', sku: 'AUD-001', base_price: 549, stock: 8, min_stock_level: 5, is_active: true, unit_of_measure: 'pcs' }
    ],
    product_categories: [
        { id: '1', name: 'Electronics', description: 'Tech gadgets and devices', is_active: true },
        { id: '2', name: 'Accessories', description: 'Software and hardware accessories', is_active: true }
    ],
    suppliers: [
        { id: '1', name: 'Global Tech' },
        { id: '2', name: 'Prime Supplies' }
    ],
    sales_orders: [
        { id: '1', order_number: 'SO-20240301-001', customer_id: '1', total_amount: 3499, status: 'Completed', created_at: new Date().toISOString() },
        { id: '2', order_number: 'SO-20240302-002', customer_id: '2', total_amount: 1899, status: 'Pending', created_at: new Date().toISOString() }
    ],
    customers: [
        { id: '1', name: 'Acme Corp' },
        { id: '2', name: 'TechStart Inc' }
    ],
    inventory: [
        { id: '1', product_id: '1', branch_id: '1', quantity: 5 }, // MacBook Pro is low stock (min is 10)
        { id: '2', product_id: '2', branch_id: '1', quantity: 50 },
        { id: '3', product_id: '3', branch_id: '1', quantity: 2 }  // AirPods Max is low stock (min is 5)
    ],
    stock_movements: []
};

// Set password for the mock user (password123)
MOCK_DATA.users[0].password_hash = bcrypt.hashSync('password123', 10);

const handleMockQuery = async (text, params) => {
    const query = text.trim().toLowerCase().replace(/\s+/g, ' ');

    // Generic INSERT Parser
    if (query.startsWith('insert into')) {
        const tableMatch = query.match(/insert into\s+([a-z0-9_]+)/i);
        if (tableMatch) {
            const table = tableMatch[1];
            if (!MOCK_DATA[table]) MOCK_DATA[table] = [];

            // Special handling for inventory upsert (ON CONFLICT)
            if (table === 'inventory' && query.includes('on conflict')) {
                const productId = params[0];
                const branchId = params[1];
                const qtyDiff = params[2];

                let record = MOCK_DATA.inventory.find(i => i.product_id == productId && i.branch_id == branchId);
                if (record) {
                    record.quantity = Number(record.quantity) + Number(qtyDiff);
                    record.last_updated = new Date().toISOString();
                } else {
                    record = {
                        id: String(MOCK_DATA.inventory.length + 1),
                        product_id: productId,
                        branch_id: branchId,
                        quantity: Number(qtyDiff),
                        last_updated: new Date().toISOString()
                    };
                    MOCK_DATA.inventory.push(record);
                }
                return { rows: [record], rowCount: 1 };
            }

            const columnsMatch = query.match(/\(([^)]+)\)/);
            const columns = columnsMatch ? columnsMatch[1].split(',').map(c => c.trim()) : [];

            const newRecord = { id: String(MOCK_DATA[table].length + 1) };
            columns.forEach((col, index) => {
                newRecord[col] = params[index];
            });
            newRecord.created_at = new Date().toISOString();

            MOCK_DATA[table].push(newRecord);
            return { rows: [newRecord], rowCount: 1 };
        }
    }

    // Generic UPDATE Parser
    if (query.startsWith('update')) {
        const tableMatch = query.match(/update\s+([a-z0-9_]+)/i);
        if (tableMatch) {
            const table = tableMatch[1];
            if (MOCK_DATA[table]) {
                const idMatch = query.match(/where id\s*=\s*\$([0-9]+)/i);
                if (idMatch) {
                    const paramIndex = parseInt(idMatch[1], 10) - 1;
                    const id = params[paramIndex];
                    const recordIndex = MOCK_DATA[table].findIndex(r => r.id == id);

                    if (recordIndex !== -1) {
                        const setPart = query.split('where')[0].split('set')[1];
                        if (setPart) {
                            const assignments = setPart.split(',').map(s => s.trim());
                            assignments.forEach((assignment) => {
                                const col = assignment.split('=')[0].trim();
                                const valMatch = assignment.match(/\$([0-9]+)/);
                                if (valMatch) {
                                    const valIndex = parseInt(valMatch[1], 10) - 1;
                                    MOCK_DATA[table][recordIndex][col] = params[valIndex];
                                }
                            });
                            MOCK_DATA[table][recordIndex].updated_at = new Date().toISOString();
                            return { rows: [MOCK_DATA[table][recordIndex]], rowCount: 1 };
                        }
                    }
                } else if (query.includes('last_login = current_timestamp')) { // Special case for auth
                    return { rows: [], rowCount: 1 };
                }
            }
        }
    }

    // Generic DELETE Parser
    if (query.startsWith('delete from')) {
        const tableMatch = query.match(/delete from\s+([a-z0-9_]+)/i);
        if (tableMatch) {
            const table = tableMatch[1];
            if (MOCK_DATA[table]) {
                const idMatch = query.match(/where id\s*=\s*\$([0-9]+)/i);
                if (idMatch) {
                    const paramIndex = parseInt(idMatch[1], 10) - 1;
                    const id = params[paramIndex];
                    const initialLength = MOCK_DATA[table].length;
                    MOCK_DATA[table] = MOCK_DATA[table].filter(r => r.id != id);
                    return { rows: [], rowCount: initialLength - MOCK_DATA[table].length };
                }
            }
        }
    }

    // 1. SELECT NOW()
    if (query.includes('select now()')) {
        return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
    }

    // 2. Dashboard Stats aggregation
    if (query.includes('sum(total_amount) as total from sales_orders')) {
        const total = MOCK_DATA.sales_orders
            .filter(o => o.status === 'Completed')
            .reduce((sum, o) => sum + o.total_amount, 0);
        return { rows: [{ total }], rowCount: 1 };
    }

    if (query.includes('count(*) as count from sales_orders')) {
        return { rows: [{ count: MOCK_DATA.sales_orders.length }], rowCount: 1 };
    }

    if (query.includes('count(*) as count from products')) {
        return { rows: [{ count: MOCK_DATA.products.length }], rowCount: 1 };
    }

    if (query.includes('count(*) as count from employees')) {
        return { rows: [{ count: MOCK_DATA.employees.length }], rowCount: 1 };
    }

    // 3. Sales Orders with Join
    if (query.includes('from sales_orders so') && query.includes('left join customers c')) {
        const orders = MOCK_DATA.sales_orders.map(o => {
            const customer = MOCK_DATA.customers.find(c => c.id == o.customer_id);
            return {
                ...o,
                customer_name: customer ? customer.name : 'Unknown'
            };
        });
        return { rows: orders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), rowCount: orders.length };
    }

    // 4. Products query with Category Join
    if (query.includes('from products')) {
        const products = MOCK_DATA.products.map(p => {
            const cat = MOCK_DATA.product_categories?.find(c => c.id == p.category_id);
            return {
                ...p,
                category_name: cat ? cat.name : null
            };
        });
        return { rows: products, rowCount: products.length };
    }

    // Generic SELECT handler for other tables
    const genericSelectMatch = query.match(/from ([a-z0-9_]+)/i);
    if (genericSelectMatch) {
        const table = genericSelectMatch[1];
        if (MOCK_DATA[table]) {
            return { rows: MOCK_DATA[table], rowCount: MOCK_DATA[table].length };
        }
    }

    // 5. Auth: findUserByEmail
    if (query.includes('from users') && (query.includes('email = $1') || query.includes('email=$1'))) {
        const email = params[0]?.toLowerCase();
        const user = MOCK_DATA.users.find(u => u.email.toLowerCase() === email);
        if (user) {
            const role = MOCK_DATA.roles.find(r => r.id == user.role_id);
            return { rows: [{ ...user, role_name: role ? role.name : 'User' }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }

    // 6. User by ID (me)
    if (query.includes('from users') && (query.includes('id = $1') || query.includes('id=$1'))) {
        const id = params[0];
        const user = MOCK_DATA.users.find(u => u.id == id);
        if (user) {
            const role = MOCK_DATA.roles.find(r => r.id == user.role_id);
            return { rows: [{ ...user, role_name: role ? role.name : 'User' }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }

    // 7. Permissions for user
    if (query.includes('permissions') && query.includes('role_permissions')) {
        const roleId = params[0];
        const perms = MOCK_DATA.role_permissions
            .filter(rp => rp.role_id == roleId)
            .map(rp => ({ name: MOCK_DATA.permissions.find(p => p.id == rp.permission_id).name }));
        return { rows: perms, rowCount: perms.length };
    }

    // 8. Branches
    if (query.includes('from branches')) {
        return { rows: MOCK_DATA.branches, rowCount: MOCK_DATA.branches.length };
    }

    // 9. Employees
    if (query.includes('from employees')) {
        return { rows: MOCK_DATA.employees, rowCount: MOCK_DATA.employees.length };
    }

    // 10. Attendance
    if (query.includes('from attendance')) {
        return { rows: MOCK_DATA.attendance, rowCount: MOCK_DATA.attendance.length };
    }

    // 11. Payroll
    if (query.includes('from payroll')) {
        return { rows: MOCK_DATA.payroll, rowCount: MOCK_DATA.payroll.length };
    }

    // 11b. Inventory with Join
    if (query.includes('from inventory i') && query.includes('join products p') && query.includes('join branches b')) {
        const rows = MOCK_DATA.inventory.map(item => {
            const product = MOCK_DATA.products.find(p => p.id == item.product_id);
            const branch = MOCK_DATA.branches.find(b => b.id == item.branch_id);
            return {
                ...item,
                product_id: product?.id,
                sku: product?.sku,
                product_name: product?.name,
                min_stock_level: product?.min_stock_level || 0,
                branch_id: branch?.id,
                branch_name: branch?.name,
                last_updated: item.created_at || new Date().toISOString()
            };
        });
        return { rows, rowCount: rows.length };
    }

    // 11c. Critical Stock
    if (query.includes('from inventory i') && query.includes('join products p') && query.includes('where i.quantity <= p.min_stock_level')) {
        const rows = MOCK_DATA.inventory
            .map(item => {
                const product = MOCK_DATA.products.find(p => p.id == item.product_id);
                return {
                    name: product?.name,
                    quantity: item.quantity,
                    min_stock_level: product?.min_stock_level || 0
                };
            })
            .filter(item => item.quantity <= item.min_stock_level)
            .sort((a, b) => a.quantity - b.quantity)
            .slice(0, 5);
        return { rows, rowCount: rows.length };
    }

    // 12. Reporting: Sales Trends
    if (query.includes('from sales_trends')) {
        let rows = [
            { month: 'Jan', revenue: 45000, profit: 12000 },
            { month: 'Feb', revenue: 52000, profit: 15000 },
            { month: 'Mar', revenue: 48000, profit: 13500 },
            { month: 'Apr', revenue: 61000, profit: 19000 }
        ];

        if (params.length > 0) {
            rows = rows.filter(r => r.month === params[0]);
        }

        return { rows, rowCount: rows.length };
    }

    // 13. Reporting: Inventory Value
    if (query.includes('from inventory_summaries')) {
        let rows = [
            { category: 'Electronics', total_value: 125000, stock_count: 450 },
            { category: 'Furniture', total_value: 85000, stock_count: 120 },
            { category: 'Apparel', total_value: 45000, stock_count: 800 }
        ];

        if (params.length > 0) {
            rows = rows.filter(r => r.category === params[0]);
        }

        return { rows, rowCount: rows.length };
    }

    // 14. Roles
    if (query.includes('select id from roles where name = $1')) {
        const name = params[0];
        const role = MOCK_DATA.roles.find(r => r.name.toLowerCase() === name.toLowerCase());
        return { rows: role ? [role] : [], rowCount: role ? 1 : 0 };
    }

    // 15. Accounting: Chart of Accounts
    if (query.includes('from accounts')) {
        const mockAccounts = [
            { id: 1, code: '1000', name: 'Cash', type: 'Asset', category: 'Current Asset', balance: 50000 },
            { id: 2, code: '4000', name: 'Sales Revenue', type: 'Revenue', category: 'Operating Revenue', balance: 0 },
            { id: 3, code: '5000', name: 'Cost of Goods Sold', type: 'Expense', category: 'Operating Expense', balance: 0 }
        ];
        return { rows: mockAccounts, rowCount: mockAccounts.length };
    }

    // 16. Accounting: Transactions
    if (query.includes('from transactions')) {
        const mockTx = [
            { id: 1, transaction_date: new Date().toISOString(), description: 'Opening Balance', amount: 50000, debit_account_name: 'Cash', credit_account_name: 'Equity' }
        ];
        return { rows: mockTx, rowCount: mockTx.length };
    }

    // 17. Admin: Settings
    if (query.includes('from settings')) {
        const mockSettings = [
            { id: 1, company_name: 'ERP Corp', company_email: 'admin@erpcorp.com', currency: 'USD', timezone: 'UTC' }
        ];
        return { rows: mockSettings, rowCount: mockSettings.length };
    }

    // 18. Admin: Audit Logs
    if (query.includes('from audit_logs')) {
        const mockLogs = [
            { id: 1, user_name: 'Super Admin', action: 'LOGIN', resource: 'Auth', created_at: new Date().toISOString(), details: {} },
            { id: 2, user_name: 'Super Admin', action: 'UPDATE_SETTINGS', resource: 'Settings', created_at: new Date(Date.now() - 3600000).toISOString(), details: {} }
        ];
        return { rows: mockLogs, rowCount: mockLogs.length };
    }

    // Default: Log unmatched queries for debugging in Dev
    if (process.env.NODE_ENV === 'development') {
        console.log(`[MockDB] Unhandled query: ${query}`);
    }

    return { rows: [], rowCount: 0 };
};

module.exports = { handleMockQuery };
