# Daftar Halaman dalam Aplikasi ERP + POS - BizFlow

_React + Next.js + JavaScript + Tailwind + MongoDB_

## 📂 Struktur Halaman Utama Berdasarkan Role

### 1. Auth (Semua Role)

- `/login` – Halaman masuk pengguna (Clerk/NextAuth)
- `/register` – Pendaftaran pengguna baru (khusus Admin)
- `/forgot-password` – Lupa password dan reset

### 2. Layout POS (Kasir) - Phase 1 Priority

- `/pos` – Tampilan utama kasir (search produk + cart)
- `/pos/history` – Riwayat transaksi harian
- ~~`/pos/scan`~~ – (skip - butuh camera API untuk barcode scanning)
- ~~`/pos/cart`~~ – (merge ke `/pos`)
- ~~`/pos/payment`~~ – (merge ke `/pos` - cash only)
- `/pos/refund/:id` – Refund/void transaksi (manual process)
- `/pos/shift` – Shift kasir & closing (manual input)

### 3. Layout Dashboard (Admin / Staff)

#### 📊 Dashboard - Phase 2

- `/dashboard` – Basic metrics: total sales, products, transactions

#### 🧾 Transaksi - Phase 2

- `/transactions` – History semua transaksi POS
- `/sales/orders` – Manual sales orders (input manual)
- `/sales/create` – Create manual sales (tanpa POS)
- `/purchases/invoices` – Purchase invoices (input manual)
- `/purchases/receive` – Receive stock (manual entry)

#### 🏪 Gudang - Phase 1 Priority

- `/products` – Manajemen produk (enhance existing CRUD)
- `/products/create` – Tambah produk baru (with categories)
- `/products/:id/edit` – Edit produk
- `/categories` – Manajemen categories (simple CRUD)
- `/inventory/stock-opname` – Stock opname manual (count & adjust)
- `/inventory/mutation` – Stock mutations/transfers manual

#### 👥 Pelanggan & Supplier - Phase 2

- `/customers` – Customer management (manual input data)
- `/customers/create` – Add new customer
- `/customers/:id/edit` – Edit customer
- `/suppliers` – Supplier management (manual input)
- `/suppliers/create` – Add new supplier
- `/suppliers/:id/edit` – Edit supplier

#### 🎁 Promo & Diskon - Phase 3

- `/promotions` – Promotions management (manual setup)
- `/promotions/create` – Create promotion (percentage/amount)
- `/discounts` – Discount management

#### 🧑‍🎓 Karyawan / SDM - Phase 3

- `/employees` – Employee management (manual input)
- `/employees/create` – Add employee
- `/attendance` – Manual attendance tracking
- `/payroll` – Simple payroll calculation (manual)

#### 💳 Keuangan - Phase 3

- `/finance/transactions` – Manual financial transactions
- `/finance/expenses` – Expense tracking (manual input)
- `/finance/journal` – Simple accounting journal

#### 🌟 Laporan & Analitik - Phase 3

- `/reports/sales` – Sales reports (date range, manual filter)
- `/reports/products` – Product performance reports
- `/reports/stock` – Stock level reports
- `/reports/financial` – Basic financial reports
- `/reports/export` – Export to PDF/Excel (library: xlsx, react-to-print)
- `/reports/charts` – Charts & graphs (library: Chart.js atau Recharts)

### 4. Admin Settings

- `/settings/users` – Kelola akun pengguna & role
- `/settings/company` – Informasi & logo perusahaan
- `/settings/permissions` – Pengaturan hak akses per modul
- `/settings/backup` – Backup & restore data

### 5. Error & Utility

- `/404` – Halaman tidak ditemukan
- `/maintenance` – Halaman maintenance saat sistem update

## 🔧 Catatan Teknis (JavaScript Approach)

- **Phase 1**: Single layout (admin layout untuk semua)
- **Phase 2**: Dedicated POS layout (mobile-first)
- Authentication dengan Clerk (basic setup)
- Protected routes dengan middleware sederhana
- **App Router Next.js** dengan JavaScript (.js files)
- **No TypeScript** - pure JavaScript untuk simplicity
- **No third party dependencies** untuk core functionality

## 📋 Development Priority

### Phase 1 (Immediate - 2-3 weeks):

- ✅ Authentication setup (Clerk)
- ✅ Enhanced products management
- ✅ Categories management
- ✅ Basic POS interface
- ✅ Stock opname manual
- ✅ Stock mutations

### Phase 2 (Short term - 2-3 weeks):

- ✅ Transaction management & history
- ✅ Manual sales orders
- ✅ Purchase management (manual input)
- ✅ Customer & supplier management
- ✅ Basic dashboard with metrics

### Phase 3 (Medium term - 3-4 weeks):

- ✅ Employee management
- ✅ Attendance tracking (manual)
- ✅ Promotions & discounts
- ✅ Financial tracking
- ✅ Comprehensive reporting

### ❌ **Yang Benar-benar Di-skip (Third Party Dependencies):**

- ❌ Barcode scanning (camera API) - skip dulu
- ❌ Thermal printing (printer integration) - skip dulu
- ❌ Payment gateways (QRIS, credit card) - skip dulu
- ❌ WhatsApp/SMS integration - skip dulu
- ❌ Email services (SMTP) - skip dulu
- ❌ File upload to cloud storage - skip dulu
- ❌ Real-time notifications (WebSocket) - skip dulu, pakai polling/toast
- ❌ Advanced authentication (2FA, OAuth) - skip dulu
- ❌ Inventory auto-reorder (supplier API) - skip dulu
- ❌ Shipping/logistics API - skip dulu
- ❌ Government tax API integration - skip dulu, bikin manual

### ✅ **Yang Bisa Dibuat dengan Library Simple:**

- ✅ PDF/Excel export (react-to-print, xlsx library)
- ✅ Chart/graph (Chart.js, Recharts)
- ✅ Toast notifications (shadcn toast - bisa di-close)
- ✅ Image handling (local storage + preview)
- ✅ Date/time picker (react-datepicker)
- ✅ Rich text editor (simple textarea dengan formatting)
- ✅ Data pagination (custom atau library simple)
- ✅ Form validation (JavaScript built-in)
- ✅ Search & filtering (JavaScript built-in)
- ✅ Tax calculation (manual formula: PPN, discount, etc)
- ✅ Real-time notifications pakai polling/toast
