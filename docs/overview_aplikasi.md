**ERP + POS System Blueprint (Next.js, Tailwind CSS, shadcn/ui, MongoDB, NextAuth)**

---

## 🧱 Tech Stack (Final)

- **Frontend**: Next.js (App Router), Tailwind CSS, shadcn/ui, Mobile-first responsive design, Lucide icons, TanStack Table
- **Backend**: Next.js API Routes (modular REST)
- **Database**: MongoDB (Atlas)
- **Auth**: NextAuth.js

---

## 🤝 Role Akses:

1. **Admin (Owner)** – Semua akses penuh ke seluruh modul dan fitur
2. **Kasir** – Akses ke POS, riwayat transaksi, stok produk
3. **Gudang** – Akses ke produk, stok opname, mutasi
4. **Sales** – Input order, lihat pelanggan, lihat komisi
5. **HRD** – Kelola data karyawan, absensi, slip gaji
6. **Akuntan** – Transaksi keuangan, jurnal, laporan

---

## 🎟️ Flow Sistem Per Role:

### 💼 Admin (Owner)

- Login ke dashboard utama
- Mengelola semua data dan modul (user, produk, laporan, keuangan, dsb)
- Menyetujui order penjualan
- Menambahkan promo, pelanggan, supplier
- Melihat semua laporan performa

### 🏋️‍♂️ Kasir

- Login ke POS layout
- Scan/input produk
- Input pembayaran (tunai/manual)
- Cetak struk atau kirim invoice manual
- Buka dan tutup kasir harian
- Lihat histori transaksi

### 🚚 Manajer Gudang

- Login ke dashboard
- Kelola stok produk (tambah, edit, mutasi)
- Lakukan stok opname
- Terima barang masuk dari pembelian
- Lihat laporan stok

### 🚗 Sales

- Login ke dashboard
- Input order pelanggan dari lapangan
- Cek histori pelanggan
- Lihat laporan performa pribadi (komisi, jumlah order)

### 👩‍🎓 HRD

- Login ke dashboard HRD
- Input data karyawan
- Isi absensi harian
- Generate slip gaji per bulan
- Kelola hak akses role

### 💳 Akuntan

- Login ke dashboard keuangan
- Input jurnal & transaksi manual
- Lihat kas masuk/keluar
- Generate laporan laba rugi & neraca

---

## 📆 Modul Fitur Berdasarkan Blueprint Excel:

### POS

- Tambah item ke keranjang
- Proses diskon
- Pembayaran (manual/tunai)
- Refund transaksi
- Cetak invoice PDF

### Penjualan & Pembelian

- Buat SO
- Approval admin
- Terima barang
- Faktur & nota
- Analisa penjualan

### Gudang

- Data produk
- Buffer stok
- Mutasi antar gudang
- Opname & penghapusan

### Pelanggan & Supplier

- Segmentasi pelanggan
- Riwayat pembelian
- Tambah supplier

### Promo

- Diskon bertingkat/nominal
- Promo bundling

### SDM

- Data karyawan
- Absensi manual
- Slip gaji

### Keuangan

- Jurnal umum
- Kas masuk/keluar
- Buku besar
- Laporan akuntansi

### Kendaraan

- Data plat & kendaraan

### Salesman

- Komisi
- Barang terlaris
- Pelanggan utama

---

## ❌ Frontend - Yang Diskip (API Integrasi Pihak Ketiga):

Tetap ditampilkan dengan fitur manual:

- Barcode scanning: input kode manual
- Thermal print: cetak PDF
- Payment gateway: input metode bayar manual
- WhatsApp/SMS: tombol copy link
- Email: download invoice manual
- File upload: lokal storage sementara
- WebSocket: polling biasa
- Pajak: input manual

---

## 🧬 Konsep Sistem:

### Frontend

- Layout POS & Admin
- Komponen shadcn
- TanStack Table untuk listing

### Backend

- Modular API Next.js
- Middleware akses per role

### Database

- MongoDB per modul: users, orders, stock, etc

---
