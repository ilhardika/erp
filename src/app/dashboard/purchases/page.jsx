"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePurchaseStats } from "@/hooks/use-purchases";
import { formatIDR } from "@/lib/utils";
import {
  ShoppingCart,
  TruckIcon,
  Package,
  DollarSign,
  Plus,
  FileText,
  BarChart3,
} from "lucide-react";

export default function PurchasesPage() {
  const router = useRouter();
  const { data: stats, isLoading } = usePurchaseStats();

  const menuItems = [
    {
      title: "Purchase Orders",
      description: "Kelola purchase order dan pembelian barang",
      icon: FileText,
      href: "/dashboard/purchases/orders",
      color: "bg-gray-100",
      stats: stats?.total_orders || 0,
      statsLabel: "Total PO",
    },
    {
      title: "Buat Purchase Order",
      description: "Buat purchase order baru untuk pembelian",
      icon: Plus,
      href: "/dashboard/purchases/orders/create",
      color: "bg-gray-100",
      stats: stats?.draft_orders || 0,
      statsLabel: "Draft PO",
    },
    {
      title: "Penerimaan Barang",
      description: "Kelola penerimaan barang dari supplier",
      icon: TruckIcon,
      href: "/dashboard/purchases/receive",
      color: "bg-gray-100",
      stats: "Coming Soon",
      statsLabel: "Status",
    },
    {
      title: "Laporan Pembelian",
      description: "Analisis dan laporan pembelian",
      icon: BarChart3,
      href: "/dashboard/purchases/reports",
      color: "bg-gray-100",
      stats: "Coming Soon",
      statsLabel: "Status",
    },
  ];

  const quickStats = [
    {
      title: "Total Purchase Orders",
      value: stats?.total_orders || 0,
      icon: FileText,
      color: "text-gray-600",
    },
    {
      title: "Total Pembelian",
      value: formatIDR(stats?.total_amount || 0),
      icon: DollarSign,
      color: "text-gray-600",
    },
    {
      title: "PO Aktif",
      value: stats?.active_orders || 0,
      icon: ShoppingCart,
      color: "text-gray-600",
    },
    {
      title: "Supplier Aktif",
      value: stats?.active_suppliers || 0,
      icon: Package,
      color: "text-gray-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Modul Pembelian</h1>
        <p className="text-muted-foreground mt-2">
          Kelola purchase order, penerimaan barang, dan analisis pembelian
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">
                    {isLoading ? "..." : stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Menu Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {menuItems.map((item, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => router.push(item.href)}
          >
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${item.color} text-gray-600`}>
                  <item.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">
                    {isLoading ? "..." : item.stats}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.statsLabel}
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Aktivitas Terbaru
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : stats?.recent_orders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() =>
                    router.push(`/dashboard/purchases/orders/${order.id}`)
                  }
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">PO #{order.po_number}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.supplier_name}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatIDR(order.total_amount)}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Belum ada purchase order</p>
              <Button
                className="mt-4"
                onClick={() =>
                  router.push("/dashboard/purchases/orders/create")
                }
              >
                <Plus className="h-4 w-4 mr-2" />
                Buat Purchase Order Pertama
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
