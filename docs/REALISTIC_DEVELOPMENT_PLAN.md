# BizFlow ERP+POS - Complete Development Guide

## 🏗️ **Tech Stack Overview**

### Fronten### Yang Diskip (Third Party APIs):

- ❌ Barcode scanning (camera API) - skip dulu
- ❌ Thermal printing (printer integration) - skip dulu
- ❌ Payment gateways (QRIS, credit card) - skip dulu
- ❌ WhatsApp/SMS integration - skip dulu
- ❌ Email services (SMTP) - skip dulu
- ❌ File upload to cloud storage - skip dulu
- ❌ Real-time notifications (WebSocket) - skip dulu, pakai polling
- ❌ Government tax API integration - skip dulu, bikin manual\*React + Next.js 15\*\* (App Router dengan JavaScript)
- **Tailwind CSS** (styling framework)
- **shadcn/ui** (component library)
- **Lucide Icons** (icon system)

### Backend:

- **Next.js API Routes** (serverless functions)
- **MongoDB Atlas** (cloud database)
- **Clerk Authentication** (user management)

### Development:

- **JavaScript ES6+** (modern JavaScript)
- **ESLint** (code quality)
- **Vercel** (deployment platform)

---

## 🎯 **PHASE 1: Enhanced Product Management + Authentication** (Week 1-2)

### Yang Akan Dikembangkan:

1. **Setup Clerk Authentication** (basic login/logout)
2. **Enhanced Product Management**:
   - ✅ Categories/subcategories (dropdown sederhana)
   - ✅ Barcode field (text input, no scanner)
   - ✅ Multiple pricing (retail/wholesale)
   - ✅ Stock tracking
   - ❌ ~~Product images~~ (skip dulu, butuh upload handling)

### Indikator Berhasil:

- ✅ User login dengan role (admin, kasir)
- ✅ CRUD products dengan categories dan barcode
- ✅ Role-based pages (kasir tidak bisa akses admin pages)
- ✅ Stock levels tracked
- ✅ Deploy dengan auth working

---

## 🎯 **PHASE 2: Basic POS Interface** (Week 2-3)

### Yang Akan Dikembangkan:

1. **POS Layout** yang clean dan responsive
2. **Product Search** (text search, no barcode scanning)
3. **Shopping Cart** dengan quantity management
4. **Cash Payment Only** (simple calculation)
5. **Receipt Display** (on screen, no printing)
6. **Refund/Void** transactions (manual process)
7. **Shift Management** (manual input opening/closing)

### Yang Diskip (Third Party Dependencies):

- ❌ ~~Barcode scanning~~ (butuh camera API)
- ❌ ~~Thermal printing~~ (butuh printer integration)
- ❌ ~~QRIS/Transfer~~ (butuh payment gateway)
- ❌ ~~WhatsApp receipt~~ (butuh WhatsApp API)

### Indikator Berhasil:

- ✅ Search products by name/barcode text
- ✅ Add/remove items dari cart
- ✅ Calculate total + tax otomatis
- ✅ Process cash payment dengan kembalian
- ✅ Show receipt di screen
- ✅ Inventory auto-update after sale

---

## 🎯 **PHASE 3: Business Management** (Week 4-6)

### Yang Akan Dikembangkan:

1. **Customer Management** (manual input & tracking)
2. **Supplier Management** (manual data entry)
3. **Purchase Orders** (manual creation & receiving)
4. **Stock Opname** (manual count & adjustment)
5. **Employee Management** (manual HR data)
6. **Expense Tracking** (manual financial input)
7. **Comprehensive Reports** (sales, inventory, financial)
8. **Export Functionality** (PDF/Excel dengan library)
9. **Charts & Graphs** (Chart.js atau Recharts)
10. **Toast Notifications** (shadcn toast dengan close button)
11. **Image Upload** (local storage & preview)
12. **Tax Calculation** (manual formula: PPN 11%, discount, etc)

### Yang Diskip (Third Party APIs):

- ❌ Barcode scanning (camera API) - skip dulu
- ❌ Thermal printing (printer integration) - skip dulu
- ❌ Payment gateways (QRIS, credit card) - skip dulu
- ❌ WhatsApp/SMS integration - skip dulu
- ❌ File upload to cloud storage - skip dulu
- ❌ Real-time notifications (WebSocket) - skip dulu, pakai polling
- ❌ Government tax API integration - skip dulu, bikin manual### Indikator Berhasil:

