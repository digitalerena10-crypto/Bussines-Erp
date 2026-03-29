const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, 'data.json');

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
        { id: '11', name: 'upload_files' },
        { id: '12', name: 'view_reports' },
        { id: '13', name: 'view_accounting' },
        { id: '14', name: 'manage_accounting' },
        { id: '15', name: 'view_hr' },
        { id: '16', name: 'manage_hr' }
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
        { role_id: '1', permission_id: '11' },
        { role_id: '1', permission_id: '12' },
        { role_id: '1', permission_id: '13' },
        { role_id: '1', permission_id: '14' },
        { role_id: '1', permission_id: '15' },
        { role_id: '1', permission_id: '16' }
    ],
    employees: [],
    attendance: [],
    payroll: [],
    products: [],
    product_categories: [],
    suppliers: [],
    sales_orders: [],
    customers: [],
    inventory: [],
    stock_movements: [],
    audit_logs: [],
    invoices: [],
    accounts: [
        { id: '1', name: 'Main Cash Account', code: '1000', type: 'Asset', balance: 0, is_active: true },
        { id: '2', name: 'Inventory Asset', code: '1200', type: 'Asset', balance: 0, is_active: true },
        { id: '3', name: 'Sales Revenue', code: '4000', type: 'Revenue', balance: 0, is_active: true },
        { id: '4', name: 'Cost of Goods Sold', code: '5000', type: 'Expense', balance: 0, is_active: true }
    ],
    sales_order_items: [],
    invoice_items: [],
    transactions: [],
    journal_entries: [],
    journal_entry_lines: [],
    purchase_orders: [],
    purchase_order_items: []
};

// Set password for the mock user (password123)
MOCK_DATA.users[0].password_hash = bcrypt.hashSync('password123', 10);

// Helper to save data to disk
const saveToDisk = () => {
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(MOCK_DATA, null, 2));
    } catch (err) {
        console.error('[MockDB] Failed to save data:', err);
    }
};

// Helper to load data from disk
const loadFromDisk = () => {
    try {
        if (fs.existsSync(DB_PATH)) {
            const data = fs.readFileSync(DB_PATH, 'utf8');
            const parsed = JSON.parse(data);
            Object.keys(parsed).forEach(key => {
                MOCK_DATA[key] = parsed[key];
            });
            console.log('[MockDB] Data loaded from disk');
        } else {
            console.log('[MockDB] No data.json found, using defaults');
            saveToDisk();
        }
    } catch (err) {
        console.error('[MockDB] Failed to load data:', err);
    }
};

// Initialize persistence
loadFromDisk();

