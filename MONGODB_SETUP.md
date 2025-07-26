# Setup MongoDB untuk Aplikasi ERP

Aplikasi ini membutuhkan MongoDB sebagai database. **PENTING**: Pilihan setup berbeda untuk development vs production.

## 🏠 Development (Local) vs 🌐 Production (Deploy)

### Development - MongoDB Local ✅

- Cocok untuk development di komputer lokal
- Cepat dan mudah setup
- **TIDAK BISA** digunakan untuk deploy ke Vercel/Netlify/hosting cloud

### Production - MongoDB Atlas ✅

- **WAJIB** untuk deploy ke Vercel/hosting cloud
- Free tier 512MB (cukup untuk project kecil)
- Bisa diakses dari mana saja

## 📋 Rekomendasi Strategi

### Untuk Pemula/Demo:

1. Gunakan **MongoDB Atlas** (cloud) dari awal
2. Bisa untuk development DAN production
3. Setup sekali, jalan di mana-mana

### Untuk Development Serius:

1. MongoDB Local untuk development
2. MongoDB Atlas untuk production
3. Gunakan environment variables untuk switch

## Option 1: MongoDB Atlas (RECOMMENDED - Works Everywhere)

### Setup MongoDB Atlas:

1. Buat account di https://www.mongodb.com/atlas
2. Buat cluster baru (pilih **Free Tier** - M0 Sandbox)
3. **Database Access**: Buat user dengan username/password
4. **Network Access**:
   - Untuk testing: tambahkan `0.0.0.0/0` (Allow from anywhere)
   - Untuk production: tambahkan IP Vercel (atau tetap 0.0.0.0/0)
5. **Connect**: Pilih "Connect your application"
6. Copy connection string
7. Update `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp?retryWrites=true&w=majority
```

### Environment Variables untuk Vercel:

Ketika deploy ke Vercel, tambahkan environment variable yang sama di Vercel dashboard.

## Option 2: MongoDB Local (Development Only)

⚠️ **WARNING**: Hanya untuk development, TIDAK untuk deployment!

### Windows:

1. Download MongoDB Community Edition dari https://www.mongodb.com/try/download/community
2. Install dengan default settings
3. MongoDB akan berjalan sebagai Windows Service
4. Default connection: `mongodb://localhost:27017`

### Atau gunakan Chocolatey:

```powershell
# Install Chocolatey jika belum ada
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install MongoDB
choco install mongodb
```

### Atau gunakan Docker:

```powershell
# Jalankan MongoDB dengan Docker
docker run --name mongodb -p 27017:27017 -d mongo:latest
```

⚠️ **Ingat**: MongoDB local hanya untuk development. Untuk deploy ke Vercel, wajib pakai MongoDB Atlas.

## ⚙️ Setup Environment Variables

### Development (.env.local):

```env
# Untuk MongoDB Atlas (recommended):
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp?retryWrites=true&w=majority

# Atau untuk MongoDB Local (development only):
# MONGODB_URI=mongodb://localhost:27017/erp
```

### Production (Vercel):

1. Buka Vercel Dashboard
2. Pilih project Anda
3. Go to **Settings** → **Environment Variables**
4. Tambahkan:
   - **Name**: `MONGODB_URI`
   - **Value**: connection string MongoDB Atlas
   - **Environment**: Production (dan Preview jika mau)

## 🚀 Deployment ke Vercel

### Step-by-step:

1. **Setup MongoDB Atlas** (wajib!)
2. **Push code** ke GitHub
3. **Connect Vercel** ke GitHub repo
4. **Add environment variable** di Vercel:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp?retryWrites=true&w=majority
   ```
5. **Deploy** - otomatis!

### Test deployment:

- Vercel akan memberikan URL seperti `https://your-app.vercel.app`
- Test CRUD operations di production URL

## Option 3: MongoDB Atlas (Cloud - Free Tier) - LEGACY DOCS

Sudah dijelaskan di atas sebagai Option 1.

## Verifikasi Setup

### Development:

```bash
npm run dev
```

Akses http://localhost:3000

### Production:

Setelah deploy ke Vercel, akses URL production yang diberikan Vercel.

## Troubleshooting

### Error: MongoServerError: connect ECONNREFUSED

**Solusi berdasarkan environment:**

#### Development:

- MongoDB local belum running
- Windows: Cek Windows Services → "MongoDB"
- Docker: `docker start mongodb`

#### Production/Vercel:

- Pasti pakai MongoDB local → **GANTI ke MongoDB Atlas**
- Cek environment variable di Vercel dashboard

### Error: MongoParseError: Invalid connection string

- Cek format connection string di `.env.local` atau Vercel env vars
- Pastikan tidak ada spasi atau karakter escape

### Error: Authentication failed

- **Atlas**: Cek username/password di Database Access
- **Local**: Biasanya tidak pakai auth, cek connection string

### Error di Vercel tapi works locally

- 99% karena pakai MongoDB local → ganti ke MongoDB Atlas
- Cek environment variables di Vercel dashboard

## 💡 Tips Pro

### Dual Environment Setup:

```env
# .env.local (for development)
MONGODB_URI=mongodb://localhost:27017/erp

# Vercel Environment Variables (for production)
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/erp?retryWrites=true&w=majority
```

### Database Naming:

- Development: `erp-dev`
- Production: `erp-prod`
- Testing: `erp-test`

## Alternative: Demo dengan Mock Data

Jika tidak mau setup database sama sekali, gunakan `/demo` route yang sudah disediakan dengan mock data di memory.