- ✅ Customer & supplier data management
- ✅ Manual purchase order workflow
- ✅ Stock opname & adjustments
- ✅ Employee & attendance tracking
- ✅ Expense recording & basic accounting
- ✅ Comprehensive business reports with charts
- ✅ PDF/Excel export functionality
- ✅ Toast notifications working
- ✅ Image upload & preview (local)
- ✅ Complete ERP functionality (manual input based)

---

## 🛠️ **Tech Stack yang Realistic:**

### Frontend:

- ✅ React + Next.js 15
- ✅ Tailwind CSS (no custom themes)
- ✅ shadcn/ui components (basic ones)
- ✅ Lucide icons (simple icons only)

### Backend:

- ✅ Next.js API Routes
- ✅ MongoDB Atlas
- ✅ Clerk Authentication (basic plan)

### Data:

- ✅ Local state management (useState/useEffect)
- ✅ Form handling native React
- ✅ Simple validation (required fields only)
- ✅ JavaScript ES6+ features
- ✅ No TypeScript complexity

---

## 📱 **UI/UX Approach:**

### Simple & Clean:

- ✅ Basic responsive layout
- ✅ Simple forms dengan validation minimal
- ✅ Native browser alerts untuk confirmations
- ✅ Loading states sederhana
- ✅ Error messages basic

### Yang Diskip:

- ❌ ~~Complex animations~~
- ❌ ~~Toast notifications~~
- ❌ ~~Modal dialogs~~ (use pages instead)
- ❌ ~~Drag & drop~~
- ❌ ~~File uploads~~

---

## 🔄 **Development Flow yang Realistic:**

### Database First:

1. Enhance Product model dengan categories & barcode
2. Create Transaction model
3. Create simple Categories model

### Backend API:

1. Products CRUD (enhance existing)
2. Categories CRUD
3. Transactions CRUD
4. Simple reports endpoints

### Frontend:

1. Auth pages dengan Clerk
2. Enhanced products management
3. POS interface
4. Transaction history
5. Basic dashboard

---

## 📁 **Project Structure**

```
app/
├── (auth)/
│   ├── sign-in/page.js
│   └── sign-up/page.js
├── dashboard/
│   ├── page.js              # Main dashboard
│   ├── products/             # Enhanced products
│   │   ├── page.js
│   │   ├── create/page.js
│   │   └── [id]/edit/page.js
│   ├── categories/           # Categories management
│   │   ├── page.js
│   │   └── create/page.js
│   ├── pos/page.js          # POS interface
│   ├── sales/                # Transaction management
│   │   ├── page.js
│   │   ├── create/page.js
│   │   └── [id]/page.js
│   ├── purchases/           # Purchase management
│   │   ├── page.js
│   │   ├── create/page.js
│   │   └── receive/page.js
│   ├── customers/           # Customer management
│   │   ├── page.js
│   │   └── create/page.js
│   ├── suppliers/           # Supplier management
│   │   ├── page.js
│   │   └── create/page.js
│   ├── inventory/           # Stock management
│   │   ├── stock-opname/page.js
│   │   └── mutations/page.js
│   ├── employees/           # HR management
│   │   ├── page.js
│   │   ├── create/page.js
│   │   └── attendance/page.js
│   ├── finance/             # Financial management
│   │   ├── expenses/page.js
│   │   └── transactions/page.js
│   └── reports/             # Reporting
│       ├── sales/page.js
│       ├── inventory/page.js
│       └── financial/page.js
├── api/
│   ├── products/route.js    # Enhanced existing
│   ├── categories/route.js  # New
│   ├── sales/route.js       # New
│   ├── purchases/route.js   # New
│   ├── customers/route.js   # New
│   ├── suppliers/route.js   # New
│   ├── employees/route.js   # New
│   ├── expenses/route.js    # New
│   └── stock-movements/route.js
├── components/
│   ├── ui/                  # shadcn components
│   ├── pos/                 # POS specific
│   ├── forms/               # Form components
│   ├── tables/              # Data display
│   └── shared/              # Common components
├── lib/
│   ├── mongodb.js           # Database connection
│   └── utils.js             # Helper functions
└── models/
    ├── Product.js           # Mongoose schemas
    ├── Category.js
    ├── Sale.js
    ├── Purchase.js
    ├── Customer.js
    ├── Supplier.js
    ├── Employee.js
    ├── Expense.js
    └── StockMovement.js
```

