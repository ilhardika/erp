# MongoDB Schema untuk BizFlow ERP+POS

## 🗄️ Database Collections Structure

### 1. **Users Collection** (Clerk Integration)

```javascript
{
  _id: ObjectId,
  clerkUserId: String, // Clerk user ID
  email: String,
  name: String,
  role: String, // admin, kasir, gudang, sales, keuangan, owner
  employee: {
    employeeId: String,
    department: String,
    position: String,
    salary: Number,
    joinDate: Date,
    isActive: Boolean
  },
  permissions: [String], // array of permission codes
  createdAt: Date,
  updatedAt: Date
}
```

### 2. **Products Collection**

```javascript
{
  _id: ObjectId,
  sku: String, // unique
  name: String,
  description: String,
  category: {
    id: ObjectId,
    name: String
  },
  barcode: String,
  unit: String, // pcs, kg, liter, etc
  price: {
    cost: Number, // harga beli
    selling: Number, // harga jual
    wholesale: Number // harga grosir
  },
  stock: {
    quantity: Number,
    minQuantity: Number, // reorder point
    maxQuantity: Number,
    location: String
  },
  supplier: {
    id: ObjectId,
    name: String
  },
  status: String, // active, inactive, discontinued
  images: [String], // array of image URLs
  createdAt: Date,
  updatedAt: Date
}
```

### 3. **Transactions Collection** (POS Sales)

```javascript
{
  _id: ObjectId,
  transactionNumber: String, // auto generated
  type: String, // sale, refund, exchange
  cashier: {
    id: ObjectId,
    name: String
  },
  customer: {
    id: ObjectId,
    name: String,
    phone: String
  },
  items: [{
    productId: ObjectId,
    sku: String,
    name: String,
    quantity: Number,
    price: Number,
    discount: {
      type: String, // percent, amount
      value: Number
    },
    subtotal: Number
  }],
  payment: {
    method: String, // cash, transfer, qris, split
    cash: Number,
    transfer: Number,
    qris: Number,
    change: Number
  },
  totals: {
    subtotal: Number,
    discount: Number,
    tax: Number,
    total: Number
  },
  notes: String,
  status: String, // completed, refunded, cancelled
  createdAt: Date,
  updatedAt: Date
}
```

### 4. **Inventory Movements Collection**

```javascript
{
  _id: ObjectId,
  type: String, // in, out, transfer, adjustment
  productId: ObjectId,
  quantity: Number,
  previousStock: Number,
  newStock: Number,
  reference: {
    type: String, // purchase, sale, transfer, adjustment
    id: ObjectId,
    number: String
  },
  location: {
    from: String,
    to: String
  },
  notes: String,
  createdBy: ObjectId,
  createdAt: Date
}
```

### 5. **Customers Collection**

```javascript
{
  _id: ObjectId,
  customerCode: String,
  name: String,
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String
  },
  type: String, // retail, wholesale, vip
  creditLimit: Number,
  balance: Number, // outstanding balance
  discount: Number, // customer specific discount
  loyaltyPoints: Number,
  lastPurchase: Date,
  totalPurchases: Number,
  status: String, // active, inactive, blocked
  createdAt: Date,
  updatedAt: Date
}
```

### 6. **Sales Orders Collection**

```javascript
{
  _id: ObjectId,
  orderNumber: String,
  customer: {
    id: ObjectId,
    name: String,
    phone: String
  },
  salesperson: {
    id: ObjectId,
    name: String
  },
  items: [{
    productId: ObjectId,
    sku: String,
    name: String,
    quantity: Number,
    price: Number,
    discount: Number,
    subtotal: Number
  }],
  totals: {
    subtotal: Number,
    discount: Number,
    tax: Number,
    total: Number
  },
  status: String, // draft, confirmed, shipped, completed, cancelled
  deliveryDate: Date,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### 7. **Suppliers Collection**

```javascript
{
  _id: ObjectId,
  supplierCode: String,
  name: String,
  contactPerson: String,
  phone: String,
  email: String,
  address: {
    street: String,
    city: String,
    province: String,
    postalCode: String
  },
  paymentTerms: String, // cash, 30 days, 60 days
  taxNumber: String,
  bankAccount: {
    bank: String,
    accountNumber: String,
    accountName: String
  },
  status: String, // active, inactive
  createdAt: Date,
  updatedAt: Date
}
```

### 8. **Purchase Orders Collection**

```javascript
{
  _id: ObjectId,
  poNumber: String,
  supplier: {
    id: ObjectId,
    name: String
  },
  items: [{
    productId: ObjectId,
    sku: String,
    name: String,
    quantity: Number,
    price: Number,
    subtotal: Number
  }],
  totals: {
    subtotal: Number,
    discount: Number,
    tax: Number,
    total: Number
  },
  status: String, // draft, sent, received, completed, cancelled
  expectedDate: Date,
  receivedDate: Date,
  notes: String,
  createdBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### 9. **Accounting Journals Collection**

```javascript
{
  _id: ObjectId,
  journalNumber: String,
  type: String, // sale, purchase, payment, receipt, adjustment
  reference: {
    type: String, // transaction, po, so, payment
    id: ObjectId,
    number: String
  },
  entries: [{
    account: {
      code: String,
      name: String
    },
    debit: Number,
    credit: Number,
    description: String
  }],
  totalDebit: Number,
  totalCredit: Number,
  status: String, // draft, posted
  postedBy: ObjectId,
  postedAt: Date,
  createdAt: Date
}
```

### 10. **Attendance Collection**

```javascript
{
  _id: ObjectId,
  employeeId: ObjectId,
  date: Date,
  checkIn: Date,
  checkOut: Date,
  workingHours: Number,
  overtime: Number,
  notes: String,
  status: String, // present, late, absent, sick, leave
  approvedBy: ObjectId,
  createdAt: Date
}
```

## 🔗 Relationships & Indexes

### Recommended Indexes:

```javascript
// Products
db.products.createIndex({ sku: 1 }, { unique: true });
db.products.createIndex({ barcode: 1 }, { unique: true });
db.products.createIndex({ "category.name": 1 });

// Transactions
db.transactions.createIndex({ transactionNumber: 1 }, { unique: true });
db.transactions.createIndex({ createdAt: -1 });
db.transactions.createIndex({ "cashier.id": 1 });

// Customers
db.customers.createIndex({ customerCode: 1 }, { unique: true });
db.customers.createIndex({ phone: 1 });

// Inventory Movements
db.inventoryMovements.createIndex({ productId: 1, createdAt: -1 });
db.inventoryMovements.createIndex({ createdAt: -1 });
```

## 📊 Aggregation Queries Examples

### Daily Sales Report:

```javascript
db.transactions.aggregate([
  {
    $match: {
      createdAt: {
        $gte: new Date("2025-01-26T00:00:00Z"),
        $lt: new Date("2025-01-27T00:00:00Z"),
      },
      status: "completed",
    },
  },
  {
    $group: {
      _id: null,
      totalSales: { $sum: "$totals.total" },
      totalTransactions: { $sum: 1 },
      averageTransaction: { $avg: "$totals.total" },
    },
  },
]);
```

### Top Selling Products:

```javascript
db.transactions.aggregate([
  { $match: { status: "completed" } },
  { $unwind: "$items" },
  {
    $group: {
      _id: "$items.productId",
      productName: { $first: "$items.name" },
      totalQuantity: { $sum: "$items.quantity" },
      totalRevenue: { $sum: "$items.subtotal" },
    },
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 10 },
]);
```

Ready untuk implementasi database MongoDB dengan schema yang comprehensive! 🚀
