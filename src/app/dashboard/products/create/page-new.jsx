"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CurrencyInput } from "@/components/ui/currency-input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Save, Package } from "lucide-react";
import DashboardFormLayout from "@/components/layouts/dashboard-form-layout";
import {
  useStandardForm,
  useDataFetch,
  API_ENDPOINTS,
  VALIDATION_RULES,
} from "@/hooks";

export default function CreateProductPage() {
  // Fetch suppliers
  const { data: suppliers = [], loading: suppliersLoading } = useDataFetch(
    "/api/suppliers/list",
    {
      immediate: true,
      errorMessage: "Gagal memuat data supplier",
    }
  );

  // Form validation rules
  const validationRules = {
    name: VALIDATION_RULES.required("Nama produk"),
    code: VALIDATION_RULES.code("Kode produk"),
    category: VALIDATION_RULES.required("Kategori"),
    price: VALIDATION_RULES.numeric("Harga jual"),
    cost: VALIDATION_RULES.numeric("Harga modal"),
    stock: VALIDATION_RULES.numeric("Stok"),
    minStock: VALIDATION_RULES.numeric("Stok minimum"),
  };

  // Use standard form hook
  const {
    formData,
    updateField,
    updateFields,
    generateCode,
    handleSubmit,
    loading,
    error,
    success,
    reset,
  } = useStandardForm({
    endpoint: API_ENDPOINTS.PRODUCTS,
    redirectPath: "/dashboard/products",
    validationRules,
    autoGenerateCode: true,
    codePrefix: "PRD",
    successMessage: "Produk berhasil ditambahkan",
    errorMessage: "Gagal menambahkan produk",
    initialData: {
      name: "",
      code: "",
      description: "",
      category: "",
      price: "",
      cost: "",
      stock: "",
      minStock: "",
      unit: "pcs",
      barcode: "",
      supplier: "",
      supplier_id: "",
      status: "active",
      weight: "",
      dimensions: {
        length: "",
        width: "",
        height: "",
      },
    },
  });

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  // Watch for success/error states
  useEffect(() => {
    if (success) {
      setDialogType("success");
      setDialogMessage("Produk berhasil ditambahkan!");
      setDialogOpen(true);
    } else if (error) {
      setDialogType("error");
      setDialogMessage(error);
      setDialogOpen(true);
    }
  }, [success, error]);

  // Categories and units data
  const categories = [
    "Elektronik",
    "Pakaian",
    "Makanan & Minuman",
    "Buku",
    "Rumah & Taman",
    "Olahraga",
    "Mainan",
    "Kesehatan & Kecantikan",
    "Otomotif",
    "Perlengkapan Kantor",
  ];

  const units = [
    "pcs",
    "kg",
    "gram",
    "liter",
    "ml",
    "meter",
    "cm",
    "box",
    "pack",
    "set",
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("dimensions.")) {
      const dimensionKey = name.split(".")[1];
      updateFields({
        dimensions: {
          ...formData.dimensions,
          [dimensionKey]: value,
        },
      });
    } else {
      updateField(name, value);
    }
  };

  // Handle form submission
  const onSubmit = async (e) => {
    e.preventDefault();
    await handleSubmit(false); // false = create mode
  };

  // Close dialog handler
  const closeDialog = () => {
    setDialogOpen(false);
    setDialogType("");
    setDialogMessage("");
  };

  // Form content
  const formContent = (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Informasi Dasar
          </CardTitle>
          <CardDescription>Masukkan informasi dasar produk</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Produk *</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Masukkan nama produk"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Kode Produk *</Label>
            <div className="flex gap-2">
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleInputChange}
                placeholder="Masukkan kode produk"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={generateCode}
                disabled={loading}
              >
                Generate
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Kategori *</Label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Satuan</Label>
            <select
              id="unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {units.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Deskripsi</Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Masukkan deskripsi produk"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing & Stock */}
      <Card>
        <CardHeader>
          <CardTitle>Harga & Stok</CardTitle>
          <CardDescription>
            Atur harga dan informasi stok produk
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cost">Harga Modal *</Label>
            <CurrencyInput
              id="cost"
              name="cost"
              value={formData.cost}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Harga Jual *</Label>
            <CurrencyInput
              id="price"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stok Awal</Label>
            <Input
              id="stock"
              name="stock"
              type="number"
              value={formData.stock}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="minStock">Stok Minimum</Label>
            <Input
              id="minStock"
              name="minStock"
              type="number"
              value={formData.minStock}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Tambahan</CardTitle>
          <CardDescription>Informasi tambahan untuk produk</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              name="barcode"
              value={formData.barcode}
              onChange={handleInputChange}
              placeholder="Masukkan barcode"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier_id">Supplier</Label>
            <select
              id="supplier_id"
              name="supplier_id"
              value={formData.supplier_id}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={suppliersLoading}
            >
              <option value="">Pilih supplier</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Berat (gram)</Label>
            <Input
              id="weight"
              name="weight"
              type="number"
              value={formData.weight}
              onChange={handleInputChange}
              placeholder="0"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="active">Aktif</option>
              <option value="inactive">Nonaktif</option>
            </select>
          </div>

          {/* Dimensions */}
          <div className="space-y-2 md:col-span-2">
            <Label>Dimensi (cm)</Label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                name="dimensions.length"
                value={formData.dimensions.length}
                onChange={handleInputChange}
                placeholder="Panjang"
                type="number"
                min="0"
              />
              <Input
                name="dimensions.width"
                value={formData.dimensions.width}
                onChange={handleInputChange}
                placeholder="Lebar"
                type="number"
                min="0"
              />
              <Input
                name="dimensions.height"
                value={formData.dimensions.height}
                onChange={handleInputChange}
                placeholder="Tinggi"
                type="number"
                min="0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {loading ? "Menyimpan..." : "Simpan Produk"}
        </Button>
      </div>
    </form>
  );

  return (
    <>
      <DashboardFormLayout
        title="Tambah Produk"
        description="Tambahkan produk baru ke dalam inventori"
        backLink="/dashboard/products"
      >
        {formContent}
      </DashboardFormLayout>

      {/* Success/Error Dialog */}
      <Dialog open={dialogOpen} onOpenChange={closeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "success" ? "Berhasil" : "Gagal"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end">
            <Button onClick={closeDialog}>OK</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