---

## ✅ **Success Metrics yang Achievable:**

### Technical:

- ✅ No console errors
- ✅ Fast loading (< 2 seconds)
- ✅ Works on mobile browser
- ✅ Deployable ke Vercel

### Functional:

- ✅ Complete sale transaction dalam < 1 menit
- ✅ Stock updates automatically
- ✅ Transaction data persistent
- ✅ Simple reporting works

### Business:

- ✅ Kasir bisa process penjualan tanpa paper
- ✅ Stock tracking otomatis
- ✅ Daily sales calculation akurat
- ✅ Transaction history searchable

Ini approach yang much more realistic dan achievable tanpa dependency third party yang ribet! Focus ke core functionality yang benar-benar essential untuk business operation. 🚀

---

## 📚 **Documentation References**

- **Database Schema**: [`MONGODB_SCHEMA_REALISTIC.md`](./MONGODB_SCHEMA_REALISTIC.md)
- **Page Structure**: [`halaman-aplikasi-erp-pos.md`](./halaman-aplikasi-erp-pos.md)
- **Current Development Plan**: This file

Ready untuk mulai Phase 1 development! 🎯

---

## �‍💻 **Development Guidelines - BizFlow ERP+POS**

_Senior Frontend Engineer Guidelines disesuaikan dengan tech stack kita_

### **Behavior and Mindset**

- Think and act like a senior developer dengan fokus **JavaScript ES6+ modern practices**
- Proactively suggest improvements untuk **manual business operations**
- Break large tasks into smaller, logical parts (Phase 1 → 2 → 3)
- Ensure consistency, maintainability, dan scalability untuk **small business needs**
- Prioritize both usability dan developer experience dengan **minimal dependencies**

### **Code Output Expectations**

- Apply DRY principles dalam setiap feature
- Separate logic into reusable functions (`lib/`, `hooks/`, `utils/`)
- Include basic error handling dengan **native JavaScript validation**
- Keep folder structures clean dan shallow
- **No TypeScript complexity** - pure JavaScript ES6+

### **Folder & File Structure (JavaScript Version)**

```
├── components/
│   ├── ui/           # shadcn components
│   ├── pos/          # POS specific components
│   ├── forms/        # Reusable form components
│   └── shared/       # Common business components
├── lib/
│   ├── mongodb.js    # Database connection
│   ├── utils.js      # Helper functions
│   ├── tax.js        # Tax calculation logic
│   └── export.js     # PDF/Excel export logic
├── models/           # Mongoose schemas (JavaScript)
├── hooks/            # Custom React hooks (if needed)
└── constants/        # Business configs & constants
```

### **UI & Design Expectations**

- Style using **Tailwind utility classes** only
- Use **lucide-react** for icons
- Ensure all UI is responsive (**mobile-first** untuk POS)
- Maintain visual clarity dan simplicity untuk **kasir usage**
- **shadcn/ui components** untuk consistency

### **Best Practices (JavaScript + Next.js 15)**

- Use `"use client"` only when necessary (interactive components)
- Prefer **server components** dan **API routes** when possible
- Organize **MongoDB logic** dalam dedicated `lib/mongodb.js`
- Use **optimistic updates** untuk better POS UX
- Never embed business logic directly inside JSX
- Always delete unused codes or files
- **Manual implementations** over third-party API dependencies

### **Business Logic Separation**

```javascript
// ✅ Good - Separated business logic
// lib/pos.js
export const calculateTotal = (items, taxRate = 0.11) => {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return calculateTax(subtotal, taxRate);
};

// components/POS.jsx
import { calculateTotal } from "@/lib/pos";

// ❌ Bad - Business logic in JSX
const total =
  items.reduce((sum, item) => sum + item.price * item.qty, 0) * 1.11;
```

### **Database Patterns (Mongoose + JavaScript)**

