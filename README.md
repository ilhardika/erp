# 🏢 **Bizflow ERP + POS System**

Modern, comprehensive Enterprise Resource Planning (ERP) and Point of Sale (POS) system built with Next.js, designed for small to medium businesses.

![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8)
![Neon DB](https://img.shields.io/badge/Neon-PostgreSQL-green)

## 📋 **Overview**

Bizflow is a unified ERP and POS solution that streamlines business operations through a single, intuitive dashboard. Built with modern web technologies, it offers role-based access control and comprehensive business management features.

## ✨ **Key Features**

### 🛒 **Point of Sale (POS)**

- Interactive cashier interface with cart management
- Multiple payment methods (cash, transfer, QR simulation)
- Real-time inventory updates
- PDF invoice generation
- Transaction history and reporting
- Daily cashier shift management

### 📦 **Inventory & Warehouse Management**

- Product catalog with categories and variants
- Stock level monitoring and alerts
- Inter-warehouse transfers
- Stock opname and adjustments
- Barcode support (manual input)
- Supplier management

### 💰 **Sales & Purchase Management**

- Sales order creation and tracking
- Purchase order workflow with approval system
- Supplier and customer relationship management
- Price management and discount systems
- Commission tracking for sales staff

### 👥 **Customer & Supplier Management**

- Customer segmentation and history
- Supplier performance tracking
- Contact management
- Purchase and payment history

### 💳 **Financial Management**

- Journal entry system
- General ledger
- Profit & loss statements
- Balance sheet reports
- Cash flow tracking
- Financial period management

### 🧑‍💼 **Human Resources**

- Employee management
- Attendance tracking (manual input)
- Salary slip generation
- Role and permission management

### 🚗 **Fleet Management**

- Vehicle registration and tracking
- Delivery assignment
- Maintenance scheduling

## 🛠️ **Tech Stack**

- **Frontend**: Next.js 15.4.5 (App Router), React 19
- **Styling**: Tailwind CSS, shadcn/ui components
- **Database**: Neon PostgreSQL (Serverless)
- **Authentication**: Custom JWT-based auth
- **State Management**: React Hooks + Context
- **Tables**: TanStack Table (React Table v8)
- **Icons**: Lucide React
- **Forms**: Custom form components

## 🏗️ **Architecture**

### **Role-Based Access Control**

- **Admin**: Full system access and configuration
- **Cashier**: POS operations and transaction management
- **Warehouse**: Inventory and stock management
- **Sales**: Customer management and order creation
- **HR**: Employee and attendance management
- **Accountant**: Financial operations and reporting

### **Unified Dashboard**

All roles access the same dashboard with dynamically filtered modules based on permissions.

## 🚀 **Getting Started**

### **Prerequisites**

- Node.js 18+
- npm or yarn
- Neon PostgreSQL database

### **Installation**

1. **Clone the repository**

```bash
git clone https://github.com/ilhardika/erp.git
cd erp
```

2. **Install dependencies**

```bash
npm install
```

3. **Environment setup**
   Create `.env.local` file:

```env
# Database
DATABASE_URL="your_neon_postgresql_url"

# Authentication
JWT_SECRET="your_jwt_secret_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

4. **Run the development server**

```bash
npm run dev
```

5. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 **Project Structure**

```
src/
├── app/
│   ├── api/                 # API routes
│   │   ├── auth/           # Authentication endpoints
│   │   ├── products/       # Product management
│   │   ├── purchases/      # Purchase orders
│   │   ├── sales/          # Sales management
│   │   └── pos/            # POS operations
│   ├── dashboard/          # Main application pages
│   │   ├── products/       # Product management
│   │   ├── purchases/      # Purchase orders
│   │   ├── sales/          # Sales management
│   │   ├── pos/            # Point of Sale
│   │   ├── customers/      # Customer management
│   │   └── suppliers/      # Supplier management
│   └── login/              # Authentication pages
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── columns/            # Data table column definitions
│   └── layouts/            # Layout components
├── lib/
│   ├── neon.js            # Database connection
│   └── utils.js           # Utility functions
└── hooks/                  # Custom React hooks
```

## 🔧 **Available Scripts**

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## 🗄️ **Database Schema**

The system uses PostgreSQL with the following main tables:

- `users` - User authentication and roles
- `products` - Product catalog
- `customers` - Customer information
- `suppliers` - Supplier information
- `purchase_orders` - Purchase order management
- `sales_orders` - Sales order tracking
- `transactions` - POS transactions
- `inventory` - Stock levels and movements

## 📈 **Features in Development**

- [ ] Real-time notifications
- [ ] Advanced reporting dashboard
- [ ] Mobile app companion
- [ ] Integration with payment gateways
- [ ] Advanced inventory forecasting
- [ ] Multi-location support

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 **Author**

**ilhardika**

- GitHub: [@ilhardika](https://github.com/ilhardika)

## 🙏 **Acknowledgments**

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Database powered by [Neon](https://neon.tech/)
- Icons by [Lucide](https://lucide.dev/)

---

**🚀 Ready to streamline your business operations with Bizflow ERP!**
