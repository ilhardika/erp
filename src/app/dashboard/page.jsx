"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Calendar,
  Clock,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalProducts: 0,
    totalTransactions: 0,
    totalCustomers: 0,
    lowStockItems: 0,
    pendingOrders: 0,
  });

  useEffect(() => {
    // Get user info from auth verification
    const getUserInfo = async () => {
      try {
        const response = await fetch("/api/auth/verify");
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error("Error getting user info:", error);
      }
    };

    // Get dashboard stats
    const getStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats-mock");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error getting stats:", error);
      }
    };

    getUserInfo();
    getStats();
  }, []);

  const getRoleBasedCards = () => {
    if (!user) return [];

    const allCards = [
      {
        title: "Total Sales Today",
        value: `Rp ${stats.totalSales.toLocaleString()}`,
        icon: DollarSign,
        color: "text-green-600",
        bgColor: "bg-green-100",
        roles: ["admin", "cashier", "sales"],
      },
      {
        title: "Total Products",
        value: stats.totalProducts.toString(),
        icon: Package,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        roles: ["admin", "warehouse"],
      },
      {
        title: "Transactions Today",
        value: stats.totalTransactions.toString(),
        icon: ShoppingCart,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        roles: ["admin", "cashier"],
      },
      {
        title: "Total Customers",
        value: stats.totalCustomers.toString(),
        icon: Users,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        roles: ["admin", "sales"],
      },
      {
        title: "Low Stock Items",
        value: stats.lowStockItems.toString(),
        icon: AlertTriangle,
        color: "text-red-600",
        bgColor: "bg-red-100",
        roles: ["admin", "warehouse"],
      },
      {
        title: "Pending Orders",
        value: stats.pendingOrders.toString(),
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
        roles: ["admin", "sales", "warehouse"],
      },
    ];

    return allCards.filter((card) => card.roles.includes(user.role));
  };

  const getQuickActions = () => {
    if (!user) return [];

    const allActions = [
      {
        title: "New Sale",
        description: "Start a new POS transaction",
        href: "/dashboard/pos",
        icon: ShoppingCart,
        roles: ["admin", "cashier"],
      },
      {
        title: "Add Product",
        description: "Add new product to inventory",
        href: "/dashboard/products/create",
        icon: Package,
        roles: ["admin", "warehouse"],
      },
      {
        title: "Sales Order",
        description: "Create new sales order",
        href: "/dashboard/sales/create",
        icon: TrendingUp,
        roles: ["admin", "sales"],
      },
      {
        title: "Stock Check",
        description: "Perform stock opname",
        href: "/dashboard/inventory/stock-opname",
        icon: AlertTriangle,
        roles: ["admin", "warehouse"],
      },
    ];

    return allActions.filter((action) => action.roles.includes(user.role));
  };

  const cards = getRoleBasedCards();
  const quickActions = getQuickActions();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          {user ? `Welcome back, ${user.name}!` : "Loading..."}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <div className={`${card.bgColor} p-2 rounded-full`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Card
                key={index}
                className="cursor-pointer hover:shadow-lg transition-shadow"
              >
                <CardHeader className="text-center">
                  <div className="mx-auto bg-blue-100 p-3 rounded-full w-fit">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-lg">{action.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-sm text-gray-600">{action.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recent Activity - Coming Soon */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="mx-auto h-12 w-12 mb-4 opacity-50" />
            <p>
              Activity tracking akan tersedia setelah fitur-fitur utama selesai
              diimplementasi.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