- Keep schemas simple dan focused pada **manual operations**
- Use proper indexing untuk **POS performance**
- Separate concerns: Product → Sale → Stock Movement
- No complex relationships - keep it **simple for small business**

### **Development Process**

- Give short **summary of changes** after each implementation
- Wait for approval before continuing to next task
- Always run `npm run build` after changes
- **Don't git add** - manual git control
- Test pada **mobile browser** untuk POS functionality

### **What to Avoid**

- No repeated logic – always abstract and reuse
- No hardcoded user-facing strings – use `constants/business.js`
- No plain CSS, CSS Modules, or styled-components
- **No TypeScript complexity** - keep JavaScript simple
- **No third-party API dependencies** - focus on manual operations
- No over-engineering - prioritize **business functionality**

### **Error Handling Patterns**

```javascript
// ✅ Simple JavaScript validation
const validateProduct = (product) => {
  if (!product.name) throw new Error("Product name is required");
  if (product.price <= 0) throw new Error("Price must be greater than 0");
  return true;
};

// ✅ API error handling
try {
  const response = await fetch("/api/products", { method: "POST", body: data });
  if (!response.ok) throw new Error("Failed to save product");
  return response.json();
} catch (error) {
  console.error("Product save error:", error.message);
  alert("Error saving product: " + error.message); // Simple user feedback
}
```

### **Performance Priorities**

- **POS speed** - transactions under 30 seconds
- **Mobile responsive** - kasir menggunakan mobile/tablet
- **Offline-capable** - minimal API dependencies
- **Simple loading states** - no complex animations

With these guidelines, help me build **high-quality, production-ready business applications** one task at a time — clearly, modularly, and intentionally untuk **small business operations**.

---

## �📦 **Complete Libraries List**

### **Core Dependencies (Sudah Ada):**

```json
{
  "next": "15.1.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "mongoose": "^8.0.0",
  "tailwindcss": "^3.4.0",
  "@clerk/nextjs": "^6.0.0"
}
```

### **Phase 3 Additional Libraries:**

#### **Charts & Graphs:**

```bash
# Option 1: Chart.js (lightweight)
npm install chart.js react-chartjs-2

# Option 2: Recharts (React native)
npm install recharts
```

#### **PDF/Excel Export:**

```bash
# Excel export
npm install xlsx

# PDF export (print-friendly)
npm install react-to-print

# Alternative PDF generation
npm install jspdf html2canvas
```

#### **UI Enhancements:**

```bash
# Date picker
npm install react-datepicker

# Toast notifications (jika belum ada di shadcn)
npm install react-hot-toast

# Image preview & compression
npm install react-image-crop

# Form validation (optional)
npm install react-hook-form

# Date formatting
npm install date-fns
```

### **Implementation Examples:**

#### **Tax Calculation (Manual Formula):**

```javascript
// lib/tax.js
export const calculateTax = (subtotal, taxRate = 0.11) => {
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    subtotal,
    tax,
    total,
    taxRate: taxRate * 100, // untuk display %
  };
};

// Usage
const result = calculateTax(100000); // PPN 11%
// result: { subtotal: 100000, tax: 11000, total: 111000, taxRate: 11 }
```

#### **Toast Notifications (shadcn):**

```javascript
// components/ui/toast.jsx
import { toast } from "@/components/ui/use-toast";

toast({
  title: "Success",
  description: "Product saved successfully!",
  variant: "default", // default, destructive
  action: <button onClick={() => toast.dismiss()}>Close</button>,
});
```

#### **Excel Export:**

```javascript
// lib/export.js
import * as XLSX from "xlsx";

export const exportToExcel = (data, filename) => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};
```

#### **Simple Charts:**

```javascript
// components/SalesChart.jsx
import { Line } from "react-chartjs-2";

const SalesChart = ({ salesData }) => {
  const data = {
    labels: salesData.map((item) => item.date),
    datasets: [
      {
        label: "Daily Sales",
        data: salesData.map((item) => item.total),
        borderColor: "rgb(75, 192, 192)",
      },
    ],
  };

  return <Line data={data} />;
};
```

### **Total Additional Dependencies:** ~8-10 packages

- Semua lightweight & well-maintained
- No complex third-party APIs
- Pure client-side + simple server functionality

---
