-- Reset Purchase Orders Data and Create Proper Schema
-- WARNING: This will delete ALL purchase data!

-- 1. Delete all purchase order data
TRUNCATE TABLE purchase_order_items CASCADE;
TRUNCATE TABLE purchase_orders RESTART IDENTITY CASCADE;

-- 2. Update purchase_orders table schema for proper workflow
ALTER TABLE purchase_orders 
DROP COLUMN IF EXISTS payment_status,
DROP COLUMN IF EXISTS approved_by,
DROP COLUMN IF EXISTS approved_at;

-- Add proper workflow columns
ALTER TABLE purchase_orders 
ADD COLUMN IF NOT EXISTS purchaser_id INTEGER REFERENCES users(id),
ADD COLUMN IF NOT EXISTS shipping_address TEXT,
ADD COLUMN IF NOT EXISTS terms_conditions TEXT,
ADD COLUMN IF NOT EXISTS discount_percentage DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_percentage DECIMAL(5,2) DEFAULT 11;

-- 3. Insert sample suppliers if not exists
INSERT INTO suppliers (name, code, email, phone, address, contact_person, created_at, updated_at) 
VALUES 
  ('PT Supplier Utama', 'SUP001', 'admin@supplierutama.com', '021-12345678', 'Jl. Sudirman No. 1, Jakarta', 'John Doe', NOW(), NOW()),
  ('CV Mitra Sejahtera', 'SUP002', 'info@mitrasejahtera.com', '021-87654321', 'Jl. Thamrin No. 10, Jakarta', 'Jane Smith', NOW(), NOW()),
  ('Toko Berkah Jaya', 'SUP003', 'berkah@email.com', '021-11223344', 'Jl. Gatot Subroto No. 5, Jakarta', 'Ahmad Rahman', NOW(), NOW())
ON CONFLICT (code) DO NOTHING;

-- 4. Insert sample purchase orders with proper status workflow
INSERT INTO purchase_orders (
  order_number, supplier_id, purchaser_id, order_date, expected_date, 
  status, subtotal, discount_amount, discount_percentage, tax_amount, tax_percentage,
  shipping_cost, total_amount, notes, shipping_address, terms_conditions,
  created_by, created_at, updated_at
) VALUES
  (
    'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-001',
    (SELECT id FROM suppliers WHERE code = 'SUP001' LIMIT 1),
    (SELECT id FROM users WHERE role IN ('admin', 'warehouse') LIMIT 1),
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '7 days',
    'draft',
    5000000, 250000, 5.00, 522500, 11.00,
    100000, 5372500,
    'Purchase order untuk stok bulan ini',
    'Gudang Utama, Jl. Industri No. 15, Jakarta',
    'Pembayaran 30 hari setelah barang diterima',
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    NOW(), NOW()
  ),
  (
    'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-002', 
    (SELECT id FROM suppliers WHERE code = 'SUP002' LIMIT 1),
    (SELECT id FROM users WHERE role IN ('admin', 'warehouse') LIMIT 1),
    CURRENT_DATE - INTERVAL '3 days',
    CURRENT_DATE + INTERVAL '4 days',
    'confirmed',
    3000000, 0, 0.00, 330000, 11.00,
    50000, 3380000,
    'Order urgent untuk restock',
    'Gudang Cabang, Jl. Margonda No. 20, Depok',
    'Cash on delivery',
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    NOW() - INTERVAL '3 days', NOW()
  ),
  (
    'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-003',
    (SELECT id FROM suppliers WHERE code = 'SUP003' LIMIT 1), 
    (SELECT id FROM users WHERE role IN ('admin', 'warehouse') LIMIT 1),
    CURRENT_DATE - INTERVAL '7 days',
    CURRENT_DATE - INTERVAL '1 days',
    'processing',
    2500000, 125000, 5.00, 261250, 11.00,
    75000, 2711250,
    'Order rutin mingguan',
    'Gudang Utama, Jl. Industri No. 15, Jakarta',
    'Pembayaran transfer 14 hari',
    (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
    NOW() - INTERVAL '7 days', NOW()
  );

-- 5. Insert sample purchase order items
INSERT INTO purchase_order_items (
  po_id, product_id, quantity, unit_cost, discount_amount, discount_percentage, total_cost, notes
) 
SELECT 
  po.id,
  p.id,
  CASE 
    WHEN p.category = 'Electronics' THEN 10
    WHEN p.category = 'Clothing' THEN 50  
    WHEN p.category = 'Food' THEN 100
    ELSE 25
  END as quantity,
  CASE 
    WHEN p.category = 'Electronics' THEN 500000
    WHEN p.category = 'Clothing' THEN 50000
    WHEN p.category = 'Food' THEN 25000  
    ELSE 100000
  END as unit_cost,
  0 as discount_amount,
  0 as discount_percentage,
  CASE 
    WHEN p.category = 'Electronics' THEN 10 * 500000
    WHEN p.category = 'Clothing' THEN 50 * 50000
    WHEN p.category = 'Food' THEN 100 * 25000
    ELSE 25 * 100000
  END as total_cost,
  'Item for PO ' || po.order_number
FROM purchase_orders po
CROSS JOIN (
  SELECT * FROM products ORDER BY RANDOM() LIMIT 2
) p
WHERE po.id IN (SELECT id FROM purchase_orders LIMIT 3);

-- 6. Update purchase orders totals based on items
UPDATE purchase_orders 
SET 
  subtotal = (
    SELECT COALESCE(SUM(total_cost), 0) 
    FROM purchase_order_items 
    WHERE po_id = purchase_orders.id
  ),
  total_amount = (
    SELECT 
      COALESCE(SUM(total_cost), 0) + 
      COALESCE(purchase_orders.shipping_cost, 0) + 
      (COALESCE(SUM(total_cost), 0) * COALESCE(purchase_orders.tax_percentage, 0) / 100) -
      COALESCE(purchase_orders.discount_amount, 0)
    FROM purchase_order_items 
    WHERE po_id = purchase_orders.id
  ),
  tax_amount = (
    SELECT 
      COALESCE(SUM(total_cost), 0) * COALESCE(purchase_orders.tax_percentage, 0) / 100
    FROM purchase_order_items 
    WHERE po_id = purchase_orders.id
  );

-- 7. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_po ON purchase_order_items(po_id);

-- Show results
SELECT 'Purchase Orders Created' as result, COUNT(*) as count FROM purchase_orders
UNION ALL
SELECT 'Purchase Order Items Created' as result, COUNT(*) as count FROM purchase_order_items;
