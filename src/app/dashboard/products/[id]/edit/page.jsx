"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Save, Package } from "lucide-react";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
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
    supplier: "",
    status: "active",
    weight: "",
    dimensions: {
      length: "",
      width: "",
      height: "",
    },
  });

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

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setInitialLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        const product = data.data;
        setFormData({
          name: product.name || "",
          code: product.code || "",
          description: product.description || "",
          category: product.category || "",
          price: product.price?.toString() || "",
          cost: product.cost?.toString() || "",
          stock: product.stock?.toString() || "",
          minStock: product.minStock?.toString() || "",
          unit: product.unit || "pcs",
          barcode: product.barcode || "",
          supplier: product.supplier || "",
          status: product.status || "active",
          weight: product.weight?.toString() || "",
          dimensions: {
            length: product.dimensions?.length?.toString() || "",
            width: product.dimensions?.width?.toString() || "",
            height: product.dimensions?.height?.toString() || "",
          },
        });
      } else {
        alert("Produk tidak ditemukan");
        router.push("/dashboard/products");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Terjadi kesalahan saat memuat produk");
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate required fields
      if (
        !formData.name ||
        !formData.code ||
        !formData.price ||
        !formData.category
      ) {
        alert("Mohon isi semua field yang wajib diisi");
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

      const response = await fetch(`/api/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (data.success) {
        router.push(`/dashboard/products/${params.id}`);
      } else {
        alert(data.error || "Gagal mengupdate produk");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Gagal mengupdate produk");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-500">Memuat produk...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href={`/dashboard/products/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Edit Produk</h1>
          <p className="text-gray-600">
            Update informasi produk dalam inventori Anda
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
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
                    <Input
                      id="code"
                      name="code"
                      value={formData.code}
                      onChange={handleInputChange}
                      placeholder="Masukkan kode produk"
                      required
                    />
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
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input
                      id="supplier"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleInputChange}
                      placeholder="Nama supplier"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    placeholder="Barcode produk"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Dimensions & Weight */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Properti Fisik</CardTitle>
                <CardDescription>Informasi dimensi dan berat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="weight">Berat (kg)</Label>
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
                  <Label>Dimensi (cm)</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      name="dimensions.length"
                      type="number"
                      step="0.01"
                      value={formData.dimensions.length}
                      onChange={handleInputChange}
                      placeholder="Panjang"
                    />
                    <Input
                      name="dimensions.width"
                      type="number"
                      step="0.01"
                      value={formData.dimensions.width}
                      onChange={handleInputChange}
                      placeholder="Lebar"
                    />
                    <Input
                      name="dimensions.height"
                      type="number"
                      step="0.01"
                      value={formData.dimensions.height}
                      onChange={handleInputChange}
                      placeholder="Tinggi"
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
                <CardTitle>Harga & Inventori</CardTitle>
                <CardDescription>Atur harga dan level stok</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="price">Harga Jual (IDR) *</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cost">Harga Modal (IDR)</Label>
                  <Input
                    id="cost"
                    name="cost"
                    type="number"
                    step="0.01"
                    value={formData.cost}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="stock">Stok Saat Ini</Label>
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
                  <Label htmlFor="unit">Unit</Label>
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
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Perubahan
                      </>
                    )}
                  </Button>
                  <Link href={`/dashboard/products/${params.id}`}>
                    <Button variant="outline" className="w-full">
                      Batal
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
