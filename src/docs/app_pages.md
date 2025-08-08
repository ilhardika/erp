# 📄 Page List for Bizflow ERP + POS App (Unified Dashboard Layout)

## 📂 Main Page Structure by Role (Shared `/dashboard` Layout)

### 1. Auth Pages

- `/login` – User login page
- `/register` – User registration (admin-only access)
- `/forgot-password` – Password reset request page

---

### 2. Dashboard Pages

#### 💳 POS

- `/dashboard/pos` – POS main interface
- `/dashboard/pos/scan` – Scan or manually input barcode
- `/dashboard/pos/cart` – Cart summary page
- `/dashboard/pos/payment` – Manual payment processing
- `/dashboard/pos/history` – Transaction history
- `/dashboard/pos/refund/:id` – Process refund for a specific transaction
- `/dashboard/pos/shift` – Open and close cashier shift

#### 📆 Sales

- `/dashboard/sales` – Sales order datatable (main interface)
- `/dashboard/sales/create` – Create new sales order
- `/dashboard/sales/:id` – View sales order detail
- `/dashboard/sales/:id/edit` – Edit sales order

#### 📅 Purchasing

- `/dashboard/purchases/` – Purchase orders datatable
- `/dashboard/purchases/create` – Create new purchase order
- `/dashboard/purchases/:id` – View purchase order detail
- `/dashboard/purchases/:id/edit` – Edit purchase order

#### 🏢 Inventory Management

- `/dashboard/products` – Product list
- `/dashboard/products/create` – Add new product
- `/dashboard/products/:id/edit` – Edit existing product
- `/dashboard/inventory/stock-opname` – Stock opname (inventory checking)
- `/dashboard/inventory/mutation` – Stock transfer between warehouses

#### 👥 Customers & Suppliers

- `/dashboard/customers` – Customer list
- `/dashboard/customers/create` – Add new customer
- `/dashboard/suppliers` – Supplier list
- `/dashboard/suppliers/create` – Add new supplier

#### 🎁 Promotions

- `/dashboard/promotions` – List of active promotions
- `/dashboard/promotions/create` – Create new promotion

#### 👩‍💼 HR / Employee Management

- `/dashboard/employees` – Employee directory
- `/dashboard/employees/create` – Add new employee
- `/dashboard/attendance` – Manual attendance form
- `/dashboard/payroll` – Monthly payroll slips

#### 💰 Finance

- `/dashboard/finance/transactions` – Cash in/out transactions
- `/dashboard/finance/journal` – Manual journal entries
- `/dashboard/finance/balance-sheet` – Balance sheet report
- `/dashboard/finance/profit-loss` – Profit & loss report

#### 📊 Reports & Analytics

- `/dashboard/reports/sales` – Sales performance report
- `/dashboard/reports/products` – Product performance report
- `/dashboard/reports/stock` – Stock summary report
- `/dashboard/reports/salesman` – Salesperson performance report
- `/dashboard/reports/finance` – Financial summary report

#### ⚙️ Settings

- `/dashboard/settings/users` – User and role management
- `/dashboard/settings/company` – Company profile settings
- `/dashboard/settings/permissions` – Role-based module access control
- `/dashboard/settings/backup` – Manual data backup & restore

---

### 3. General Pages

- `/dashboard` – Main dashboard homepage
- `/404` – Page not found
- `/maintenance` – System maintenance notification page
