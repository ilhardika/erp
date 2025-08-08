"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, Save, Send } from "lucide-react";

export default function EditPurchaseOrderPage() {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    supplier_id: "",
    order_date: "",
    expected_date: "",
    notes: "",
    items: [],
    status: "",
  });

  // Item being added
  const [newItem, setNewItem] = useState({
    product_id: "",
    quantity: 1,
    unit_cost: 0,
    discount_amount: 0,
    discount_percentage: 0,
    notes: "",
  });

  // Fetch data on mount
  useEffect(() => {
    if (params.id) {
      fetchPurchaseOrder();
      fetchSuppliers();
      fetchProducts();
    }
  }, [params.id]);

  const fetchPurchaseOrder = async () => {
    try {
      const response = await fetch(`/api/purchases/orders/${params.id}`);
      const data = await response.json();
      if (data.success) {
        const po = data.data;
        setFormData({
          supplier_id: po.supplier_id.toString(),
          order_date: new Date(po.order_date).toISOString().split("T")[0],
          expected_date: po.expected_date
            ? new Date(po.expected_date).toISOString().split("T")[0]
            : "",
          notes: po.notes || "",
          items: po.items.map((item) => ({
            ...item,
            total_cost: parseFloat(item.total_cost),
            unit_cost: parseFloat(item.unit_cost),
          })),
          status: po.status,
        });
      }
    } catch (error) {
      console.error("Error fetching purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      const data = await response.json();
      if (data.success) {
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      if (data.success) {
        setProducts(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
    }
  };

  // Add item to purchase order
  const addItem = () => {
    if (!newItem.product_id) {
      alert("Please select a product");
      return;
    }

    const product = Array.isArray(products)
      ? products.find((p) => p.id === parseInt(newItem.product_id))
      : null;
    if (!product) {
      alert("Product not found");
      return;
    }

    // Check if product already exists in items
    const existingItemIndex = formData.items.findIndex(
      (item) => item.product_id === parseInt(newItem.product_id)
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedItems = [...formData.items];
      updatedItems[existingItemIndex].quantity += parseInt(newItem.quantity);

      const discountAmount =
        updatedItems[existingItemIndex].discount_percentage > 0
          ? (updatedItems[existingItemIndex].unit_cost *
              updatedItems[existingItemIndex].quantity *
              updatedItems[existingItemIndex].discount_percentage) /
            100
          : updatedItems[existingItemIndex].discount_amount;

      updatedItems[existingItemIndex].total_cost =
        updatedItems[existingItemIndex].quantity *
          updatedItems[existingItemIndex].unit_cost -
        discountAmount;

      setFormData((prev) => ({ ...prev, items: updatedItems }));
    } else {
      // Add new item
      const discountAmount =
        newItem.discount_percentage > 0
          ? (newItem.unit_cost *
              newItem.quantity *
              newItem.discount_percentage) /
            100
          : newItem.discount_amount;

      const totalCost =
        parseFloat(newItem.unit_cost) * parseInt(newItem.quantity) -
        discountAmount;

      const item = {
        ...newItem,
        product_id: parseInt(newItem.product_id),
        quantity: parseInt(newItem.quantity),
        unit_cost: parseFloat(newItem.unit_cost),
        discount_amount: parseFloat(discountAmount),
        discount_percentage: parseFloat(newItem.discount_percentage),
        total_cost: totalCost,
        product_name: product.name,
        product_code: product.code,
      };

      setFormData((prev) => ({
        ...prev,
        items: [...prev.items, item],
      }));
    }

    // Reset new item form
    setNewItem({
      product_id: "",
      quantity: 1,
      unit_cost: 0,
      discount_amount: 0,
      discount_percentage: 0,
      notes: "",
    });
  };

  // Remove item from purchase order
  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Update item in purchase order
  const updateItem = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;

    // Recalculate total cost if quantity, unit_cost, or discount changed
    if (
      field === "quantity" ||
      field === "unit_cost" ||
      field === "discount_amount" ||
      field === "discount_percentage"
    ) {
      const discountAmount =
        updatedItems[index].discount_percentage > 0
          ? (updatedItems[index].unit_cost *
              updatedItems[index].quantity *
              updatedItems[index].discount_percentage) /
            100
          : updatedItems[index].discount_amount;

      updatedItems[index].total_cost =
        parseFloat(updatedItems[index].unit_cost) *
          parseInt(updatedItems[index].quantity) -
        discountAmount;
    }

    setFormData((prev) => ({ ...prev, items: updatedItems }));
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + item.total_cost,
      0
    );
    const taxAmount = subtotal * 0.11; // 11% PPN
    const total = subtotal + taxAmount;

    return { subtotal, taxAmount, total };
  };

  // Handle form submission
  const handleSubmit = async (newStatus = null) => {
    if (!formData.supplier_id) {
      alert("Please select a supplier");
      return;
    }

    if (formData.items.length === 0) {
      alert("Please add at least one item");
      return;
    }

    try {
      setSaving(true);
      const { subtotal, taxAmount, total } = calculateTotals();

      const payload = {
        ...formData,
        supplier_id: parseInt(formData.supplier_id),
        status: newStatus || formData.status,
        subtotal,
        tax_amount: taxAmount,
        total_amount: total,
      };

      const response = await fetch(`/api/purchases/orders/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        alert("Purchase order updated successfully!");
        router.push(`/dashboard/purchases/${params.id}`);
      } else {
        alert("Error updating purchase order: " + data.error);
      }
    } catch (error) {
      console.error("Error updating purchase order:", error);
      alert("Error updating purchase order");
    } finally {
      setSaving(false);
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const variants = {
      draft: "secondary",
      pending_approval: "warning",
      approved: "success",
      received: "primary",
      cancelled: "destructive",
    };

    const labels = {
      draft: "Draft",
      pending_approval: "Pending Approval",
      approved: "Approved",
      received: "Received",
      cancelled: "Cancelled",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  // Check if can edit
  const canEdit = ["draft", "pending_approval"].includes(formData.status);
  if (!canEdit) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">
            Cannot Edit Purchase Order
          </h1>
          <p className="text-muted-foreground mb-4">
            This purchase order cannot be edited in its current status.
          </p>
          <Button asChild>
            <Link href={`/dashboard/purchases/${params.id}`}>
              View Purchase Order
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href={`/dashboard/purchases/${params.id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Edit Purchase Order
          </h1>
          <p className="text-muted-foreground">
            Update purchase order details and items
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="supplier_id">Supplier *</Label>
                  <select
                    id="supplier_id"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={formData.supplier_id}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        supplier_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="order_date">Order Date *</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        order_date: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expected_date">Expected Delivery Date</Label>
                <Input
                  id="expected_date"
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      expected_date: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  className="w-full px-3 py-2 border border-input rounded-md min-h-[80px]"
                  placeholder="Additional notes..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Item */}
          <Card>
            <CardHeader>
              <CardTitle>Add New Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-12 gap-4 items-end">
                <div className="col-span-4">
                  <Label htmlFor="product_id">Product</Label>
                  <select
                    id="product_id"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={newItem.product_id}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        product_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">Select Product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.code} - {product.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        quantity: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="unit_cost">Unit Cost</Label>
                  <Input
                    id="unit_cost"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.unit_cost}
                    onChange={(e) =>
                      setNewItem((prev) => ({
                        ...prev,
                        unit_cost: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="col-span-1">
                  <Label htmlFor="discount_percentage">Disc %</Label>
                  <Input
                    id="discount_percentage"
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={newItem.discount_percentage}
                    onChange={(e) => {
                      const percentage = e.target.value;
                      setNewItem((prev) => ({
                        ...prev,
                        discount_percentage: percentage,
                        discount_amount:
                          percentage > 0 ? 0 : prev.discount_amount,
                      }));
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="discount_amount">Disc Amount</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={newItem.discount_amount}
                    onChange={(e) => {
                      const amount = e.target.value;
                      setNewItem((prev) => ({
                        ...prev,
                        discount_amount: amount,
                        discount_percentage:
                          amount > 0 ? 0 : prev.discount_percentage,
                      }));
                    }}
                  />
                </div>

                <div className="col-span-2">
                  <Label>Total</Label>
                  <Input
                    value={new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(
                      (() => {
                        const subtotal =
                          parseFloat(newItem.unit_cost) *
                          parseInt(newItem.quantity || 0);
                        const discountAmount =
                          newItem.discount_percentage > 0
                            ? (subtotal * newItem.discount_percentage) / 100
                            : parseFloat(newItem.discount_amount || 0);
                        return subtotal - discountAmount;
                      })()
                    )}
                    disabled
                  />
                </div>

                <div className="col-span-1">
                  <Button onClick={addItem} className="w-full">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items List */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Items ({formData.items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {formData.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No items added yet. Add items using the form above.
                </p>
              ) : (
                <div className="space-y-2">
                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.product_code}
                        </div>
                      </div>

                      <div className="w-20">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "quantity",
                              parseInt(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="w-32">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_cost}
                          onChange={(e) =>
                            updateItem(
                              index,
                              "unit_cost",
                              parseFloat(e.target.value)
                            )
                          }
                        />
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          placeholder="Disc %"
                          value={item.discount_percentage}
                          onChange={(e) => {
                            updateItem(
                              index,
                              "discount_percentage",
                              parseFloat(e.target.value)
                            );
                            updateItem(index, "discount_amount", 0);
                          }}
                        />
                      </div>

                      <div className="w-24">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Disc Amt"
                          value={item.discount_amount}
                          onChange={(e) => {
                            updateItem(
                              index,
                              "discount_amount",
                              parseFloat(e.target.value)
                            );
                            updateItem(index, "discount_percentage", 0);
                          }}
                        />
                      </div>

                      <div className="w-32 text-right font-medium">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                        }).format(item.total_cost)}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Tax (11%):</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(taxAmount)}
                </span>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(total)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => handleSubmit()}
                disabled={saving}
                className="w-full"
                variant="outline"
              >
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>

              {formData.status === "draft" && (
                <Button
                  onClick={() => handleSubmit("pending_approval")}
                  disabled={saving}
                  className="w-full"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit for Approval
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
