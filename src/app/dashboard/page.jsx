"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  AlertTriangle,
  Building2,
  UserCheck,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Share2,
  Download,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePWA } from "@/hooks/use-pwa";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    overview: {
      totalProducts: 0,
      totalCustomers: 0,
      totalSuppliers: 0,
      totalUsers: 0,
      lowStockProducts: 0,
    },
    sales: {
      todayTransactions: 0,
      monthlyTransactions: 0,
      todaySales: 0,
      monthlySales: 0,
    },
    recent: {
      orders: [],
      activities: [],
    },
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { isOnline, isInstallable, installApp, shareApp, isStandalone } =
    usePWA();

  const handleInstallApp = async () => {
    const installed = await installApp();
    if (installed) {
      alert("App installed successfully!");
    }
  };

  const handleShareApp = async () => {
    const shared = await shareApp({
      title: "ERP Dashboard",
      text: "Check out our ERP management system dashboard",
    });
    if (shared && !navigator.share) {
      alert("Dashboard link copied to clipboard!");
    }
  };

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
        }
    };

    // Get dashboard stats
    const getStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        } finally {
        setLoading(false);
      }
    };

    getUserInfo();
    getStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak tersedia";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Format tanggal tidak valid";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const overviewCards = [
    {
      title: "Total Produk",
      value: stats.overview.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      href: "/dashboard/products",
    },
    {
      title: "Total Pelanggan",
      value: stats.overview.totalCustomers,
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
      href: "/dashboard/customers",
    },
    {
      title: "Total Supplier",
      value: stats.overview.totalSuppliers,
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      href: "/dashboard/suppliers",
    },
    {
      title: "Pengguna Aktif",
      value: stats.overview.totalUsers,
      icon: UserCheck,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      href: "/dashboard/settings/users",
    },
  ];

  const salesCards = [
    {
      title: "Penjualan Hari Ini",
      value: formatCurrency(stats.sales.todaySales),
      subtitle: `${stats.sales.todayTransactions} transaksi`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "up",
      href: "/dashboard/pos",
    },
    {
      title: "Penjualan Bulan Ini",
      value: formatCurrency(stats.sales.monthlySales),
      subtitle: `${stats.sales.monthlyTransactions} transaksi`,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "up",
      href: "/dashboard/reports/sales",
    },
    {
      title: "Low Stock Alert",
      value: stats.overview.lowStockProducts,
      subtitle: "products need restocking",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      trend: stats.overview.lowStockProducts > 0 ? "down" : "neutral",
      href: "/dashboard/inventory",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Ringkasan Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Selamat datang kembali, {user?.name}! Berikut ringkasan bisnis Anda.
            {!isOnline && (
              <span className="text-red-500 ml-2">(Offline Mode)</span>
            )}
          </p>
        </div>
        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          {isInstallable && (
            <Button onClick={handleInstallApp} variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Install App
            </Button>
          )}
          <Button onClick={handleShareApp} variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button
            onClick={() => router.push("/dashboard/pos")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Buka POS
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ikhtisar Bisnis
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {overviewCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(card.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">
                        {card.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900">
                        {card.value.toLocaleString()}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${card.bgColor}`}>
                      <Icon className={`w-6 h-6 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Sales & Alerts Cards */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Performa Penjualan & Peringatan
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {salesCards.map((card, index) => {
            const Icon = card.icon;
            const TrendIcon =
              card.trend === "up"
                ? ArrowUpRight
                : card.trend === "down"
                ? ArrowDownRight
                : Activity;
            return (
              <Card
                key={index}
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(card.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-full ${card.bgColor}`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <TrendIcon
                      className={`w-4 h-4 ${
                        card.trend === "up"
                          ? "text-green-500"
                          : card.trend === "down"
                          ? "text-red-500"
                          : "text-gray-400"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {card.title}
                    </p>
                    <p className="text-xl font-bold text-gray-900 mb-1">
                      {card.value}
                    </p>
                    <p className="text-sm text-gray-500">{card.subtitle}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Tindakan Cepat
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            variant="outline"
            className="h-16 flex-col space-y-2"
            onClick={() => router.push("/dashboard/products/create")}
          >
            <Package className="w-5 h-5" />
            Tambah Produk
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col space-y-2"
            onClick={() => router.push("/dashboard/customers/create")}
          >
            <Users className="w-5 h-5" />
            Tambah Pelanggan
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col space-y-2"
            onClick={() => router.push("/dashboard/pos")}
          >
            <ShoppingCart className="w-5 h-5" />
            Terminal POS
          </Button>
          <Button
            variant="outline"
            className="h-16 flex-col space-y-2"
            onClick={() => router.push("/dashboard/reports")}
          >
            <BarChart3 className="w-5 h-5" />
            Lihat Laporan
          </Button>
        </div>
      </div>

      {/* Recent Activities (if any) */}
      {stats.recent.activities.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activities
          </h2>
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                {stats.recent.activities.slice(0, 5).map((activity, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">
                        {activity.description}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activity.created_at || activity.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

