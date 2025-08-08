"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatIDR, formatDate } from "@/lib/utils";
import {
  PURCHASE_ORDER_STATUS,
  PURCHASE_FORM_DEFAULTS,
} from "@/lib/purchase-constants";
import { ArrowLeft, Plus, Search, Trash2, Package } from "lucide-react";

export default function CreatePurchaseOrderPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    supplier_id: "",
    expected_date: "",
    notes: "",
    status: PURCHASE_ORDER_STATUS.DRAFT,
  });

  const [items, setItems] = useState([]);

  // Data lists
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
  const [productSearch, setProductSearch] = useState("");

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [isSuppliersLoading, setIsSuppliersLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // Load suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers");
        const data = await response.json();
        if (data.success) {
          setSuppliers(data.suppliers);
        }
      } catch (error) {
        console.error("Error fetching suppliers:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data supplier",
          variant: "destructive",
        });
      } finally {
        setIsSuppliersLoading(false);
      }
    };

    fetchSuppliers();
  }, [toast]);

  // Load products when dialog opens
  const handleOpenProductDialog = async () => {
    setIsProductDialogOpen(true);
    if (products.length === 0) {
      setIsProductsLoading(true);
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        if (data.success) {
          setProducts(data.products);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        toast({
          title: "Error",
          description: "Gagal memuat data produk",
          variant: "destructive",
        });
      } finally {
        setIsProductsLoading(false);
      }
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
    const total = subtotal; // Could add tax here if needed
    return { subtotal, total };
  };

  // Add product to items
  const addProduct = (product) => {
    const existingItem = items.find((item) => item.product_id === product.id);

    if (existingItem) {
      setItems(
        items.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_name: product.name,
          product_code: product.code,
          quantity: 1,
          unit_price: product.purchase_price || product.price || 0,
          note: "",
        },
      ]);
    }

    setIsProductDialogOpen(false);
    setProductSearch("");
  };

  // Update item
  const updateItem = (productId, field, value) => {
    setItems(
      items.map((item) =>
        item.product_id === productId ? { ...item, [field]: value } : item
      )
    );
  };

  // Remove item
  const removeItem = (productId) => {
    setItems(items.filter((item) => item.product_id !== productId));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier_id) {
      toast({
        title: "Error",
        description: "Pilih supplier terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Error",
        description: "Tambahkan minimal satu produk",
        variant: "destructive",
      });
      return;
    }

    const invalidItems = items.filter(
      (item) =>
        !item.quantity ||
        item.quantity <= 0 ||
        !item.unit_price ||
        item.unit_price <= 0
    );
    if (invalidItems.length > 0) {
      toast({
        title: "Error",
        description:
          "Pastikan semua item memiliki quantity dan harga yang valid",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { total } = calculateTotals();

      const payload = {
        ...formData,
        items,
        total_amount: total,
      };

      const response = await fetch("/api/purchases/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Sukses",
          description: "Purchase order berhasil dibuat",
        });
        router.push(`/dashboard/purchases/orders/${data.purchase_order.id}`);
      } else {
        throw new Error(data.error || "Failed to create purchase order");
      }
    } catch (error) {
      console.error("Error creating purchase order:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal membuat purchase order",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter products based on search
  const filteredProducts = (products || []).filter(
    (product) =>
      product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      product.code.toLowerCase().includes(productSearch.toLowerCase())
  );

  const { subtotal, total } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Buat Purchase Order</h1>
          <p className="text-muted-foreground">
            Buat purchase order baru untuk pembelian barang
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier *</Label>
                <Select
                  value={formData.supplier_id}
                  onValueChange={(value) =>
                    setFormData({ ...formData, supplier_id: value })
                  }
                  disabled={isSuppliersLoading}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        isSuppliersLoading
                          ? "Memuat supplier..."
                          : "Pilih supplier"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers && suppliers.length > 0 ? (
                      suppliers.map((supplier) => (
                        <SelectItem
                          key={supplier.id}
                          value={supplier.id.toString()}
                        >
                          {supplier.name}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-suppliers" disabled>
                        {isSuppliersLoading
                          ? "Memuat..."
                          : "Tidak ada supplier"}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected_date">Tanggal Diharapkan</Label>
                <Input
                  id="expected_date"
                  type="date"
                  value={formData.expected_date}
                  onChange={(e) =>
                    setFormData({ ...formData, expected_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Catatan</Label>
              <Textarea
                id="notes"
                placeholder="Catatan untuk purchase order ini..."
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Items Purchase Order</CardTitle>
            <Dialog
              open={isProductDialogOpen}
              onOpenChange={setIsProductDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  onClick={handleOpenProductDialog}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tambah Produk
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Pilih Produk</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Cari produk..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {isProductsLoading ? (
                    <div className="text-center py-8">Loading produk...</div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {filteredProducts.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          {productSearch
                            ? "Tidak ada produk yang ditemukan"
                            : "Tidak ada produk tersedia"}
                        </div>
                      ) : (
                        filteredProducts.map((product) => (
                          <div
                            key={product.id}
                            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => addProduct(product)}
                          >
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {product.code} • Stock: {product.stock} •{" "}
                                {formatIDR(
                                  product.purchase_price || product.price
                                )}
                              </div>
                            </div>
                            <Badge variant="outline">
                              <Package className="h-3 w-3 mr-1" />
                              {product.category}
                            </Badge>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Belum ada produk ditambahkan
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="flex items-center gap-4 p-4 border rounded-lg"
                  >
                    <div className="flex-1 space-y-2">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.product_code}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="space-y-1">
                        <Label className="text-xs">Qty</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              item.product_id,
                              "quantity",
                              parseInt(e.target.value) || 0
                            )
                          }
                          className="w-20"
                          min="1"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Harga</Label>
                        <Input
                          type="number"
                          value={item.unit_price}
                          onChange={(e) =>
                            updateItem(
                              item.product_id,
                              "unit_price",
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-32"
                          min="0"
                          step="0.01"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Total</Label>
                        <div className="text-sm font-medium py-2">
                          {formatIDR(item.quantity * item.unit_price)}
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(item.product_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">{formatIDR(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatIDR(total)}</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" disabled={isLoading || items.length === 0}>
            {isLoading ? "Menyimpan..." : "Buat Purchase Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
