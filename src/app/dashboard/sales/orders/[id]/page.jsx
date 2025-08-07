"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Download, Mail } from "lucide-react";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export default function SalesOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetail = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sales/orders/${orderId}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.data);
      } else {
        alert("Order tidak ditemukan");
        router.push("/dashboard/sales/orders");
      }
    } catch (error) {
      console.error("Error fetching order detail:", error);
      alert("Terjadi kesalahan saat mengambil data order");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetail();
    }
  }, [orderId]);

  const handleDelete = async () => {
    if (!confirm("Apakah Anda yakin ingin menghapus sales order ini?")) return;

    try {
      const response = await fetch(`/api/sales/orders/${orderId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Sales order berhasil dihapus");
        router.push("/dashboard/sales/orders");
      } else {
        alert("Gagal menghapus sales order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Terjadi kesalahan saat menghapus sales order");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Order tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/sales/orders")}
          className="shrink-0 p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-start md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              {order.order_number}
            </h1>
            <p className="text-gray-600 text-sm md:text-base">
              Detail Sales Order
            </p>
          </div>
        </div>

        {/* Action Buttons - Responsive Grid */}
        <div className="grid grid-cols-2 md:flex md:space-x-2 gap-2 md:gap-0">
          <Button variant="outline" className="text-xs md:text-sm">
            <Download className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Download </span>PDF
          </Button>
          <Button variant="outline" className="text-xs md:text-sm">
            <Mail className="h-4 w-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Email </span>Customer
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              router.push(`/dashboard/sales/orders/${orderId}/edit`)
            }
            className="text-xs md:text-sm"
          >
            <Edit className="h-4 w-4 mr-1 md:mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 text-xs md:text-sm"
          >
            <Trash2 className="h-4 w-4 mr-1 md:mr-2" />
            Hapus
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Details */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Order</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Order Number
                  </label>
                  <p className="font-medium text-blue-600">
                    {order.order_number}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div>
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
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Order Date
                  </label>
                  <p>{formatDate(order.order_date)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Delivery Date
                  </label>
                  <p>{formatDate(order.delivery_date)}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Notes
                  </label>
                  <p>{order.notes || "-"}</p>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Shipping Address
                  </label>
                  <p>{order.shipping_address || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Item Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Product</th>
                      <th className="text-center py-2">Qty</th>
                      <th className="text-right py-2">Unit Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="py-3">
                          <div>
                            <div className="font-medium">
                              {item.product_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {item.product_code} - {item.product_category}
                            </div>
                          </div>
                        </td>
                        <td className="text-center py-3">
                          {item.quantity} {item.product_unit}
                        </td>
                        <td className="text-right py-3">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="text-right py-3 font-medium">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Name
                  </label>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Code
                  </label>
                  <p>{order.customer_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p>{order.customer_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p>{order.customer_email || "-"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Address
                  </label>
                  <p className="text-sm">{order.customer_address || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salesperson */}
          {order.salesperson_name && (
            <Card>
              <CardHeader>
                <CardTitle>Salesperson</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="font-medium">{order.salesperson_name}</p>
                  <p className="text-sm text-gray-500">
                    {order.salesperson_email || ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount ({order.discount_percentage}%)</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Tax ({order.tax_percentage}%)</span>
                  <span>{formatCurrency(order.tax_amount)}</span>
                </div>
                {order.shipping_cost > 0 && (
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{formatCurrency(order.shipping_cost)}</span>
                  </div>
                )}
                <hr />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
