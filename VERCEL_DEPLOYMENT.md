# 🚀 Deployment Guide - Deploy ke Vercel

Panduan lengkap untuk deploy aplikasi ERP ke Vercel dengan MongoDB Atlas.

## 📋 Prerequisites

1. ✅ Aplikasi Next.js sudah jalan di local
2. ✅ Code sudah di push ke GitHub
3. ✅ Account Vercel (free)
4. ✅ **WAJIB: MongoDB Atlas setup** (bukan MongoDB local!)

## 🗄️ Setup Database (MongoDB Atlas)

### Langkah 1: Buat MongoDB Atlas Account

1. Buka https://www.mongodb.com/atlas
2. Sign up dengan email atau Google
3. Pilih **"Build a database"**

### Langkah 2: Create Cluster

1. Pilih **"M0 Sandbox"** (FREE)
2. Pilih region terdekat (Singapore/Sydney untuk Indonesia)
3. Cluster Name: `erp-cluster` (atau nama lain)
4. **Create Cluster**

### Langkah 3: Database Access (Create User)

1. Klik **"Database Access"** di sidebar
2. **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `erpuser` (atau nama lain)
5. Password: Generate atau buat password kuat
6. Database User Privileges: **"Read and write to any database"**
7. **Add User**

### Langkah 4: Network Access (Allow Connections)

1. Klik **"Network Access"** di sidebar
2. **"Add IP Address"**
3. **"Allow access from anywhere"** (0.0.0.0/0)
   - Untuk production, sebaiknya specify IP Vercel
   - Untuk testing, pakai 0.0.0.0/0 dulu
4. **Confirm**

### Langkah 5: Get Connection String

1. Klik **"Database"** di sidebar
2. **"Connect"** pada cluster Anda
3. **"Connect your application"**
4. Driver: **Node.js**, Version: **5.5 or later**
5. Copy connection string:
   ```
   mongodb+srv://erpuser:<password>@erp-cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** dengan password yang dibuat tadi
7. **Tambahkan database name**: `/erp` setelah `.net`
   ```
   mongodb+srv://erpuser:mypassword@erp-cluster.xxxxx.mongodb.net/erp?retryWrites=true&w=majority
   ```

## 🌐 Deploy ke Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Login ke Vercel**: https://vercel.com
2. **"New Project"**
3. **"Import Git Repository"**
4. Pilih GitHub repo project ERP Anda
5. **Import Project**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

## ⚙️ Environment Variables di Vercel

**PENTING**: Setelah import project, WAJIB setup environment variable!

### Cara 1: Via Vercel Dashboard

1. Buka project di Vercel dashboard
2. **Settings** → **Environment Variables**
3. **Add New**:
   - **Name**: `MONGODB_URI`
   - **Value**: connection string MongoDB Atlas (yang sudah di-copy tadi)
   - **Environment**:
     - ✅ Production
     - ✅ Preview (optional)
     - ✅ Development (optional)
4. **Save**

### Cara 2: Via Vercel CLI

```bash
# Set environment variable
vercel env add MONGODB_URI

# Paste MongoDB Atlas connection string when prompted
```

## 🔄 Redeploy

Setelah menambah environment variable, **redeploy** project:

### Via Dashboard:

1. **Deployments** tab
2. **"Redeploy"** pada deployment terakhir

### Via CLI:

```bash
vercel --prod
```

## ✅ Testing Production

1. **Get Production URL**: Vercel akan provide URL seperti `https://your-app.vercel.app`
2. **Test Homepage**: Buka URL, pastikan landing page muncul
3. **Test Demo**: Coba `/demo` route untuk test tanpa MongoDB
4. **Test MongoDB**: Coba `/products` route untuk test dengan MongoDB Atlas
5. **Test CRUD**: Tambah, edit, hapus produk

## 🐛 Troubleshooting Deployment

### Error: "MongoServerError: connect ECONNREFUSED"

❌ **Cause**: Masih pakai MongoDB local di code
✅ **Fix**:

- Pastikan `.env.local` pakai MongoDB Atlas connection string
- Pastikan environment variable di Vercel sudah benar
- Redeploy

### Error: "MongoParseError: Invalid connection string"

❌ **Cause**: Format connection string salah
✅ **Fix**:

- Cek environment variable di Vercel
- Pastikan format: `mongodb+srv://username:password@cluster.mongodb.net/dbname?options`
- Pastikan password tidak ada karakter khusus yang perlu di-encode

### Error: "Authentication failed"

❌ **Cause**: Username/password salah di MongoDB Atlas
✅ **Fix**:

- Cek Database Access di MongoDB Atlas
- Pastikan username/password di connection string sama dengan user yang dibuat
- Try reset password user di MongoDB Atlas

### Error: "IP not whitelisted"

❌ **Cause**: Network access MongoDB Atlas terlalu restrictive
✅ **Fix**:

- MongoDB Atlas → Network Access
- Allow 0.0.0.0/0 untuk testing
- Atau tambahkan IP range Vercel

### Error: Next.js Build Failed

❌ **Cause**: TypeScript errors atau dependency issues
✅ **Fix**:

- Check build locally: `npm run build`
- Fix TypeScript errors
- Update dependencies jika perlu

## 🎯 Production Checklist

### Before Deploy:

- [ ] Code tested locally
- [ ] MongoDB Atlas cluster ready
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string tested
- [ ] Code pushed to GitHub

### After Deploy:

- [ ] Environment variables added in Vercel
- [ ] Deployment successful
- [ ] Production URL accessible
- [ ] MongoDB connection working
- [ ] CRUD operations working
- [ ] Error handling tested

## 💡 Pro Tips

### Multiple Environments:

```bash
# Different databases for different environments
Production: erp-prod
Staging: erp-staging
Development: erp-dev
```

### Custom Domain:

1. Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain
3. Update DNS settings as instructed

### Performance:

- Vercel auto-optimizes Next.js apps
- MongoDB Atlas has built-in caching
- Consider adding Redis for session storage

### Monitoring:

- Vercel Analytics (built-in)
- MongoDB Atlas Monitoring
- Error tracking dengan Sentry (optional)

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Environment Variables di Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
