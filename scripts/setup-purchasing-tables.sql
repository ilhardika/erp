-- 🏗️ Purchasing Module Database Schema
-- Sesuai dengan app_blueprint.md requirements

-- 1. Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    contact_person VARCHAR(255),
    payment_terms VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id SERIAL PRIMARY KEY,
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id INTEGER REFERENCES suppliers(id),
    order_date DATE NOT NULL,
    expected_delivery_date DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, pending_approval, approved, received, cancelled
    subtotal DECIMAL(15,2) DEFAULT 0,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    tax_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    terms_conditions TEXT,
    approved_by INTEGER REFERENCES users(id),
    approved_at TIMESTAMP,
    created_by INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Purchase Order Items Table
CREATE TABLE IF NOT EXISTS purchase_order_items (
    id SERIAL PRIMARY KEY,
    po_id INTEGER REFERENCES purchase_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES products(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    discount_amount DECIMAL(15,2) DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Goods Receipts Table (untuk receive goods)
CREATE TABLE IF NOT EXISTS goods_receipts (
    id SERIAL PRIMARY KEY,
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    po_id INTEGER REFERENCES purchase_orders(id),
    supplier_id INTEGER REFERENCES suppliers(id),
    receipt_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed
    total_received_amount DECIMAL(15,2) DEFAULT 0,
    notes TEXT,
    received_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Goods Receipt Items Table
CREATE TABLE IF NOT EXISTS goods_receipt_items (
    id SERIAL PRIMARY KEY,
    receipt_id INTEGER REFERENCES goods_receipts(id) ON DELETE CASCADE,
    po_item_id INTEGER REFERENCES purchase_order_items(id),
    product_id INTEGER REFERENCES products(id),
    ordered_quantity INTEGER NOT NULL,
    received_quantity INTEGER NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    total_amount DECIMAL(15,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON purchase_order_items(po_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipts_po ON goods_receipts(po_id);
CREATE INDEX IF NOT EXISTS idx_goods_receipt_items_receipt ON goods_receipt_items(receipt_id);

-- Sample data untuk testing
INSERT INTO suppliers (name, email, phone, contact_person, payment_terms) VALUES
('PT Supplier Jaya', 'supplier1@email.com', '081234567890', 'John Doe', '30 days'),
('CV Maju Mundur', 'supplier2@email.com', '081234567891', 'Jane Smith', '14 days'),
('UD Berkah', 'supplier3@email.com', '081234567892', 'Bob Wilson', '7 days')
ON CONFLICT DO NOTHING;
