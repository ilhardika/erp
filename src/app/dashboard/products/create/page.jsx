"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

export default function CreateProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState(""); // "error" | "success"
  const [dialogMessage, setDialogMessage] = useState("");

  const [formData, setFormData] = useState({
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
    supplier: "", // Keep for backward compatibility
    supplier_id: "", // New field for foreign key
    status: "active",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
  });

  // Load suppliers on component mount
  useEffect(() => {
    const loadSuppliers = async () => {
      try {
        const response = await fetch("/api/suppliers/list");
        const result = await response.json();
        if (result.success) {
          setSuppliers(result.data);
        }
      } catch (error) {
        console.error("Error loading suppliers:", error);
      }
    };
    loadSuppliers();
  }, []);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    console.log("Input change:", { name, value, type: typeof value });

    if (name.startsWith("dimensions.")) {
      const dimensionKey = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        dimensions: {
          ...prev.dimensions,
          [dimensionKey]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const generateProductCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    const code = `PRD${timestamp}${random}`;
    setFormData((prev) => ({ ...prev, code }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Debug: log form data values
      console.log("Form data validation check:", {
        name: formData.name,
        code: formData.code,
        price: formData.price,
        category: formData.category,
        nameEmpty: !formData.name,
        codeEmpty: !formData.code,
        priceEmpty: !formData.price,
        categoryEmpty: !formData.category,
      });

      // Validate required fields with more specific checks
      if (
        !formData.name ||
        !formData.code ||
        !formData.price ||
        formData.price === "" ||
        !formData.category
      ) {
        const missingFields = [];
        if (!formData.name) missingFields.push("Nama Produk");
        if (!formData.code) missingFields.push("Kode Produk");
        if (!formData.price || formData.price === "")
          missingFields.push("Harga");
        if (!formData.category) missingFields.push("Kategori");

        setDialogType("error");
        setDialogMessage(
          `Mohon isi field yang wajib: ${missingFields.join(", ")}`
        );
        setDialogOpen(true);
        setLoading(false);
        return;
      }

      // Prepare data for submission
      const submitData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        cost: parseFloat(formData.cost) || 0,
        stock: parseInt(formData.stock) || 0,
        minStock: parseInt(formData.minStock) || 0,
        weight: parseFloat(formData.weight) || 0,
        dimensions: {
          length: parseFloat(formData.dimensions.length) || 0,
          width: parseFloat(formData.dimensions.width) || 0,
          height: parseFloat(formData.dimensions.height) || 0,
        },
      };

      console.log("Data to be submitted:", submitData);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        setDialogType("success");
        setDialogMessage("Produk berhasil dibuat!");
        setDialogOpen(true);
        setTimeout(() => {
          setDialogOpen(false);
          router.push("/dashboard/products");
        }, 1500);
      } else {
        setDialogType("error");
        setDialogMessage(data.error || "Gagal membuat produk");
        setDialogOpen(true);
      }
    } catch (error) {
      console.error("Error creating product:", error);
      setDialogType("error");
      setDialogMessage("Terjadi kesalahan saat membuat produk");
      setDialogOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardFormLayout
      title="Tambah Produk Baru"
      description="Buat produk baru dalam inventori Anda"
      backLink="/dashboard/products"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Produk</CardTitle>
              <CardDescription>
                Detail dasar tentang produk Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
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
                <div>
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
                      onClick={generateProductCode}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Deskripsi</Label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsi produk"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md resize-none"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Kategori *</Label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
                <div>
                  <Label htmlFor="supplier_id">Supplier</Label>
                  <select
                    id="supplier_id"
                    name="supplier_id"
                    value={formData.supplier_id}
                    onChange={handleInputChange}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="">Pilih Supplier (Opsional)</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.code} - {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  placeholder="Product barcode"
                />
              </div>
            </CardContent>
          </Card>

          {/* Dimensions & Weight */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Physical Properties</CardTitle>
              <CardDescription>
                Dimensions and weight information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  name="weight"
                  type="number"
                  step="0.01"
                  value={formData.weight}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label>Dimensions (cm)</Label>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    name="dimensions.length"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.length}
                    onChange={handleInputChange}
                    placeholder="Length"
                  />
                  <Input
                    name="dimensions.width"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.width}
                    onChange={handleInputChange}
                    placeholder="Width"
                  />
                  <Input
                    name="dimensions.height"
                    type="number"
                    step="0.01"
                    value={formData.dimensions.height}
                    onChange={handleInputChange}
                    placeholder="Height"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pricing & Inventory */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Harga & Stok</CardTitle>
              <CardDescription>Atur harga dan level stok</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">Harga Jual (IDR) *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <Label htmlFor="cost">Harga Beli (IDR)</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  value={formData.cost}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="stock">Stok Awal</Label>
                <Input
                  id="stock"
                  name="stock"
                  type="number"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="minStock">Stok Minimum</Label>
                <Input
                  id="minStock"
                  name="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={handleInputChange}
                  placeholder="0"
                />
              </div>

              <div>
                <Label htmlFor="unit">Satuan</Label>
                <select
                  id="unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {units.map((unit) => (
                    <option key={unit} value={unit}>
                      {unit}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <div className="flex flex-col gap-3">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? (
                    <>
                      <Package className="h-4 w-4 mr-2 animate-spin" />
                      Membuat...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Simpan Produk
                    </>
                  )}
                </Button>
                <Link href="/dashboard/products">
                  <Button variant="outline" className="w-full">
                    Batal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog untuk notifikasi */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogType === "success" ? "Berhasil!" : "Error"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </DashboardFormLayout>
  );
}
