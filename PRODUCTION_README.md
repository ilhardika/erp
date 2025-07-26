# Production Ready ERP CRUD Application

## Quick Start

Aplikasi CRUD sederhana untuk manajemen produk yang sudah siap untuk production dan deployment ke Vercel.

### Setup & Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Pastikan `.env.local` berisi:

   ```
   MONGODB_URI=mongodb+srv://ilhamhardika48:Q89WOHbJ0GouzlJS@cluster-erp.pz7qsmu.mongodb.net/
   ```

3. **Run Development Server**

   ```bash
   npm run dev
   ```

4. **Access Application**
   Buka http://localhost:3000

## Features

- ✅ **Create**: Tambah produk baru dengan validasi
- 👁️ **Read**: Tampil daftar produk dengan format tabel
- ✏️ **Update**: Edit informasi produk existing
- 🗑️ **Delete**: Hapus produk dengan konfirmasi

## Product Schema

```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required),
  quantity: Number (required),
  category: String (required),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## Production Deployment

### Vercel Deployment

1. **Push to GitHub Repository**

   ```bash
   git add .
   git commit -m "Production ready CRUD app"
   git push origin main
   ```

2. **Deploy to Vercel**

   - Connect GitHub repository to Vercel
   - Add environment variable:
     - Key: `MONGODB_URI`
     - Value: `mongodb+srv://ilhamhardika48:Q89WOHbJ0GouzlJS@cluster-erp.pz7qsmu.mongodb.net/`

3. **Verify Deployment**
   - Test all CRUD operations
   - Check database connection
   - Verify environment variables

## Database Information

- **Provider**: MongoDB Atlas
- **Cluster**: cluster-erp.pz7qsmu.mongodb.net
- **Database**: erp
- **Collection**: products
- **Connection**: Already configured and tested

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js 15 API Routes
- **Database**: MongoDB Atlas with Mongoose ODM
- **Deployment**: Vercel (production ready)
- **Development**: Turbopack for fast refresh

## File Structure

```
app/
├── page.tsx              # Main CRUD interface
├── layout.tsx            # Root layout
├── globals.css           # Global styles
└── api/
    └── products/
        ├── route.ts      # GET, POST endpoints
        └── [id]/
            └── route.ts  # GET, PUT, DELETE by ID

lib/
└── mongodb.ts            # Database connection

models/
└── Product.ts            # Mongoose schema

.env.local                # Environment variables
```

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create new product
- `GET /api/products/[id]` - Get product by ID
- `PUT /api/products/[id]` - Update product by ID
- `DELETE /api/products/[id]` - Delete product by ID

## Notes

- Semua debug dan testing code sudah dihapus
- Database connection sudah ditest dan berfungsi
- Ready untuk production deployment
- UI responsive untuk desktop dan mobile
- Error handling dan loading states included
