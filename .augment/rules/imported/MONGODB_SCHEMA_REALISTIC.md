---
type: "agent_requested"
description: "Example description"
---

# MongoDB Schema - BizFlow ERP+POS (JavaScript Version)

## **Core Collections untuk Phase 1**

### 1. **Users Collection** - Clerk Authentication

Menggunakan Clerk untuk authentication, tidak perlu custom collection untuk users.

### 2. **Products Collection** (Enhanced dari existing)

```javascript
// models/Product.js
const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,
    sku: { type: String, unique: true, required: true },
    barcode: String, // text input (no generation)
    category: {
      id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      name: String,
    },
    price: {
      cost: { type: Number, required: true }, // harga beli
      selling: { type: Number, required: true }, // harga jual
    },
    stock: {
      quantity: { type: Number, default: 0 },
      minQuantity: { type: Number, default: 0 }, // simple alert threshold
    },
    unit: { type: String, default: "pcs" }, // pcs, kg, box, etc
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    // Removed: images, supplier info, wholesale price
  },
  {
    timestamps: true, // creates createdAt, updatedAt
  }
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);
```

### 3. **Categories Collection** (New - Simple)

```javascript
// models/Category.js
const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: String,
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.Category || mongoose.model("Category", CategorySchema);
```

### 4. **Sales Collection** (Core POS)

```javascript
// models/Sale.js
const mongoose = require("mongoose");

const SaleSchema = new mongoose.Schema(
  {
    transactionNumber: { type: String, unique: true, required: true },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        name: String,
        sku: String,
        price: Number,
        quantity: Number,
        total: Number,
      },
    ],
    payment: {
      method: { type: String, default: "cash" }, // only cash for Phase 1
      amount: Number,
      change: Number,
    },
    total: {
      subtotal: Number,
      tax: { type: Number, default: 0 }, // simple percentage
      discount: { type: Number, default: 0 }, // simple amount
      final: Number,
    },
    cashier: {
      id: String, // Clerk user ID
      name: String,
    },
    status: {
      type: String,
      enum: ["completed", "voided"],
      default: "completed",
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt
  }
);

module.exports = mongoose.models.Sale || mongoose.model("Sale", SaleSchema);
```

### 5. **Stock Movements Collection** (Simple Tracking)

```javascript
// models/StockMovement.js
const mongoose = require("mongoose");

const StockMovementSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    type: { type: String, enum: ["in", "out", "adjustment"], required: true },
    quantity: { type: Number, required: true },
    previousStock: Number,
    newStock: Number,
    reference: String, // sale ID or manual
    notes: String,
    createdBy: String, // Clerk user ID
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

module.exports =
  mongoose.models.StockMovement ||
  mongoose.model("StockMovement", StockMovementSchema);
```

## **Collections untuk Phase 2-3** (Future Implementation)

### 6. **Purchases Collection** (Phase 2)

```javascript
// models/Purchase.js (untuk nanti)
const PurchaseSchema = new mongoose.Schema(
  {
    referenceNumber: String,
    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: String,
        costPrice: Number,
        quantity: Number,
        total: Number,
      },
    ],
    total: Number,
    notes: String,
    receivedBy: {
      id: String, // Clerk user ID
      name: String,
    },
    status: { type: String, enum: ["received", "pending"], default: "pending" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);
```

### 7. **Customers Collection** (Phase 3)

```javascript
// models/Customer.js (untuk nanti)
const CustomerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    totalPurchases: { type: Number, default: 0 },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);
```

## **Database Connection Setup**

```javascript
// lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;
```

## **Database Indexes - Phase 1**

```javascript
// Products
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ "category.id": 1 });
db.products.createIndex({ status: 1 });

// Categories
db.categories.createIndex({ name: 1 }, { unique: true });
db.categories.createIndex({ status: 1 });

// Sales
db.sales.createIndex({ transactionNumber: 1 }, { unique: true });
db.sales.createIndex({ "cashier.id": 1 });
db.sales.createIndex({ createdAt: -1 });

// Stock Movements
db.stockMovements.createIndex({ productId: 1 });
db.stockMovements.createIndex({ createdAt: -1 });
```

## **Development Priority**

**Phase 1** (Immediate):

1. ✅ Products (existing)
2. 🆕 Categories
3. 🆕 Sales (POS)
4. 🆕 Stock Movements

**Phase 2** (Later):

- Purchases (stock in)
- Basic reporting

**Phase 3** (Future):

- Customers
- Advanced reporting
- Analytics

## **Key Simplifications untuk JavaScript**

❌ **Removed from original:**

- TypeScript complexity
- Interface definitions
- Type annotations
- Image uploads
- Barcode generation
- Multiple payment methods
- Customer loyalty
- Supplier management
- Complex reporting
- File attachments
- Third-party integrations

✅ **JavaScript Phase 1 Focus:**

- Pure JavaScript ES6+
- Simple Mongoose schemas
- Enhanced product management
- Simple categorization
- Cash-only POS
- Basic stock tracking
- Simple receipts
- Manual operations

## **File Extensions Changed:**

- ✅ `.js` instead of `.ts`
- ✅ `.jsx` instead of `.tsx` (if needed)
- ✅ No `tsconfig.json`
- ✅ No type definitions
- ✅ Native JavaScript validation

Ready untuk development dengan JavaScript! 🎯
