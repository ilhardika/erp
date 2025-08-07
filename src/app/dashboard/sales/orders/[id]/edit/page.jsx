"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save } from "lucide-react";
import { formatCurrency } from "@/lib/format-utils";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/sales-constants";

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
        router.push(`/dashboard/sales/orders/${orderId}`);
      } else {
      }
    } catch (error) {
      console.error("Error updating order:", error);
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toISOString().split("T")[0];
  };

  // Function to get allowed status options (only forward progression)
  const getProgressiveStatusOptions = (currentStatus) => {
    const statusLevels = {
      draft: 0,
      confirmed: 1,
      processing: 2,
      shipped: 3,
      delivered: 4,
    };

    const currentLevel = statusLevels[currentStatus] || 0;

    return STATUS_OPTIONS.filter((option) => {
      const optionLevel = statusLevels[option.value];
      return optionLevel >= currentLevel;
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
                      {getProgressiveStatusOptions(order.status).map(
                        (option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        )
                      )}
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

                {/* Simple Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Qty
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Harga Satuan
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {order.items?.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {item.product_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.product_code} • {item.product_category}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {item.quantity} {item.product_unit}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatCurrency(item.unit_price)}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatCurrency(item.total_price)}
                            </div>
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
            {/* Current Status (Read Only) */}
            <Card>
              <CardHeader>
                <CardTitle>Status Saat Ini</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge
                  className={
                    STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                  }
                >
                  {STATUS_OPTIONS.find((opt) => opt.value === order.status)
                    ?.label || order.status}
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
