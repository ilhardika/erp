-- =====================================
-- BIZFLOW ERP + POS DATABASE SCHEMA
-- =====================================
-- Created: August 6, 2025
-- Database: PostgreSQL (Neon)
-- Support: All modules from docs (POS, Sales, Inventory, HR, Finance, etc.)

-- =====================================
-- 1. AUTHENTICATION & USER MANAGEMENT
-- =====================================

-- Roles table for role-based access control
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB, -- Store permissions as JSON
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Users table for authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INTEGER REFERENCES roles(id),
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 2. COMPANY & SETTINGS
-- =====================================

-- Company profile settings
CREATE TABLE company_settings (
    id SERIAL PRIMARY KEY,
    company_name VARCHAR(200) NOT NULL,
    company_address TEXT,
    company_phone VARCHAR(20),
    company_email VARCHAR(100),
    tax_id VARCHAR(50),
    logo_url VARCHAR(255),
    currency VARCHAR(10) DEFAULT 'IDR',
    timezone VARCHAR(50) DEFAULT 'Asia/Jakarta',
    settings JSONB, -- Additional settings as JSON
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 3. CUSTOMERS & SUPPLIERS
-- =====================================

-- Customers table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    customer_type VARCHAR(20) DEFAULT 'retail', -- retail, wholesale, corporate
    credit_limit DECIMAL(15,2) DEFAULT 0,
    payment_terms INTEGER DEFAULT 0, -- days
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Suppliers table  
CREATE TABLE suppliers (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    tax_id VARCHAR(50),
    supplier_type VARCHAR(20) DEFAULT 'material', -- material, service, goods, equipment
    payment_terms INTEGER DEFAULT 0, -- days
    credit_limit DECIMAL(15,2) DEFAULT 0,
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    account_holder VARCHAR(200),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 4. PRODUCT & INVENTORY MANAGEMENT
-- =====================================

-- Product categories
CREATE TABLE product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id INTEGER REFERENCES product_categories(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Products table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    barcode VARCHAR(100),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES product_categories(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    cost_price DECIMAL(15,2) DEFAULT 0,
    selling_price DECIMAL(15,2) NOT NULL,
    wholesale_price DECIMAL(15,2),
    unit VARCHAR(20) DEFAULT 'pcs', -- pcs, kg, liter, etc.
    min_stock INTEGER DEFAULT 0,
    max_stock INTEGER,
    reorder_point INTEGER DEFAULT 0,
    weight DECIMAL(10,3),
    dimensions VARCHAR(50), -- LxWxH
    tax_rate DECIMAL(5,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    is_trackable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Warehouses/locations
CREATE TABLE warehouses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    address TEXT,
    manager_id INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Product stock by warehouse
CREATE TABLE product_stocks (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0, -- for pending orders
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(product_id, warehouse_id)
);

-- Stock movements/mutations
CREATE TABLE stock_movements (
    id SERIAL PRIMARY KEY,
    product_id INTEGER REFERENCES products(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    movement_type VARCHAR(20) NOT NULL, -- in, out, transfer, adjustment, opname
    quantity INTEGER NOT NULL,
    reference_type VARCHAR(50), -- purchase, sale, transfer, adjustment
    reference_id INTEGER,
    notes TEXT,
    performed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stock opname (inventory checking)
CREATE TABLE stock_opnames (
    id SERIAL PRIMARY KEY,
    opname_number VARCHAR(20) UNIQUE NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(id),
    status VARCHAR(20) DEFAULT 'draft', -- draft, in_progress, completed
    notes TEXT,
    performed_by INTEGER REFERENCES users(id),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Stock opname details
CREATE TABLE stock_opname_details (
    id SERIAL PRIMARY KEY,
    opname_id INTEGER REFERENCES stock_opnames(id),
    product_id INTEGER REFERENCES products(id),
    system_quantity INTEGER DEFAULT 0,
    actual_quantity INTEGER DEFAULT 0,
    difference INTEGER DEFAULT 0,
    notes TEXT
);

-- =====================================
-- 5. SALES & ORDERS
-- =====================================

-- Sales orders
CREATE TABLE sales_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(20) UNIQUE NOT NULL,
    customer_id INTEGER REFERENCES customers(id),
    salesperson_id INTEGER REFERENCES users(id),
    order_date TIMESTAMP DEFAULT NOW(),
    required_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, shipped, completed, cancelled
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    shipping_cost DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, partial, paid
    payment_terms INTEGER DEFAULT 0,
    due_date TIMESTAMP,
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Sales order details
CREATE TABLE sales_order_details (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES sales_orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL
);

-- =====================================
-- 6. PURCHASING
-- =====================================

-- Purchase orders
CREATE TABLE purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(20) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    order_date TIMESTAMP DEFAULT NOW(),
    expected_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, received, completed, cancelled
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    payment_status VARCHAR(20) DEFAULT 'unpaid',
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Purchase order details
CREATE TABLE purchase_order_details (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    received_quantity INTEGER DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL
);

-- Goods receiving
CREATE TABLE goods_receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(20) UNIQUE NOT NULL,
    po_id INTEGER REFERENCES purchase_orders(id),
    warehouse_id INTEGER REFERENCES warehouses(id),
    receipt_date TIMESTAMP DEFAULT NOW(),
    supplier_invoice VARCHAR(50),
    notes TEXT,
    received_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Goods receipt details
CREATE TABLE goods_receipt_details (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES goods_receipts(id),
    product_id INTEGER REFERENCES products(id),
    quantity_received INTEGER NOT NULL,
    unit_cost DECIMAL(15,2) NOT NULL,
    expiry_date DATE,
    batch_number VARCHAR(50)
);

-- =====================================
-- 7. POS TRANSACTIONS
-- =====================================

-- Cashier shifts
CREATE TABLE cashier_shifts (
    id SERIAL PRIMARY KEY,
    shift_number VARCHAR(20) UNIQUE NOT NULL,
    cashier_id INTEGER REFERENCES users(id),
    opened_at TIMESTAMP DEFAULT NOW(),
    closed_at TIMESTAMP,
    opening_balance DECIMAL(15,2) DEFAULT 0,
    closing_balance DECIMAL(15,2) DEFAULT 0,
    total_sales DECIMAL(15,2) DEFAULT 0,
    total_cash DECIMAL(15,2) DEFAULT 0,
    total_non_cash DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'open' -- open, closed
);

-- POS transactions
CREATE TABLE pos_transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(20) UNIQUE NOT NULL,
    shift_id INTEGER REFERENCES cashier_shifts(id),
    customer_id INTEGER REFERENCES customers(id),
    cashier_id INTEGER REFERENCES users(id),
    transaction_date TIMESTAMP DEFAULT NOW(),
    subtotal DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    payment_method VARCHAR(20) DEFAULT 'cash', -- cash, transfer, qr, card
    amount_paid DECIMAL(15,2) DEFAULT 0,
    change_amount DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'completed', -- completed, refunded, cancelled
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- POS transaction details
CREATE TABLE pos_transaction_details (
    id SERIAL PRIMARY KEY,
    transaction_id INTEGER REFERENCES pos_transactions(id),
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_percent DECIMAL(5,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    line_total DECIMAL(15,2) NOT NULL
);

-- Refunds
CREATE TABLE refunds (
    id SERIAL PRIMARY KEY,
    refund_number VARCHAR(20) UNIQUE NOT NULL,
    original_transaction_id INTEGER REFERENCES pos_transactions(id),
    refund_amount DECIMAL(15,2) NOT NULL,
    refund_method VARCHAR(20) DEFAULT 'cash',
    reason TEXT,
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 8. PROMOTIONS & DISCOUNTS
-- =====================================

-- Promotions
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL, -- percentage, nominal, buy_x_get_y
    value DECIMAL(10,2), -- percentage or nominal value
    min_purchase DECIMAL(15,2) DEFAULT 0,
    max_discount DECIMAL(15,2),
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    usage_limit INTEGER,
    used_count INTEGER DEFAULT 0,
    applicable_to VARCHAR(20) DEFAULT 'all', -- all, specific_products, specific_categories
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Promotion products (for specific product promotions)
CREATE TABLE promotion_products (
    id SERIAL PRIMARY KEY,
    promotion_id INTEGER REFERENCES promotions(id),
    product_id INTEGER REFERENCES products(id),
    UNIQUE(promotion_id, product_id)
);

-- =====================================
-- 9. EMPLOYEES & HR
-- =====================================

-- Employees (extends users table)
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    employee_number VARCHAR(20) UNIQUE NOT NULL,
    department VARCHAR(50),
    position VARCHAR(100),
    hire_date DATE,
    salary DECIMAL(15,2),
    commission_rate DECIMAL(5,2) DEFAULT 0,
    bank_account VARCHAR(50),
    bank_name VARCHAR(100),
    emergency_contact VARCHAR(200),
    emergency_phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    postal_code VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Attendance records
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    attendance_date DATE NOT NULL,
    check_in TIMESTAMP,
    check_out TIMESTAMP,
    break_start TIMESTAMP,
    break_end TIMESTAMP,
    total_hours DECIMAL(4,2) DEFAULT 0,
    overtime_hours DECIMAL(4,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'present', -- present, absent, late, sick, vacation
    notes TEXT,
    recorded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(employee_id, attendance_date)
);

-- Payroll records
CREATE TABLE payroll (
    id SERIAL PRIMARY KEY,
    employee_id INTEGER REFERENCES employees(id),
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(15,2) DEFAULT 0,
    overtime_pay DECIMAL(15,2) DEFAULT 0,
    commission DECIMAL(15,2) DEFAULT 0,
    allowances DECIMAL(15,2) DEFAULT 0,
    deductions DECIMAL(15,2) DEFAULT 0,
    gross_pay DECIMAL(15,2) DEFAULT 0,
    tax DECIMAL(15,2) DEFAULT 0,
    net_pay DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft', -- draft, approved, paid
    processed_by INTEGER REFERENCES users(id),
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 10. FINANCE & ACCOUNTING
-- =====================================

-- Chart of accounts
CREATE TABLE accounts (
    id SERIAL PRIMARY KEY,
    account_code VARCHAR(20) UNIQUE NOT NULL,
    account_name VARCHAR(200) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- asset, liability, equity, revenue, expense
    parent_id INTEGER REFERENCES accounts(id),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Journal entries
CREATE TABLE journal_entries (
    id SERIAL PRIMARY KEY,
    entry_number VARCHAR(20) UNIQUE NOT NULL,
    entry_date DATE NOT NULL,
    description TEXT,
    reference_type VARCHAR(50), -- sale, purchase, payment, manual
    reference_id INTEGER,
    total_debit DECIMAL(15,2) DEFAULT 0,
    total_credit DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(20) DEFAULT 'posted', -- draft, posted
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Journal entry details
CREATE TABLE journal_entry_details (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES journal_entries(id),
    account_id INTEGER REFERENCES accounts(id),
    debit_amount DECIMAL(15,2) DEFAULT 0,
    credit_amount DECIMAL(15,2) DEFAULT 0,
    description TEXT
);

-- Cash transactions
CREATE TABLE cash_transactions (
    id SERIAL PRIMARY KEY,
    transaction_number VARCHAR(20) UNIQUE NOT NULL,
    transaction_date TIMESTAMP DEFAULT NOW(),
    type VARCHAR(20) NOT NULL, -- cash_in, cash_out
    amount DECIMAL(15,2) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    account_id INTEGER REFERENCES accounts(id),
    reference_type VARCHAR(50),
    reference_id INTEGER,
    processed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 11. VEHICLES (FOR DELIVERY/SALES)
-- =====================================

-- Vehicles
CREATE TABLE vehicles (
    id SERIAL PRIMARY KEY,
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(50), -- truck, motorcycle, car
    brand VARCHAR(50),
    model VARCHAR(50),
    year INTEGER,
    fuel_type VARCHAR(20) DEFAULT 'gasoline',
    driver_id INTEGER REFERENCES employees(id),
    status VARCHAR(20) DEFAULT 'active', -- active, maintenance, inactive
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Vehicle usage/assignments
CREATE TABLE vehicle_assignments (
    id SERIAL PRIMARY KEY,
    vehicle_id INTEGER REFERENCES vehicles(id),
    driver_id INTEGER REFERENCES employees(id),
    assigned_date DATE NOT NULL,
    purpose VARCHAR(100), -- delivery, sales_visit, pickup
    start_mileage INTEGER,
    end_mileage INTEGER,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'ongoing', -- ongoing, completed
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 12. SYSTEM AUDIT & LOGS
-- =====================================

-- Activity logs
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Data backups
CREATE TABLE data_backups (
    id SERIAL PRIMARY KEY,
    backup_name VARCHAR(200) NOT NULL,
    backup_type VARCHAR(50) DEFAULT 'manual', -- manual, scheduled
    file_path VARCHAR(500),
    file_size BIGINT,
    status VARCHAR(20) DEFAULT 'completed', -- in_progress, completed, failed
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- INDEXES FOR PERFORMANCE
-- =====================================

-- User authentication
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);

-- Products and inventory
CREATE INDEX idx_products_code ON products(code);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_product_stocks_product_warehouse ON product_stocks(product_id, warehouse_id);

-- Transactions
CREATE INDEX idx_pos_transactions_date ON pos_transactions(transaction_date);
CREATE INDEX idx_pos_transactions_cashier ON pos_transactions(cashier_id);
CREATE INDEX idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);

-- Financial
CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
CREATE INDEX idx_cash_transactions_date ON cash_transactions(transaction_date);

-- Activity logs
CREATE INDEX idx_activity_logs_user_date ON activity_logs(user_id, created_at);

-- =====================================
-- INITIAL DATA SETUP
-- =====================================

-- Default roles
INSERT INTO roles (name, display_name, description, permissions) VALUES
('admin', 'Administrator', 'Full system access', '{"all": true}'),
('cashier', 'Kasir', 'POS and basic sales access', '{"pos": true, "customers": "read"}'),
('warehouse', 'Staff Gudang', 'Inventory management access', '{"inventory": true, "products": true}'),
('sales', 'Sales Staff', 'Sales order management', '{"sales": true, "customers": true}'),
('hr', 'HR Staff', 'Employee and payroll management', '{"hr": true, "employees": true}'),
('accountant', 'Akuntan', 'Financial management access', '{"finance": true, "reports": true}');

-- Default admin user (password: admin123)
INSERT INTO users (username, email, password_hash, role_id, full_name) VALUES
('admin', 'admin@bizflow.com', '$2b$10$rQJ8QLxRlZoMxHNOPqYfgOhGqMDFZy2lx7LF6rOtV3vwkxWpD8K7q', 1, 'System Administrator');

-- Default warehouse
INSERT INTO warehouses (code, name, address) VALUES
('WH001', 'Gudang Utama', 'Jl. Industri No. 123, Jakarta');

-- Basic chart of accounts
INSERT INTO accounts (account_code, account_name, account_type) VALUES
('1000', 'Kas', 'asset'),
('1100', 'Bank', 'asset'),
('1200', 'Piutang Dagang', 'asset'),
('1300', 'Persediaan', 'asset'),
('2000', 'Hutang Dagang', 'liability'),
('3000', 'Modal', 'equity'),
('4000', 'Penjualan', 'revenue'),
('5000', 'Harga Pokok Penjualan', 'expense'),
('6000', 'Biaya Operasional', 'expense');

-- Default company settings
INSERT INTO company_settings (company_name, currency, timezone) VALUES
('Bizflow Company', 'IDR', 'Asia/Jakarta');
