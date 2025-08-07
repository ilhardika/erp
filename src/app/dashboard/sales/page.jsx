"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, TrendingUp, ShoppingBag, Users, DollarSign } from "lucide-react";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export default function SalesDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/sales/stats");
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error("Error fetching sales stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  const totalOrders =
    stats?.status_counts?.reduce(
      (sum, item) => sum + parseInt(item.count),
      0
    ) || 0;
  const totalValue =
    stats?.status_counts?.reduce(
      (sum, item) => sum + parseFloat(item.total_value),
      0
    ) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Dashboard</h1>
          <p className="text-gray-600">Overview penjualan dan pesanan</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/sales/orders/create")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Order Baru
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              +12% dari bulan lalu
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">+8% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalOrders > 0 ? totalValue / totalOrders : 0)}
            </div>
            <p className="text-xs text-muted-foreground">-2% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.top_customers?.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active customers</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Status Pesanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.status_counts?.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Badge
                      className={
                        statusColors[item.status] || "bg-gray-100 text-gray-800"
                      }
                    >
                      {item.status}
                    </Badge>
                    <span className="text-sm">{item.count} orders</span>
                  </div>
                  <span className="font-medium">
                    {formatCurrency(item.total_value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/sales/orders")}
                className="w-full"
              >
                Lihat Semua Pesanan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Pesanan Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recent_orders?.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-blue-600">
                      {order.order_number}
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.customer_name}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">
                      {formatCurrency(order.total_amount)}
                    </div>
                    <Badge
                      className={
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-800"
                      }
                    >
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => router.push("/dashboard/sales/orders")}
                className="w-full"
              >
                Lihat Semua Pesanan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers & Salesperson */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.top_customers?.slice(0, 5).map((customer, index) => (
                <div
                  key={customer.customer_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">
                        {customer.customer_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {customer.order_count} orders
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(customer.total_value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Salesperson</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.top_salesperson?.slice(0, 5).map((salesperson, index) => (
                <div
                  key={salesperson.salesperson_id}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">
                        {salesperson.salesperson_name || "No Name"}
                      </div>
                      <div className="text-sm text-gray-500">
                        {salesperson.order_count} orders
                      </div>
                    </div>
                  </div>
                  <div className="font-medium">
                    {formatCurrency(salesperson.total_value)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
