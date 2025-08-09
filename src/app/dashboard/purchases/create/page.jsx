"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Send,
  AlertCircle,
  Edit,
  Package,
} from "lucide-react";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);

  // Dialog state
  const [dialog, setDialog] = useState({
    open: false,
    title: "",
    message: "",
    type: "error", // 'error', 'success', 'warning'
  });

  // Product CRUD Dialog state
  const [productDialog, setProductDialog] = useState({
    open: false,
    mode: "create", // 'create', 'edit'
    productData: {
      code: "",
      name: "",
      category: "",
      unit: "",
      cost_price: 0,
      price: 0,
      description: "",
    },
    editingId: null,
  }); // Form state
  const [formData, setFormData] = useState({
    supplier_id: "",
    order_date: new Date().toISOString().split("T")[0],
    expected_date: "",
    notes: "",
    status: "draft",
    items: [
      {
        product_id: "",
        quantity: 1,
        unit_cost: 0,
        discount_type: "amount",
        discount_value: 0,
        notes: "",
      },
    ],
  });

  // Load suppliers and products
  useEffect(() => {
    const loadData = async () => {
      try {
        const [suppliersRes, productsRes] = await Promise.all([
          fetch("/api/suppliers"),
          fetch("/api/products"),
        ]);

        if (suppliersRes.ok) {
          const suppliersData = await suppliersRes.json();
          setSuppliers(suppliersData.data || []);
        }

        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    loadData();
  }, []);

  // Dialog functions
  const showDialog = (title, message, type = "error") => {
    setDialog({ open: true, title, message, type });
  };

  const closeDialog = () => {
    setDialog({ open: false, title: "", message: "", type: "error" });
  };

  // Product CRUD functions
  const openProductDialog = (mode = "create", product = null) => {
    setProductDialog({
      open: true,
      mode,
      productData: product
        ? {
            code: product.code || "",
            name: product.name || "",
            category: product.category || "",
            unit: product.unit || "",
            cost_price: product.cost_price || 0,
            price: product.price || 0,
            description: product.description || "",
          }
        : {
            code: "",
            name: "",
            category: "",
            unit: "",
            cost_price: 0,
            price: 0,
            description: "",
          },
      editingId: product?.id || null,
    });
  };

  const closeProductDialog = () => {
    setProductDialog({
      open: false,
      mode: "create",
      productData: {
        code: "",
        name: "",
        category: "",
        unit: "",
        cost_price: 0,
        price: 0,
        description: "",
      },
      editingId: null,
    });
  };

  const handleProductSubmit = async () => {
    try {
      const { productData, mode, editingId } = productDialog;

      if (!productData.code || !productData.name) {
        showDialog(
          "Validation Error",
          "Product code and name are required",
          "error"
        );
        return;
      }

      const url =
        mode === "create" ? "/api/products" : `/api/products/${editingId}`;
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        const result = await response.json();

        // Refresh products list
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }

        showDialog(
          "Success",
          `Product ${mode === "create" ? "created" : "updated"} successfully!`,
          "success"
        );
        closeProductDialog();
      } else {
        const error = await response.json();
        showDialog(
          "Error",
          error.message || `Failed to ${mode} product`,
          "error"
        );
      }
    } catch (error) {
      console.error("Error saving product:", error);
      showDialog("Error", "Failed to save product. Please try again.", "error");
    }
  };

  const handleProductDelete = async (productId) => {
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        // Refresh products list
        const productsRes = await fetch("/api/products");
        if (productsRes.ok) {
          const productsData = await productsRes.json();
          setProducts(productsData.data || []);
        }

        showDialog("Success", "Product deleted successfully!", "success");
      } else {
        const error = await response.json();
        showDialog(
          "Error",
          error.message || "Failed to delete product",
          "error"
        );
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      showDialog(
        "Error",
        "Failed to delete product. Please try again.",
        "error"
      );
    }
  };

  // Calculate item totals
  const calculateItemTotal = (item) => {
    const subtotal = item.quantity * item.unit_cost;
    let discount = 0;

    if (item.discount_type === "percentage") {
      discount = subtotal * (item.discount_value / 100);
    } else {
      discount = item.discount_value;
    }

    return Math.max(0, subtotal - discount);
  };

  // Calculate order totals
  const calculateOrderTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      return sum + item.quantity * item.unit_cost;
    }, 0);

    const totalDiscount = formData.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unit_cost;
      if (item.discount_type === "percentage") {
        return sum + itemSubtotal * (item.discount_value / 100);
      } else {
        return sum + item.discount_value;
      }
    }, 0);

    const total = subtotal - totalDiscount;

    return {
      subtotal: subtotal.toFixed(2),
      totalDiscount: totalDiscount.toFixed(2),
      total: total.toFixed(2),
    };
  };

  // Add new item row
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: "",
          quantity: 1,
          unit_cost: 0,
          discount_type: "amount",
          discount_value: 0,
          notes: "",
        },
      ],
    });
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length === 1) {
      showDialog(
        "Warning",
        "At least one item is required for a purchase order",
        "warning"
      );
      return;
    }
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  // Update item
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

  // Submit order
  const handleSubmit = async (status = "draft") => {
    if (!formData.supplier_id) {
      showDialog("Validation Error", "Please select a supplier", "error");
      return;
    }

    if (!formData.order_date) {
      showDialog("Validation Error", "Please set order date", "error");
      return;
    }

    // Check if all items have products selected
    const invalidItems = formData.items.filter((item) => !item.product_id);
    if (invalidItems.length > 0) {
      showDialog(
        "Validation Error",
        "Please select products for all items",
        "error"
      );
      return;
    }

    setLoading(true);

    try {
      const orderData = {
        ...formData,
        status,
        items: formData.items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: parseInt(item.quantity),
          unit_cost: parseFloat(item.unit_cost),
          discount_type: item.discount_type,
          discount_value: parseFloat(item.discount_value),
          notes: item.notes,
        })),
      };

      const response = await fetch("/api/purchases/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const result = await response.json();
        showDialog(
          "Success",
          "Purchase order created successfully!",
          "success"
        );
        setTimeout(() => {
          router.push(`/dashboard/purchases/`);
        }, 1500);
      } else {
        const error = await response.json();
        showDialog(
          "Error",
          error.message || "Failed to create purchase order",
          "error"
        );
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      showDialog(
        "Error",
        "Failed to create purchase order. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateOrderTotals();

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Purchase Order</h1>
            <p className="text-gray-600">
              Create a new purchase order for your suppliers
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Information */}
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Basic purchase order details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Supplier */}
                <div>
                  <Label htmlFor="supplier">Supplier *</Label>
                  <select
                    id="supplier"
                    value={formData.supplier_id}
                    onChange={(e) =>
                      setFormData({ ...formData, supplier_id: e.target.value })
                    }
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} - {supplier.company || "Individual"}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Order Date */}
                <div>
                  <Label htmlFor="order_date">Order Date *</Label>
                  <Input
                    id="order_date"
                    type="date"
                    value={formData.order_date}
                    onChange={(e) =>
                      setFormData({ ...formData, order_date: e.target.value })
                    }
                    required
                  />
                </div>

                {/* Expected Date */}
                <div>
                  <Label htmlFor="expected_date">Expected Date</Label>
                  <Input
                    id="expected_date"
                    type="date"
                    value={formData.expected_date}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        expected_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <Label htmlFor="notes">Notes</Label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="3"
                  placeholder="Additional notes or requirements..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Order Items - Sales Style Pattern */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Order Items</CardTitle>
                  <CardDescription>
                    Add and manage items for this purchase order
                  </CardDescription>
                </div>
                <Button type="button" onClick={addItem} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 bg-gray-50">
                    {/* Mobile responsive layout like sales */}
                    <div className="space-y-4">
                      {/* Row 1: Product (full width on mobile) */}
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <Label className="block text-sm font-medium">
                              Product *
                            </Label>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => openProductDialog("create")}
                                className="text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add New
                              </Button>
                              {item.product_id && (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const product = products.find(
                                        (p) => p.id == item.product_id
                                      );
                                      if (product)
                                        openProductDialog("edit", product);
                                    }}
                                    className="text-xs"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      if (
                                        window.confirm(
                                          "Are you sure you want to delete this product?"
                                        )
                                      ) {
                                        handleProductDelete(item.product_id);
                                      }
                                    }}
                                    className="text-xs text-red-600 hover:text-red-800"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          <select
                            value={item.product_id}
                            onChange={(e) =>
                              updateItem(index, "product_id", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product.id} value={product.id}>
                                {product.code} - {product.name} - Rp{" "}
                                {(
                                  product.cost_price ||
                                  product.price ||
                                  0
                                ).toLocaleString()}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Qty, Unit Cost, Discount, Total, Delete (responsive grid) */}
                      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 items-end">
                        <div>
                          <Label className="block text-sm font-medium mb-2">
                            Quantity *
                          </Label>
                          <Input
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
                            required
                          />
                        </div>

                        <div>
                          <Label className="block text-sm font-medium mb-2">
                            Unit Cost
                          </Label>
                          <Input
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
                          />
                        </div>

                        <div>
                          <Label className="block text-sm font-medium mb-2">
                            Discount Type
                          </Label>
                          <select
                            value={item.discount_type}
                            onChange={(e) =>
                              updateItem(index, "discount_type", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="amount">Amount (Rp)</option>
                            <option value="percentage">Percentage (%)</option>
                          </select>
                        </div>

                        <div>
                          <Label className="block text-sm font-medium mb-2">
                            Discount{" "}
                            {item.discount_type === "percentage"
                              ? "(%)"
                              : "(Rp)"}
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            step={
                              item.discount_type === "percentage" ? "0.01" : "1"
                            }
                            max={
                              item.discount_type === "percentage"
                                ? "100"
                                : undefined
                            }
                            value={item.discount_value}
                            onChange={(e) =>
                              updateItem(
                                index,
                                "discount_value",
                                parseFloat(e.target.value) || 0
                              )
                            }
                          />
                        </div>

                        <div className="text-center">
                          <Label className="block text-sm font-medium mb-2">
                            Total
                          </Label>
                          <div className="text-sm font-medium py-2">
                            Rp {calculateItemTotal(item).toLocaleString()}
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

                      {/* Notes Row */}
                      <div>
                        <Label className="block text-sm font-medium mb-2">
                          Item Notes
                        </Label>
                        <Input
                          value={item.notes}
                          onChange={(e) =>
                            updateItem(index, "notes", e.target.value)
                          }
                          placeholder="Additional notes for this item..."
                        />
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
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>
                      Rp {parseFloat(totals.subtotal).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Discount</span>
                    <span>
                      -Rp {parseFloat(totals.totalDiscount).toLocaleString()}
                    </span>
                  </div>
                  <hr />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>Rp {parseFloat(totals.total).toLocaleString()}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {formData.items.length} item(s)
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <Button
                onClick={() => handleSubmit("draft")}
                disabled={loading}
                className="w-full"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save as Draft"}
              </Button>
              <Button
                onClick={() => handleSubmit("pending")}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? "Submitting..." : "Submit for Approval"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/dashboard/purchases")}
                className="w-full"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Action Buttons - Shows at bottom on mobile */}
      <div className="lg:hidden space-y-3 mt-6">
        {/* Mobile Order Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>Rp {parseFloat(totals.subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Total Discount</span>
                <span>
                  -Rp {parseFloat(totals.totalDiscount).toLocaleString()}
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>Rp {parseFloat(totals.total).toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={() => handleSubmit("draft")}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          <Save className="h-4 w-4 mr-2" />
          {loading ? "Saving..." : "Save as Draft"}
        </Button>
        <Button
          onClick={() => handleSubmit("pending")}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Send className="h-4 w-4 mr-2" />
          {loading ? "Submitting..." : "Submit for Approval"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard/purchases")}
          className="w-full"
        >
          Cancel
        </Button>
      </div>

      {/* Dialog for alerts - replaces all alert() calls */}
      <Dialog open={dialog.open} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {dialog.type === "error" && (
                <AlertCircle className="h-5 w-5 text-red-500" />
              )}
              {dialog.type === "success" && (
                <AlertCircle className="h-5 w-5 text-green-500" />
              )}
              {dialog.type === "warning" && (
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              )}
              {dialog.title}
            </DialogTitle>
            <DialogDescription>{dialog.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={closeDialog}>
              {dialog.type === "success" ? "Continue" : "OK"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product CRUD Dialog */}
      <Dialog open={productDialog.open} onOpenChange={closeProductDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {productDialog.mode === "create"
                ? "Add New Product"
                : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              {productDialog.mode === "create"
                ? "Create a new product to add to the order"
                : "Update product information"}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div>
              <Label htmlFor="product-code">Product Code *</Label>
              <Input
                id="product-code"
                value={productDialog.productData.code}
                onChange={(e) =>
                  setProductDialog({
                    ...productDialog,
                    productData: {
                      ...productDialog.productData,
                      code: e.target.value,
                    },
                  })
                }
                placeholder="e.g., PROD001"
              />
            </div>

            <div>
              <Label htmlFor="product-name">Product Name *</Label>
              <Input
                id="product-name"
                value={productDialog.productData.name}
                onChange={(e) =>
                  setProductDialog({
                    ...productDialog,
                    productData: {
                      ...productDialog.productData,
                      name: e.target.value,
                    },
                  })
                }
                placeholder="e.g., Office Chair"
              />
            </div>

            <div>
              <Label htmlFor="product-category">Category</Label>
              <Input
                id="product-category"
                value={productDialog.productData.category}
                onChange={(e) =>
                  setProductDialog({
                    ...productDialog,
                    productData: {
                      ...productDialog.productData,
                      category: e.target.value,
                    },
                  })
                }
                placeholder="e.g., Furniture"
              />
            </div>

            <div>
              <Label htmlFor="product-unit">Unit</Label>
              <Input
                id="product-unit"
                value={productDialog.productData.unit}
                onChange={(e) =>
                  setProductDialog({
                    ...productDialog,
                    productData: {
                      ...productDialog.productData,
                      unit: e.target.value,
                    },
                  })
                }
                placeholder="e.g., pcs, kg, box"
              />
            </div>

            <div>
              <Label htmlFor="product-cost">Cost Price (Rp)</Label>
              <Input
                id="product-cost"
                type="number"
                min="0"
                step="0.01"
                value={productDialog.productData.cost_price}
                onChange={(e) =>
                  setProductDialog({
                    ...productDialog,
                    productData: {
                      ...productDialog.productData,
                      cost_price: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="product-price">Selling Price (Rp)</Label>
              <Input
                id="product-price"
                type="number"
                min="0"
                step="0.01"
                value={productDialog.productData.price}
                onChange={(e) =>
                  setProductDialog({
                    ...productDialog,
                    productData: {
                      ...productDialog.productData,
                      price: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                placeholder="0"
              />
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="product-description">Description</Label>
              <textarea
                id="product-description"
                value={productDialog.productData.description}
                onChange={(e) =>
                  setProductDialog({
                    ...productDialog,
                    productData: {
                      ...productDialog.productData,
                      description: e.target.value,
                    },
                  })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                placeholder="Product description..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeProductDialog}>
              Cancel
            </Button>
            <Button onClick={handleProductSubmit}>
              {productDialog.mode === "create"
                ? "Create Product"
                : "Update Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
