"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        roles: ["admin", "cashier", "warehouse", "sales", "hr"],
      },
      {
        icon: ShoppingCart,
        label: "POS",
        href: "/dashboard/pos",
        roles: ["admin", "cashier"],
      },
      {
        icon: Package,
        label: "Sales Orders",
        href: "/dashboard/sales",
        roles: ["admin", "sales"],
      },
      {
        icon: Package,
        label: "Purchasing",
        href: "/dashboard/purchases",
        roles: ["admin", "warehouse"],
      },
      {
        icon: Package,
        label: "Products",
        href: "/dashboard/products",
        roles: ["admin", "warehouse"],
      },
      {
        icon: Package,
        label: "Inventory",
        href: "/dashboard/inventory",
        roles: ["admin", "warehouse"],
      },
      {
        icon: Users,
        label: "Customers",
        href: "/dashboard/customers",
        roles: ["admin", "sales"],
      },
      {
        icon: Users,
        label: "Suppliers",
        href: "/dashboard/suppliers",
        roles: ["admin", "warehouse"],
      },
      {
        icon: Gift,
        label: "Promotions",
        href: "/dashboard/promotions",
        roles: ["admin", "sales"],
      },
      {
        icon: UserPlus,
        label: "HR",
        href: "/dashboard/employees",
        roles: ["admin", "hr"],
      },
      {
        icon: DollarSign,
        label: "Finance",
        href: "/dashboard/finance",
        roles: ["admin"],
      },
      {
        icon: BarChart3,
        label: "Reports",
        href: "/dashboard/reports",
        roles: ["admin"],
      },
      {
        icon: Settings,
        label: "Settings",
        href: "/dashboard/settings",
        roles: ["admin"],
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
          <p className="mt-2 text-sm text-gray-600">Loading...</p>
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
        } transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
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

        <nav className="mt-4 px-4">
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Bar */}
        <header className="bg-white shadow-sm border-b h-16 flex items-center justify-between px-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user.name}</span>
            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
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
