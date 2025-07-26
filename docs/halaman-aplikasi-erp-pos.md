# Daftar Halaman dalam Aplikasi ERP + POS - BizFlow

_React + Next.js + Tailwind + MongoDB_

## 📂 Struktur Halaman Utama Berdasarkan Role

### 1. Auth (Semua Role)

- `/login` – Halaman masuk pengguna (Clerk/NextAuth)
- `/register` – Pendaftaran pengguna baru (khusus Admin)
- `/forgot-password` – Lupa password dan reset

### 2. Layout POS (Kasir)

- `/pos` – Tampilan utama kasir
- `/pos/scan` – Mode scan barcode
- `/pos/cart` – Ringkasan belanja
- `/pos/payment` – Proses pembayaran (tunai, QRIS, split, dll)
- `/pos/history` – Riwayat transaksi harian
- `/pos/refund/:id` – Proses retur transaksi
- `/pos/shift` – Buka/Tutup kasir

### 3. Layout Dashboard (Admin / Staff)

#### 📊 Dashboard

- `/dashboard` – Ringkasan metrik penjualan, stok, kas, performa sales

#### 🧾 Transaksi

- `/sales/orders` – Daftar order penjualan
- `/sales/create` – Buat order baru (manual atau input oleh sales)
- `/purchases/invoices` – Daftar faktur pembelian
- `/purchases/receive` – Penerimaan barang

#### 🏪 Gudang

- `/products` – Manajemen produk
- `/products/create` – Tambah produk baru
- `/products/:id/edit` – Edit produk
- `/inventory/stock-opname` – Stok opname barang
- `/inventory/mutation` – Mutasi antar gudang

#### 👥 Pelanggan & Supplier

- `/customers` – Daftar pelanggan
- `/customers/create` – Tambah pelanggan
- `/suppliers` – Daftar supplier
- `/suppliers/create` – Tambah supplier

#### 🎁 Promo & Diskon

- `/promotions` – Daftar skema promo
- `/promotions/create` – Buat promo baru

#### 🧑‍🎓 Karyawan / SDM

- `/employees` – Daftar karyawan
- `/employees/create` – Tambah karyawan
- `/attendance` – Absensi harian / bulanan
- `/payroll` – Slip gaji karyawan

#### 💳 Keuangan

- `/finance/transactions` – Catatan kas & bank
- `/finance/journal` – Jurnal umum
- `/finance/balance-sheet` – Neraca
- `/finance/profit-loss` – Laba rugi

#### 🌟 Laporan & Analitik

- `/reports/sales` – Laporan penjualan
- `/reports/products` – Produk terlaris & tidak laku
- `/reports/stock` – Laporan stok barang
- `/reports/finance` – Laporan keuangan
- `/reports/salesman` – Kinerja sales per orang

### 4. Admin Settings

- `/settings/users` – Kelola akun pengguna & role
- `/settings/company` – Informasi & logo perusahaan
- `/settings/permissions` – Pengaturan hak akses per modul
- `/settings/backup` – Backup & restore data

### 5. Error & Utility

- `/404` – Halaman tidak ditemukan
- `/maintenance` – Halaman maintenance saat sistem update

## 🔧 Catatan Teknis

- Halaman dibagi berdasarkan layout: **POSLayout**, **AdminLayout**, dan **AuthLayout**
- Semua halaman menggunakan middleware `authGuard(role)`
- Struktur routing menggunakan **App Router Next.js** terbaru (v13+)
- Menggunakan **JavaScript ES6+** untuk seluruh development

Kalau kamu mau, aku bisa bantu generate struktur folder Next.js beserta komponen dasarnya berdasarkan halaman-halaman di atas.
