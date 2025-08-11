"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { ArrowLeft, Plus, Trash2, Save } from "lucide-react";
import { formatCurrency } from "@/lib/format-utils";
import { FORM_DEFAULTS } from "@/lib/purchase-constants";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState(FORM_DEFAULTS.purchaseOrder);

  const fetchData = async () => {
    try {
      const [suppliersRes, productsRes, usersRes] = await Promise.all([
        fetch("/api/suppliers"),
        fetch("/api/products"),
        fetch("/api/users"),
      ]);

      const [suppliersData, productsData, usersData] = await Promise.all([
        suppliersRes.json(),
        productsRes.json(),
        usersRes.json(),
      ]);

      console.log("Products data:", productsData); // Debug log

      if (suppliersData.success) setSuppliers(suppliersData.data || []);
      if (productsData.success) setProducts(productsData.data || []);
      if (usersData.success) {
        const purchaseUsers = usersData.data.filter(
          (user) => user.role === "admin" || user.role === "warehouse"
        );
        setUsers(purchaseUsers);
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
          unit_cost: 0,
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

    // Auto-fill unit cost when product is selected
    if (field === "product_id" && value) {
      const selectedProduct = products.find((p) => p.id == value);
      if (selectedProduct) {
        newItems[index].unit_cost = parseFloat(
          selectedProduct.cost_price || selectedProduct.price || 0
        );
      }
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unit_cost;
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

    if (!formData.supplier_id) {
      console.error("Pilih supplier terlebih dahulu");
      return;
    }

    if (formData.items.length === 0 || !formData.items[0].product_id) {
      console.error("Tambahkan minimal satu item");
      return;
    }

    setLoading(true);

    try {
      // Calculate totals
      const itemTotals = formData.items.map(calculateItemTotal);
      const subtotal = itemTotals.reduce((sum, total) => sum + total, 0);
      const tax_amount = subtotal * 0.1; // 10% tax
      const total_amount = subtotal + tax_amount;

      // Prepare items data with proper structure
      const preparedItems = formData.items.map((item) => ({
        product_id: parseInt(item.product_id),
        quantity: parseInt(item.quantity),
        unit_cost: parseFloat(item.unit_cost),
        discount_percentage: parseFloat(item.discount_percentage || 0),
        discount_amount:
          parseFloat(item.unit_cost) *
          parseInt(item.quantity) *
          (parseFloat(item.discount_percentage || 0) / 100),
        total_cost: calculateItemTotal(item),
        notes: item.notes || "",
      }));

      // Prepare purchase order data
      const purchaseOrderData = {
        supplier_id: parseInt(formData.supplier_id),
        order_date: formData.order_date,
        expected_date: formData.expected_date || null,
        status: "draft",
        subtotal: subtotal,
        discount_amount: 0,
        tax_amount: tax_amount,
        total_amount: total_amount,
        payment_status: "pending",
        notes: formData.notes || "",
        shipping_address: formData.shipping_address || "",
        terms_conditions: formData.terms_conditions || "",
        items: preparedItems,
        created_by: 1, // TODO: Get from auth session
      };

      console.log("Sending purchase order data:", purchaseOrderData); // Debug log

      const response = await fetch("/api/purchases/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(purchaseOrderData),
      });

      const data = await response.json();
      console.log("Purchase order response:", data); // Debug log

      if (data.success) {
        router.push("/dashboard/purchases");
      } else {
        console.error(`Gagal membuat purchase order: ${data.error}`);
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateOrderTotals();

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/purchases")}
          className="shrink-0 p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">
          Buat Pesanan Pembelian
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Buat pesanan pembelian baru dari supplier
        </p>
      </div>

      <form id="order-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="lg:grid lg:grid-cols-3 lg:gap-6 space-y-6 lg:space-y-0">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle>Informasi Pesanan</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Supplier *
                    </label>
                    <SearchableSelect
                      options={suppliers}
                      value={formData.supplier_id}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          supplier_id: value,
                        })
                      }
                      placeholder="Pilih Supplier"
                      searchPlaceholder="Cari supplier..."
                      getOptionLabel={(supplier) =>
                        `${supplier.name} - ${
                          supplier.company || supplier.phone
                        }`
                      }
                      getOptionValue={(supplier) => supplier.id}
                      renderOption={(supplier) => (
                        <div className="flex flex-col">
                          <span className="font-medium">{supplier.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {supplier.company || "Individual"} •{" "}
                            {supplier.phone}
                          </span>
                        </div>
                      )}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Staff Pembelian
                    </label>
                    <SearchableSelect
                      options={users}
                      value={formData.purchaser_id}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          purchaser_id: value,
                        })
                      }
                      placeholder="Pilih Staff"
                      searchPlaceholder="Cari staff..."
                      getOptionLabel={(user) => `${user.name} - ${user.role}`}
                      getOptionValue={(user) => user.id}
                      renderOption={(user) => (
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {user.email} • {user.role}
                          </span>
                        </div>
                      )}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tanggal Pesanan
                    </label>
                    <input
                      type="date"
                      value={formData.order_date}
                      onChange={(e) =>
                        setFormData({ ...formData, order_date: e.target.value })
                      }
                      className="w-full h-12 md:h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Tanggal Diharapkan
                    </label>
                    <input
                      type="date"
                      value={formData.expected_date}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          expected_date: e.target.value,
                        })
                      }
                      className="w-full h-12 md:h-10 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation"
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Alamat Pengiriman
                    </label>
                    <textarea
                      value={formData.shipping_address}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          shipping_address: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation resize-none"
                      rows="2"
                      placeholder="Alamat pengiriman..."
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Syarat & Ketentuan
                    </label>
                    <textarea
                      value={formData.terms_conditions}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          terms_conditions: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation resize-none"
                      rows="2"
                      placeholder="Syarat dan ketentuan..."
                    />
                  </div>
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Catatan
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 touch-manipulation resize-none"
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
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-gray-50"
                    >
                      {/* Mobile responsive layout */}
                      <div className="space-y-4">
                        {/* Row 1: Product (full width on mobile) */}
                        <div className="grid grid-cols-1 gap-4">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Produk *
                            </label>
                            <SearchableSelect
                              options={products}
                              value={item.product_id}
                              onValueChange={(value) =>
                                updateItem(index, "product_id", value)
                              }
                              placeholder="Pilih Produk"
                              searchPlaceholder="Cari produk..."
                              getOptionLabel={(product) =>
                                `${product.name} - ${formatCurrency(
                                  product.cost_price || product.price || 0
                                )}`
                              }
                              getOptionValue={(product) => product.id}
                              renderOption={(product) => (
                                <div className="flex flex-col">
                                  <span className="font-medium">
                                    {product.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {product.code} •{" "}
                                    {formatCurrency(
                                      product.cost_price || product.price || 0
                                    )}
                                  </span>
                                </div>
                              )}
                              className="w-full"
                            />
                          </div>
                        </div>

                        {/* Row 2: Qty, Price, Discount, Delete (responsive grid) */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-end">
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Jumlah *
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
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Harga Satuan
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={item.unit_cost}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "unit_cost",
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-2">
                              Diskon %
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
                          <div className="text-center">
                            <label className="block text-sm font-medium mb-2">
                              Total
                            </label>
                            <div className="text-sm font-medium py-2">
                              {formatCurrency(calculateItemTotal(item))}
                            </div>
                          </div>
                          <div className="text-center">
                            {formData.items.length > 1 && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => removeItem(index)}
                                className="text-red-600 hover:text-red-800 w-full md:w-auto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Desktop Sidebar - Sticky Order Summary */}
          <div className="hidden lg:block">
            <div className="sticky top-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Ringkasan Pesanan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatCurrency(totals.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Pajak (10%)</span>
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
                  {loading ? "Menyimpan..." : "Simpan Pesanan"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/dashboard/purchases")}
                  className="w-full"
                >
                  Batal
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Action Buttons - Shows at bottom on mobile */}
        <div className="lg:hidden space-y-3">
          {/* Mobile Order Summary Card - Shows before save button on mobile */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pajak (10%)</span>
                  <span>{formatCurrency(totals.tax)}</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(totals.total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? "Menyimpan..." : "Simpan Pesanan"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/purchases")}
            className="w-full"
          >
            Batal
          </Button>
        </div>
      </form>
    </div>
  );
}
