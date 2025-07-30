# Daftar Halaman dalam Aplikasi ERP + POS - BizFlow (Unified Dashboard Layout)

## 📂 Struktur Halaman Utama Berdasarkan Role (Dengan 1 Layout Dashboard)

### 1. Auth

- `/login` – Halaman masuk pengguna
- `/register` – Pendaftaran pengguna baru (khusus Admin)
- `/forgot-password` – Halaman reset password

---

### 2. Dashboard

#### 💳 POS

- `/dashboard/pos` – Tampilan utama POS
- `/dashboard/pos/scan` – Scan atau input barcode produk
- `/dashboard/pos/cart` – Ringkasan keranjang belanja
- `/dashboard/pos/payment` – Proses pembayaran manual
- `/dashboard/pos/history` – Riwayat transaksi
- `/dashboard/pos/refund/:id` – Proses retur transaksi tertentu
- `/dashboard/pos/shift` – Buka dan tutup kasir

#### 📆 Penjualan

- `/dashboard/sales/orders` – Daftar order penjualan
- `/dashboard/sales/create` – Buat order penjualan

#### 📅 Pembelian

- `/dashboard/purchases/invoices` – Daftar faktur pembelian
- `/dashboard/purchases/receive` – Penerimaan barang

#### 🏢 Manajemen Gudang

- `/dashboard/products` – Daftar produk
- `/dashboard/products/create` – Tambah produk
- `/dashboard/products/:id/edit` – Edit produk
- `/dashboard/inventory/stock-opname` – Stok opname
- `/dashboard/inventory/mutation` – Mutasi stok antar gudang

#### 👥 Pelanggan & Supplier

- `/dashboard/customers` – Daftar pelanggan
- `/dashboard/customers/create` – Tambah pelanggan
- `/dashboard/suppliers` – Daftar supplier
- `/dashboard/suppliers/create` – Tambah supplier

#### 🎁 Promo

- `/dashboard/promotions` – Daftar promo dan diskon
- `/dashboard/promotions/create` – Tambah promo baru

#### 👩‍🎓 SDM / HRD

- `/dashboard/employees` – Daftar karyawan
- `/dashboard/employees/create` – Tambah karyawan
- `/dashboard/attendance` – Data absensi manual
- `/dashboard/payroll` – Slip gaji bulanan

#### 💰 Keuangan

- `/dashboard/finance/transactions` – Kas masuk dan keluar
- `/dashboard/finance/journal` – Jurnal umum
- `/dashboard/finance/balance-sheet` – Neraca
- `/dashboard/finance/profit-loss` – Laba rugi

#### 📊 Laporan & Analitik

- `/dashboard/reports/sales` – Laporan penjualan
- `/dashboard/reports/products` – Laporan produk
- `/dashboard/reports/stock` – Laporan stok
- `/dashboard/reports/salesman` – Analisa performa sales
- `/dashboard/reports/finance` – Laporan keuangan

#### 🧑‍💻 Pengaturan

- `/dashboard/settings/users` – Manajemen pengguna dan role
- `/dashboard/settings/company` – Profil perusahaan
- `/dashboard/settings/permissions` – Hak akses per modul
- `/dashboard/settings/backup` – Backup dan restore manual

---

### 3. Umum

- `/dashboard` – Halaman dashboard utama
- `/404` – Halaman tidak ditemukan
- `/maintenance` – Halaman perawatan

---
