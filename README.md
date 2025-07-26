# ERP - Product Management System

Aplikasi CRUD sederhana untuk manajemen produk menggunakan Next.js dan MongoDB.

## Features

- ✅ Create (Tambah produk baru)
- ✅ Read (Lihat daftar produk)
- ✅ Update (Edit produk)
- ✅ Delete (Hapus produk)
- ✅ Responsive design dengan Tailwind CSS
- ✅ TypeScript support
- ✅ MongoDB dengan Mongoose

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Backend**: Next.js API Routes
- **Database**: MongoDB dengan Mongoose
- **Styling**: Tailwind CSS

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup MongoDB

#### Option A: Local MongoDB

- Install MongoDB di komputer Anda
- Jalankan MongoDB service
- Database akan dibuat otomatis dengan nama `erp`

#### Option B: MongoDB Atlas (Cloud)

- Buat account di [MongoDB Atlas](https://www.mongodb.com/atlas)
- Buat cluster baru
- Dapatkan connection string

### 3. Environment Variables

Edit file `.env.local` dan sesuaikan `MONGODB_URI`:

```env
# Untuk MongoDB lokal:
MONGODB_URI=mongodb://localhost:27017/erp

# Untuk MongoDB Atlas:
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/erp?retryWrites=true&w=majority
```

### 4. Run Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

## API Endpoints

### Products API

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get single product
- `PUT /api/products/[id]` - Update product
- `DELETE /api/products/[id]` - Delete product

### Example Product Object

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "name": "Laptop Gaming",
  "description": "Laptop gaming dengan spesifikasi tinggi",
  "price": 15000000,
  "quantity": 5,
  "category": "Electronics",
  "createdAt": "2025-01-01T00:00:00.000Z",
  "updatedAt": "2025-01-01T00:00:00.000Z"
}
```

## Project Structure

```
├── app/
│   ├── api/
│   │   └── products/
│   │       ├── route.ts          # GET, POST /api/products
│   │       └── [id]/
│   │           └── route.ts      # GET, PUT, DELETE /api/products/[id]
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main product management page
├── lib/
│   └── mongodb.ts               # Database connection
├── models/
│   └── Product.ts              # Product model/schema
├── types/
│   └── mongoose.d.ts           # TypeScript definitions
├── .env.local                  # Environment variables
└── package.json
```

## Usage

1. **Tambah Produk**: Klik tombol "Add New Product" dan isi form
2. **Lihat Produk**: Semua produk ditampilkan dalam tabel
3. **Edit Produk**: Klik tombol "Edit" pada produk yang ingin diubah
4. **Hapus Produk**: Klik tombol "Delete" (akan ada konfirmasi)

## Development

### Add New Features

Untuk menambah field baru pada produk:

1. Update model di `models/Product.ts`
2. Update interface di `app/page.tsx`
3. Update form di komponen UI
4. Update API endpoints jika diperlukan

### Database Schema Validation

Model Product menggunakan validasi Mongoose:

- `name`: Required, max 100 characters
- `description`: Required, max 500 characters
- `price`: Required, min 0
- `quantity`: Required, min 0
- `category`: Required, max 50 characters

## Troubleshooting

### Error: MongoDB connection failed

- Pastikan MongoDB service berjalan (jika lokal)
- Cek connection string di `.env.local`
- Pastikan network access sudah dikonfigurasi (jika MongoDB Atlas)

### Error: Module not found

- Jalankan `npm install` untuk install dependencies
- Restart development server

## Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request
