-- ─── Phase 2 Seed Data ───────────────────────────────────────────
-- Initial data required to bootstrap the ERP system

-- Insert default roles (ID will be generated automatically)
INSERT INTO roles (name, description) VALUES
    ('Super Admin', 'Full access to all system modules'),
    ('Admin', 'Administrative access to most modules'),
    ('Manager', 'Management access to assigned branches'),
    ('Accountant', 'Access to financial and accounting modules'),
    ('Sales Staff', 'Access to sales and CRM modules'),
    ('Inventory Manager', 'Access to inventory and procurement modules'),
    ('HR Manager', 'Access to employee and payroll modules')
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, description, module) VALUES
    ('manage_users', 'Create, update, delete users', 'Admin'),
    ('manage_roles', 'Create, update, delete roles and permissions', 'Admin'),
    ('manage_branches', 'Create, update, delete branches', 'Admin'),
    
    ('view_dashboard', 'View main dashboard and KPIs', 'Dashboard'),
    
    ('manage_inventory', 'Full access to inventory management', 'Inventory'),
    ('view_inventory', 'Read-only access to inventory', 'Inventory'),
    
    ('create_sales', 'Create sales orders and invoices', 'Sales'),
    ('view_sales', 'View sales records', 'Sales'),
    
    ('create_purchases', 'Create purchase orders', 'Purchases'),
    ('view_purchases', 'View purchase records', 'Purchases'),
    
    ('manage_accounting', 'Full access to accounting', 'Accounting'),
    ('view_accounting', 'View financial records', 'Accounting'),
    
    ('manage_employees', 'Manage employee records and payroll', 'HR'),
    ('view_employees', 'View employee directory', 'HR'),
    
    ('view_reports', 'Access system reports and analytics', 'Reports')
ON CONFLICT (name) DO NOTHING;

-- Assign all permissions to Super Admin role
DO $$
DECLARE
    super_admin_id UUID;
BEGIN
    SELECT id INTO super_admin_id FROM roles WHERE name = 'Super Admin';
    
    IF super_admin_id IS NOT NULL THEN
        INSERT INTO role_permissions (role_id, permission_id)
        SELECT super_admin_id, id FROM permissions
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- Insert a default branch
INSERT INTO branches (name, address, email) 
SELECT 'Headquarters', '123 Business Avenue, Tech District', 'hq@company.com'
WHERE NOT EXISTS (SELECT 1 FROM branches WHERE name = 'Headquarters');

-- Note: The default Super Admin user should be created programmatically 
-- (via a setup script) so the password can be properly hashed with bcrypt.
-- We do not hardcode plaintext or pre-hashed passwords in SQL seeding.
