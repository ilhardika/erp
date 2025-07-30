# MongoDB Database Structure untuk BizFlow ERP

## Database: `bizflow`

### 1. Collection: `users`
```javascript
{
  _id: ObjectId,
  name: String,
  email: String, // unique
  password: String, // hashed with bcryptjs
  role: String, // 'admin', 'kasir', 'gudang', 'sales', 'hrd', 'akuntan'
  status: String, // 'aktif', 'nonaktif'
  createdAt: Date,
  updatedAt: Date,
  createdBy: String // user id
}
```

### 2. Collection: `categories`
```javascript
{
  _id: ObjectId,
  nama: String, // unique
  deskripsi: String, // optional
  status: String, // 'aktif', 'nonaktif'
  createdAt: Date,
  updatedAt: Date,
  createdBy: String // user id
}
```

### 3. Collection: `products`
```javascript
{
  _id: ObjectId,
  kode: String, // unique, auto-generated PRD000001
  nama: String,
  deskripsi: String, // optional
  kategori: String, // reference to category name or id
  hargaBeli: Number,
  hargaJual: Number,
  stok: Number,
  stokMinimal: Number,
  satuan: String, // 'pcs', 'kg', 'gram', etc
  barcode: String, // optional
  berat: Number, // optional, unit depends on satuan
  gambar: String, // optional, image URL
  status: String, // 'aktif', 'nonaktif'
  createdAt: Date,
  updatedAt: Date,
  createdBy: String // user id
}
```

### 4. Collection: `customers`
```javascript
{
  _id: ObjectId,
  kode: String, // unique, auto-generated CUS000001
  nama: String,
  email: String, // optional
  telepon: String, // optional
  alamat: String, // optional
  tipeCustomer: String, // 'retail', 'grosir', 'member'
  diskon: Number, // optional, default 0
  status: String, // 'aktif', 'nonaktif'
  createdAt: Date,
  updatedAt: Date,
  createdBy: String // user id
}
```

### 5. Collection: `suppliers`
```javascript
{
  _id: ObjectId,
  kode: String, // unique, auto-generated SUP000001
  nama: String,
  email: String, // optional
  telepon: String, // optional
  alamat: String, // optional
  kontak: String, // contact person
  status: String, // 'aktif', 'nonaktif'
  createdAt: Date,
  updatedAt: Date,
  createdBy: String // user id
}
```

### 6. Collection: `transactions`
```javascript
{
  _id: ObjectId,
  nomorTransaksi: String, // unique, auto-generated TRX000001
  tipe: String, // 'penjualan', 'pembelian'
  tanggal: Date,
  customer: {
    id: String, // customer id
    nama: String,
    tipe: String
  },
  items: [{
    productId: String,
    kodeProduct: String,
    namaProduct: String,
    qty: Number,
    satuan: String,
    hargaSatuan: Number,
    diskon: Number, // default 0
    subtotal: Number
  }],
  subtotal: Number,
  diskon: Number, // total discount
  pajak: Number, // default 0
  total: Number,
  metodePembayaran: String, // 'tunai', 'transfer', 'kartu'
  statusPembayaran: String, // 'lunas', 'belum_lunas', 'sebagian'
  catatan: String, // optional
  kasir: String, // user id
  createdAt: Date,
  updatedAt: Date
}
```

### 7. Collection: `stock_movements`
```javascript
{
  _id: ObjectId,
  productId: String,
  kodeProduct: String,
  namaProduct: String,
  tipe: String, // 'masuk', 'keluar', 'opname', 'adjustment'
  referensi: String, // transaction id or reason
  qtySebelum: Number,
  qtyPerubahan: Number,
  qtySesudah: Number,
  satuan: String,
  catatan: String, // optional
  tanggal: Date,
  createdBy: String, // user id
  createdAt: Date
}
```

### 8. Collection: `employees`
```javascript
{
  _id: ObjectId,
  nip: String, // unique, auto-generated EMP000001
  nama: String,
  email: String, // optional
  telepon: String, // optional
  alamat: String, // optional
  jabatan: String,
  divisi: String,
  gaji: Number,
  tanggalMasuk: Date,
  status: String, // 'aktif', 'nonaktif', 'resign'
  createdAt: Date,
  updatedAt: Date,
  createdBy: String // user id
}
```

## Indexes yang Dibutuhkan

### Users
- `email` (unique)
- `role`

### Categories
- `nama` (unique)
- `status`

### Products
- `kode` (unique)
- `nama` (text index untuk search)
- `kategori`
- `status`
- `barcode`

### Customers
- `kode` (unique)
- `nama` (text index)
- `status`

### Suppliers
- `kode` (unique)
- `nama` (text index)
- `status`

### Transactions
- `nomorTransaksi` (unique)
- `tanggal`
- `customer.id`
- `kasir`
- `tipe`

### Stock Movements
- `productId`
- `tanggal`
- `tipe`

### Employees
- `nip` (unique)
- `nama` (text index)
- `status`

## Initial Data (Seeds)

### Admin User
```javascript
{
  name: "Administrator",
  email: "admin@bizflow.com",
  password: "$2a$12$hashed_password", // password: "admin123"
  role: "admin",
  status: "aktif",
  createdAt: new Date(),
  updatedAt: new Date(),
  createdBy: "system"
}
```

### Default Categories
```javascript
[
  { nama: "Makanan", status: "aktif" },
  { nama: "Minuman", status: "aktif" },
  { nama: "Elektronik", status: "aktif" },
  { nama: "Pakaian", status: "aktif" },
  { nama: "Kesehatan", status: "aktif" },
  { nama: "Kecantikan", status: "aktif" },
  { nama: "Rumah Tangga", status: "aktif" },
  { nama: "Lainnya", status: "aktif" }
]
```