const handleMockQuery = async (text, params) => {
    const query = text.trim().toLowerCase().replace(/\s+/g, ' ');

    // Transaction Management
    if (['begin', 'commit', 'rollback'].includes(query)) {
        return { rows: [], rowCount: 0 };
    }

    // Generic INSERT Parser
    if (query.startsWith('insert into')) {
        const tableMatch = query.match(/insert into\s+([a-z0-9_]+)/i);
        if (tableMatch) {
            const table = tableMatch[1].toLowerCase();
            if (!MOCK_DATA[table]) MOCK_DATA[table] = [];

            // Special handling for inventory upsert (ON CONFLICT)
            if (table === 'inventory' && query.includes('on conflict')) {
                const productId = params[0];
                const branchId = params[1];
                const qtyVal = Number(params[2]) || 0;

                let record = MOCK_DATA.inventory.find(i => i.product_id == productId && i.branch_id == branchId);
                if (record) {
                    // If query has "inventory.quantity +", it's a relative update (movement)
                    // If it just has "quantity = $", it's an absolute update (product edit)
                    if (query.includes('inventory.quantity +')) {
                        record.quantity = Number(record.quantity) + qtyVal;
                    } else {
                        record.quantity = qtyVal;
                    }
                    record.last_updated = new Date().toISOString();
                } else {
                    record = {
                        id: String(MOCK_DATA.inventory.length + 1),
                        product_id: productId,
                        branch_id: branchId,
                        quantity: qtyVal,
                        last_updated: new Date().toISOString()
                    };
                    MOCK_DATA.inventory.push(record);
                }
                saveToDisk();
                return { rows: [record], rowCount: 1 };
            }

            // Enhanced column/value parsing
            const colsPart = text.match(/\((.*?)\)/s);
            const columns = colsPart ? colsPart[1].split(',').map(c => c.trim().toLowerCase()) : [];

            const newRecord = { id: String(MOCK_DATA[table].length + 1) };
            columns.forEach((col, index) => {
                if (index < params.length) {
                    newRecord[col] = params[index];
                }
            });

            // Set default fields if missing
            if (newRecord.is_active === undefined && ['products', 'product_categories', 'customers', 'suppliers', 'accounts'].includes(table)) {
                newRecord.is_active = true;
            }
            if (newRecord.branch_id === undefined && table === 'suppliers') {
                newRecord.branch_id = '1';
            }
            newRecord.created_at = new Date().toISOString();

            MOCK_DATA[table].push(newRecord);
            saveToDisk();
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
                        const setPartMatch = text.match(/set\s+(.*?)\s+where/is);
                        if (setPartMatch) {
                            const setPart = setPartMatch[1];
                            const assignments = setPart.split(',').map(s => s.trim());
                            assignments.forEach((assignment) => {
                                const parts = assignment.split('=');
                                if (parts.length < 2) return;

                                const col = parts[0].trim().toLowerCase();
                                const valExpr = parts[1].trim();

                                // Check for relative update like "quantity = quantity - $1"
                                const relativeMatch = valExpr.match(/([a-z0-9_]+)\s*([-+])\s*\$([0-9]+)/i);
                                if (relativeMatch) {
                                    const operator = relativeMatch[2];
                                    const paramIdx = parseInt(relativeMatch[3]) - 1;
                                    const val = Number(params[paramIdx]) || 0;

                                    if (operator === '+') {
                                        MOCK_DATA[table][recordIndex][col] = Number(MOCK_DATA[table][recordIndex][col] || 0) + val;
                                    } else {
                                        MOCK_DATA[table][recordIndex][col] = Number(MOCK_DATA[table][recordIndex][col] || 0) - val;
                                    }
                                } else {
                                    // Regular assignment
                                    const valMatch = valExpr.match(/\$([0-9]+)/);
                                    if (valMatch) {
                                        const valIndex = parseInt(valMatch[1]) - 1;
                                        if (valIndex < params.length) {
                                            MOCK_DATA[table][recordIndex][col] = params[valIndex];
                                        }
                                    }
                                }
                            });
                            MOCK_DATA[table][recordIndex].updated_at = new Date().toISOString();
                            saveToDisk();
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
                    saveToDisk();
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
            .reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
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
    if (query.includes('from products') && !query.includes('from inventory')) {
        const products = MOCK_DATA.products.map(p => {
            const cat = MOCK_DATA.product_categories?.find(c => c.id == p.category_id);
            const invRecord = MOCK_DATA.inventory.find(i => i.product_id == p.id);
            return {
                ...p,
                category_name: cat ? cat.name : null,
                quantity: invRecord ? Number(invRecord.quantity) : (Number(p.quantity) || Number(p.stock) || 0)
            };
        });
        return { rows: products, rowCount: products.length };
    }

    // 4.1 Inventory JOIN query
    if (query.includes('from inventory') && query.includes('join')) {
        const enriched = MOCK_DATA.inventory.map(inv => {
            const product = MOCK_DATA.products.find(p => p.id == inv.product_id);
            const branch = MOCK_DATA.branches.find(b => b.id == inv.branch_id);
            return {
                ...inv,
                product_name: product ? product.name : 'Unknown',
                sku: product ? product.sku : '-',
                min_stock_level: product ? (product.min_stock_level || 0) : 0,
                branch_name: branch ? branch.name : 'Main',
            };
        });
        return { rows: enriched, rowCount: enriched.length };
    }

    // 4.5. Aggregate and Reporting Queries
    if (query.includes('count(*)')) {
        if (query.includes('sales_orders')) return { rows: [{ count: MOCK_DATA.sales_orders.length }], rowCount: 1 };
        if (query.includes('products')) return { rows: [{ count: MOCK_DATA.products.length }], rowCount: 1 };
        if (query.includes('employees')) return { rows: [{ count: MOCK_DATA.employees.length }], rowCount: 1 };
        if (query.includes('suppliers')) return { rows: [{ count: MOCK_DATA.suppliers.length }], rowCount: 1 };
        if (query.includes('customers')) return { rows: [{ count: MOCK_DATA.customers.length }], rowCount: 1 };
    }

    if (query.includes('sum(') && query.includes('sales_orders')) {
        const total = MOCK_DATA.sales_orders.filter(s => s.status === 'Completed').reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
        return { rows: [{ total }], rowCount: 1 };
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

    // 6. User by ID
    if (query.includes('from users') && (query.includes('id = $1') || query.includes('id=$1'))) {
        const id = params[0];
        const user = MOCK_DATA.users.find(u => u.id == id);
        if (user) {
            const role = MOCK_DATA.roles.find(r => r.id == user.role_id);
            return { rows: [{ ...user, role_name: role ? role.name : 'User' }], rowCount: 1 };
        }
        return { rows: [], rowCount: 0 };
    }

    // 7. Permissions
    if (query.includes('permissions') && query.includes('role_permissions')) {
        const roleId = params[0];
        const perms = MOCK_DATA.role_permissions
            .filter(rp => rp.role_id == roleId)
            .map(rp => ({ name: MOCK_DATA.permissions.find(p => p.id == rp.permission_id).name }));
        return { rows: perms, rowCount: perms.length };
    }

    // 18. Audit Logs
    if (query.includes('from audit_logs')) {
        const logs = MOCK_DATA.audit_logs || [];
        const enrichedLogs = logs.map(log => {
            const user = MOCK_DATA.users.find(u => u.id == log.user_id);
            return {
                ...log,
                user_name: user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : (log.user_name || 'System')
            };
        });
        return {
            rows: enrichedLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 50),
            rowCount: enrichedLogs.length
        };
    }

    // 19. Customers
    if (query.includes('from customers c') && query.includes('left join branches b')) {
        const rows = MOCK_DATA.customers.map(c => {
            const branch = MOCK_DATA.branches.find(b => b.id == c.branch_id);
            return { ...c, branch_name: branch?.name || 'Main' };
        });
        return { rows: rows.sort((a, b) => a.name.localeCompare(b.name)), rowCount: rows.length };
    }

    // 20. Suppliers (Hardened)
    if (query.includes('from suppliers s') && query.includes('left join branches b')) {
        let searchVal = '';
        if (query.includes('ilike') && params.length > 0) {
            searchVal = params[0].replace(/%/g, '').toLowerCase();
        }

        let rows = MOCK_DATA.suppliers
            .filter(s => s.is_active !== false)
            .map(s => {
                const branch = MOCK_DATA.branches.find(b => b.id == s.branch_id);
                return { ...s, branch_name: branch?.name || 'Main Headquarters' };
            });

        if (searchVal) {
            rows = rows.filter(r => 
                r.name.toLowerCase().includes(searchVal) || 
                (r.email && r.email.toLowerCase().includes(searchVal))
            );
        }

        return { rows: rows.sort((a, b) => a.name.localeCompare(b.name)), rowCount: rows.length };
    }

    // 20.1 Products (Hardened)
    if (query.includes('from products p') && query.includes('left join product_categories c')) {
        const rows = MOCK_DATA.products.filter(p => p.is_active !== false).map(p => {
            const category = MOCK_DATA.product_categories.find(c => c.id == p.category_id);
            const supplier = MOCK_DATA.suppliers.find(s => s.id == p.supplier_id);
            const totalQty = MOCK_DATA.inventory
                .filter(i => i.product_id == p.id)
                .reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

            return { 
                ...p, 
                category_name: category?.name || null,
                supplier_name: supplier?.name || null,
                quantity: totalQty
            };
        });
        return { rows: rows.sort((a, b) => a.name.localeCompare(b.name)), rowCount: rows.length };
    }

    // 21. Invoices
    if (query.includes('from invoices')) {
        const rows = (MOCK_DATA.invoices || []).map(inv => {
            const customer = MOCK_DATA.customers.find(c => c.id == inv.customer_id);
            return {
                ...inv,
                customer_name: customer?.name || (inv.customer_name || 'Guest'),
                grand_total: inv.grand_total || (Number(inv.total_amount) + (Number(inv.tax_amount) || 0))
            };
        });
        return { rows: rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), rowCount: rows.length };
    }

    // Generic Fallback
    const fromMatch = query.match(/from\s+([a-z0-9_]+)/i) || query.match(/update\s+([a-z0-9_]+)/i);
    if (fromMatch && !query.includes('count(*)') && !query.includes('sum(')) {
        const table = fromMatch[1];
        if (MOCK_DATA[table]) {
            let results = [...MOCK_DATA[table]];
            
            // Basic WHERE filtering support for common cases
            const inMatch = query.match(/where\s+([a-z0-9_]+)\s+in\s+\((.*?)\)/i);
            const whereMatch = query.match(/where\s+([a-z0-9_]+)\s*=\s*\$([0-9]+)/i);

            if (inMatch) {
                const col = inMatch[1].toLowerCase();
                const placeholders = inMatch[2].split(',').map(p => p.trim());
                const vals = placeholders.map(p => {
                    const idx = parseInt(p.replace('$', '')) - 1;
                    return params[idx];
                });
                results = results.filter(r => vals.some(v => String(v) == String(r[col])));
            } else if (whereMatch) {
                const col = whereMatch[1].toLowerCase();
                const paramIdx = parseInt(whereMatch[2]) - 1;
                const val = params[paramIdx];
                results = results.filter(r => String(r[col]) == String(val));
            }
            
            return { rows: results, rowCount: results.length };
        }
    }

    // 22. Accounting: Transactions Ledger (with joins)
    if (query.includes('from transactions t') && query.includes('left join accounts da')) {
        const rows = (MOCK_DATA.transactions || []).map(tx => {
            const da = MOCK_DATA.accounts.find(a => a.id == tx.debit_account_id);
            const ca = MOCK_DATA.accounts.find(a => a.id == tx.credit_account_id);
            return {
                ...tx,
                debit_account_name: da ? da.name : (tx.debit_account_name || 'Split'),
                credit_account_name: ca ? ca.name : (tx.credit_account_name || 'Split')
            };
        });
        return { rows: rows.sort((a, b) => new Date(b.transaction_date) - new Date(a.transaction_date)), rowCount: rows.length };
    }

    // 23. Accounting: Chart of Accounts (with balance calculation if needed)
    if (query.includes('from accounts') && !query.includes('where id')) {
        const rows = (MOCK_DATA.accounts || []).filter(a => a.is_active !== false);
        return { rows: rows.sort((a, b) => a.code.localeCompare(b.code)), rowCount: rows.length };
    }

    return { rows: [], rowCount: 0 };
};

module.exports = { handleMockQuery };
