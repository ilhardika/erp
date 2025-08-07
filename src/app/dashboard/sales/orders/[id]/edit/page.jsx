"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";

const statusOptions = [
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export default function EditSalesOrderPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    customer_id: "",
    salesperson_id: "",
    order_date: "",
    delivery_date: "",
    status: "",
    notes: "",
    shipping_address: "",
    terms_conditions: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);

      const [orderRes, customersRes, usersRes] = await Promise.all([
        fetch(`/api/sales/orders/${orderId}`),
        fetch("/api/customers"),
        fetch("/api/users"),
      ]);

      const [orderData, customersData, usersData] = await Promise.all([
        orderRes.json(),
        customersRes.json(),
        usersRes.json(),
      ]);

      if (orderData.success) {
        setOrder(orderData.data);
        setFormData({
          customer_id: orderData.data.customer_id || "",
          salesperson_id: orderData.data.salesperson_id || "",
          order_date: orderData.data.order_date || "",
          delivery_date: orderData.data.delivery_date || "",
          status: orderData.data.status || "",
          notes: orderData.data.notes || "",
          shipping_address: orderData.data.shipping_address || "",
          terms_conditions: orderData.data.terms_conditions || "",
        });
      } else {
        alert("Order tidak ditemukan");
        router.push("/dashboard/sales/orders");
      }

      if (customersData.success) setCustomers(customersData.data);
      if (usersData.success) {
        const salesUsers = usersData.data.filter(
          (user) => user.role === "admin" || user.role === "sales"
        );
        setUsers(salesUsers);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      alert("Terjadi kesalahan saat mengambil data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchData();
    }
  }, [orderId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id) {
      alert("Pilih customer terlebih dahulu");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(`/api/sales/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Sales order berhasil diupdate!");
        router.push(`/dashboard/sales/orders/${orderId}`);
      } else {
        alert(`Gagal update sales order: ${data.error}`);
      }
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Terjadi kesalahan saat mengupdate sales order");
    } finally {
      setSaving(false);
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
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
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
          onClick={() => router.push(`/dashboard/sales/orders/${orderId}`)}
          className="shrink-0 p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">
            Edit Pesanan Penjualan
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            {order.order_number}
          </p>
        </div>
        <Button type="submit" form="edit-form" disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <form id="edit-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Order</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Order Number
                    </label>
                    <input
                      type="text"
                      value={order.order_number}
                      disabled
                      className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-600"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Customer *
                    </label>
                    <select
                      value={formData.customer_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          customer_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">Pilih Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name} - {customer.phone}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Salesperson
                    </label>
                    <select
                      value={formData.salesperson_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salesperson_id: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Pilih Salesperson</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.full_name || user.username}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Order Date
                    </label>
                    <input
                      type="date"
                      value={formatDate(formData.order_date)}
                      onChange={(e) =>
                        setFormData({ ...formData, order_date: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Delivery Date
                    </label>
                    <input
                      type="date"
                      value={formatDate(formData.delivery_date)}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          delivery_date: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Shipping Address
                    </label>
                    <textarea
                      value={formData.shipping_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping_address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Alamat pengiriman..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Terms & Conditions
                    </label>
                    <textarea
                      value={formData.terms_conditions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terms_conditions: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Syarat dan ketentuan..."
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="2"
                      placeholder="Catatan tambahan..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items (Read Only) */}
            <Card>
              <CardHeader>
                <CardTitle>Item Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-yellow-700">
                    <strong>Note:</strong> Untuk mengubah item pesanan, silakan
                    hapus order ini dan buat order baru.
                  </p>
                </div>
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
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Saat Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    statusColors[order.status] || "bg-gray-100 text-gray-800"
                  }
                >
                  {order.status}
                </Badge>
              </CardContent>
            </Card>

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

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Menyimpan..." : "Update Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  router.push(`/dashboard/sales/orders/${orderId}`)
                }
                className="w-full"
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
