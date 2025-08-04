"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Users,
  UserPlus,
  Gift,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShoppingBag,
  Truck,
  Warehouse,
  Building2,
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/verify");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        router.push("/login");
      }
    } catch (error) {
      router.push("/login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const getMenuItems = () => {
    const allMenuItems = [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        href: "/dashboard",
        roles: ["admin", "manager", "staff"],
      },
      {
        icon: ShoppingCart,
        label: "POS",
        href: "/dashboard/pos",
        roles: ["admin", "manager", "staff"],
        subItems: [
          { label: "Terminal POS", href: "/dashboard/pos" },
          { label: "Riwayat Transaksi", href: "/dashboard/pos/history" },
          { label: "Manajemen Shift", href: "/dashboard/pos/shift" },
        ],
      },
      {
        icon: ShoppingBag,
        label: "Penjualan",
        href: "/dashboard/sales",
        roles: ["admin", "manager", "staff"],
        subItems: [
          { label: "Pesanan Penjualan", href: "/dashboard/sales/orders" },
          { label: "Buat Pesanan", href: "/dashboard/sales/create" },
        ],
      },
      {
        icon: Truck,
        label: "Pembelian",
        href: "/dashboard/purchases",
        roles: ["admin", "manager"],
        subItems: [
          { label: "Invoice Pembelian", href: "/dashboard/purchases/invoices" },
          { label: "Penerimaan Barang", href: "/dashboard/purchases/receive" },
        ],
      },
      {
        icon: Package,
        label: "Produk",
        href: "/dashboard/products",
        roles: ["admin", "manager", "staff"],
      },
      {
        icon: Warehouse,
        label: "Inventori",
        href: "/dashboard/inventory",
        roles: ["admin", "manager", "staff"],
        subItems: [
          { label: "Stock Opname", href: "/dashboard/inventory/stock-opname" },
          { label: "Mutasi Stock", href: "/dashboard/inventory/mutation" },
        ],
      },
      {
        icon: Users,
        label: "Pelanggan",
        href: "/dashboard/customers",
        roles: ["admin", "manager", "staff"],
      },
      {
        icon: Building2,
        label: "Supplier",
        href: "/dashboard/suppliers",
        roles: ["admin", "manager"],
      },
      {
        icon: Gift,
        label: "Promosi",
        href: "/dashboard/promotions",
        roles: ["admin", "manager"],
      },
      {
        icon: UserPlus,
        label: "Karyawan",
        href: "/dashboard/employees",
        roles: ["admin", "manager"],
        subItems: [
          { label: "Direktori Karyawan", href: "/dashboard/employees" },
          { label: "Absensi", href: "/dashboard/attendance" },
          { label: "Penggajian", href: "/dashboard/payroll" },
        ],
      },
      {
        icon: DollarSign,
        label: "Keuangan",
        href: "/dashboard/finance",
        roles: ["admin", "manager"],
        subItems: [
          { label: "Transaksi", href: "/dashboard/finance/transactions" },
          { label: "Entri Jurnal", href: "/dashboard/finance/journal" },
          { label: "Neraca", href: "/dashboard/finance/balance-sheet" },
          { label: "Laba Rugi", href: "/dashboard/finance/profit-loss" },
        ],
      },
      {
        icon: BarChart3,
        label: "Laporan",
        href: "/dashboard/reports",
        roles: ["admin", "manager"],
        subItems: [
          { label: "Laporan Penjualan", href: "/dashboard/reports/sales" },
          { label: "Laporan Produk", href: "/dashboard/reports/products" },
          { label: "Laporan Stock", href: "/dashboard/reports/stock" },
          { label: "Laporan Sales", href: "/dashboard/reports/salesman" },
          { label: "Laporan Keuangan", href: "/dashboard/reports/finance" },
        ],
      },
      {
        icon: Settings,
        label: "Pengaturan",
        href: "/dashboard/settings",
        roles: ["admin"],
        subItems: [
          { label: "Pengguna", href: "/dashboard/settings/users" },
          { label: "Perusahaan", href: "/dashboard/settings/company" },
          { label: "Izin Akses", href: "/dashboard/settings/permissions" },
          { label: "Backup", href: "/dashboard/settings/backup" },
        ],
      },
    ];

    return allMenuItems.filter(
      (item) => user && item.roles.includes(user.role)
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const menuItems = getMenuItems();

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0">
          <h1 className="text-xl font-bold text-blue-600">Bizflow ERP</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-4 px-4 flex-1 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start text-left hover:bg-blue-50 hover:text-blue-700"
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Button>
              );
            })}
          </div>
        </nav>

        {/* User Info and Logout - Fixed at bottom */}
        <div className="border-t p-4 space-y-3">
          <div className="flex items-center space-x-3 px-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-blue-700">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 uppercase">{user.role}</p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden sm:inline">
              Welcome back, {user.name}
            </span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-medium">
              {user.role.toUpperCase()}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
