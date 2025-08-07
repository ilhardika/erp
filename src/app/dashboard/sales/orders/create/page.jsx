"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";

export default function CreateSalesOrderPage() {
  const router = useRouter();

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    customer_id: "",
    salesperson_id: "",
    order_date: new Date().toISOString().split("T")[0],
    delivery_date: "",
    notes: "",
    shipping_address: "",
    terms_conditions: "",
    items: [
      {
        product_id: "",
        quantity: 1,
        unit_price: 0,
        discount_percentage: 0,
        notes: "",
      },
    ],
  });

  const fetchData = async () => {
    try {
      const [customersRes, productsRes, usersRes] = await Promise.all([
        fetch("/api/customers"),
        fetch("/api/products"),
        fetch("/api/users"),
      ]);

      const [customersData, productsData, usersData] = await Promise.all([
        customersRes.json(),
        productsRes.json(),
        usersRes.json(),
      ]);

      if (customersData.success) setCustomers(customersData.data);
      if (productsData.success) setProducts(productsData.data.products || []);
      if (usersData.success) {
        const salesUsers = usersData.data.filter(
          (user) => user.role === "admin" || user.role === "sales"
        );
        setUsers(salesUsers);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: "",
          quantity: 1,
          unit_price: 0,
          discount_percentage: 0,
          notes: "",
        },
      ],
    });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };

    // Auto-fill unit price when product is selected
    if (field === "product_id" && value) {
      const selectedProduct = products.find((p) => p.id == value);
      if (selectedProduct) {
        newItems[index].unit_price = parseFloat(selectedProduct.price);
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unit_price;
    const discount = subtotal * (item.discount_percentage / 100);
    return subtotal - discount;
  };

  const calculateOrderTotals = () => {
    const itemTotals = formData.items.map(calculateItemTotal);
    const subtotal = itemTotals.reduce((sum, total) => sum + total, 0);
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + tax;

    return { subtotal, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id) {
      alert("Pilih customer terlebih dahulu");
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].product_id) {
      alert("Tambahkan minimal satu item");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/sales/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert("Sales order berhasil dibuat!");
        router.push(`/dashboard/sales/orders/${data.data.id}`);
      } else {
        alert(`Gagal membuat sales order: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Terjadi kesalahan saat membuat sales order");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const totals = calculateOrderTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.push("/dashboard/sales/orders")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Buat Sales Order</h1>
            <p className="text-gray-600">Buat pesanan penjualan baru</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
                      value={formData.order_date}
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
                      value={formData.delivery_date}
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

            {/* Order Items */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Item Pesanan</CardTitle>
                  <Button type="button" onClick={addItem} variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Tambah Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {formData.items.map((item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-4">
                          <label className="block text-sm font-medium mb-2">
                            Product *
                          </label>
                          <select
                            value={item.product_id}
                            onChange={(e) =>
                              updateItem(index, "product_id", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Pilih Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.name} - {formatCurrency(product.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            Qty *
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            Unit Price
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unit_price}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "unit_price",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium mb-2">
                            Discount %
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={item.discount_percentage}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "discount_percentage",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div className="col-span-1">
                          <div className="text-sm font-medium text-right">
                            {formatCurrency(calculateItemTotal(item))}
                          </div>
                        </div>
                        <div className="col-span-1">
                          {formData.items.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {index < formData.items.length - 1 && (
                        <hr className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>{formatCurrency(totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>{formatCurrency(totals.tax)}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(totals.total)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Menyimpan..." : "Simpan Order"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/sales/orders")}
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
