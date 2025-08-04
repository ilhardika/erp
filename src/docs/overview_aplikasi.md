**ERP + POS System Blueprint (Next.js, Tailwind CSS, shadcn/ui, Neon PostgreSQL)**

---

## 🧱 Tech Stack (Final)

- **Frontend**: Next.js (App Router, JavaScript), Tailwind CSS, shadcn/ui, Lucide Icons, DataTables, Mobile-first responsive design
- **Backend**: Next.js API Routes (modular REST)
- **Database**: Neon PostgreSQL (Serverless)
- **Auth**: Custom authentication using database credentials
- **UI**: Unified dashboard layout for all roles

---

## 🤝 Roles & Access

### 1. 🧑‍💼 Admin (Owner)

- Full access to all modules and features
- Manage users and roles
- Approve SO and purchases
- View all reports: finance, sales, inventory, HR
- Configure system settings & perform manual backup

### 2. 🧾 Cashier

- Access POS module, transaction history, open/close cashier
- Process manual payments (cash, transfer)
- Add products to cart & apply discounts
- Print invoice as PDF
- Handle transaction refunds

### 3. 📦 Warehouse Staff

- Manage product data
- Buffer stock & inter-warehouse transfers
- Stock opname & product write-offs
- Handle inbound goods from purchases

### 4. 🚗 Sales Staff

- Input customer sales orders
- View customer history
- Track commission and performance

### 5. 🧑‍🎓 HR

- Manage employee data and role permissions
- Manual attendance input
- Generate monthly salary slips

### 6. 💰 Accountant

- Input journal entries and cash transactions
- General ledger, profit/loss, and balance sheet reports
- Periodic financial summaries

---

## 🔄 Unified Dashboard System Flow

All roles log in through **`/dashboard`**, and modules are displayed dynamically based on their access level.

- Role-based layout filtering via session middleware
- UI components are hidden if access is not granted
- No separate dashboards per role — all in one

---

## 📆 Modules & Features (From Excel Blueprint)

### 🛒 POS (Cashier)

- Add items to cart (manual barcode input)
- Apply discounts & totals
- Manual payment (cash, transfer, simulated QR)
- Invoice generation (PDF download)
- Refund support
- Daily cashier open/close shift

### 📈 Sales & Purchasing

- Create sales orders (SO)
- Admin approval for purchases
- Receive goods into inventory
- Generate invoices and receipts
- Sales analysis by period or salesperson

### 🏭 Inventory / Warehouse

- Manage products and stock levels
- Buffer stock zones and inter-location transfers
- Manual stock opname
- View mutation and adjustment history

### 👥 Customers & Suppliers

- Customer segmentation
- Add/edit customer or supplier info
- Purchase and payment history

### 🎁 Promotions

- Tiered or nominal discount management
- Bundling promotions (e.g. buy X get Y)
- Set promo duration and terms

### 🧑‍💼 HR / Employee Management

- Create and update employee records
- Manual attendance form
- Static/manual salary slip generator

### 💳 Finance

- Record cash in/out transactions
- Manual journal entry
- View general ledger
- Generate financial reports (balance sheet, P&L)

### 🚚 Vehicles

- Manage vehicles and license plates
- Link to delivery or field sales tasks

### 🧑‍💼 Salesman

- Track commissions
- View top products sold
- View top recurring customers

---

## ❌ Skipped Third-Party Integrations (Simulated Manually)

These integrations are not implemented via API but handled manually:

- ❌ Barcode scanning → manual input field
- ❌ Thermal printing → PDF invoice
- ❌ Payment gateway → manual payment method selector
- ❌ WhatsApp/SMS → copy-paste invoice link manually
- ❌ Email → download and send manually
- ❌ File uploads → local file handling only
- ❌ Real-time WebSocket → use polling method
- ❌ Tax API → manual input for tax values

---

## 🧬 System Architecture Overview (Unified Dashboard)

### Frontend

- Next.js App Router using `/dashboard` layout
- All users share one dashboard layout, dynamically filtered per role
- UI built with shadcn/ui components
- Tables rendered using DataTables

### Backend

- Modular API routes under `/api/*`
- Custom auth with login endpoint checking user from DB
- Middleware for role-based protection

### Database

- Neon PostgreSQL, table-based schema:
  - `users`, `roles`, `products`, `orders`, `transactions`, `attendance`, `vehicles`, etc.

---

This blueprint is the foundation for building **Bizflow** — a scalable, clean, and role-aware ERP + POS web app using modern frontend and backend architecture, all served through a single unified dashboard.
