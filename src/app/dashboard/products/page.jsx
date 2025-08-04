"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Eye,
  Download,
  Upload,
} from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, searchTerm, selectedCategory, selectedStatus]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(selectedCategory && { category: selectedCategory }),
        ...(selectedStatus && { status: selectedStatus }),
      });

      const response = await fetch(`/api/products?${params}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products);
        setPagination(data.data.pagination);
        setCategories(data.data.categories);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus produk ini?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProducts();
      } else {
        alert("Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Gagal menghapus produk");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return { label: "Stok Habis", color: "text-red-600" };
    if (stock <= minStock)
      return { label: "Stok Rendah", color: "text-yellow-600" };
    return { label: "Stok Tersedia", color: "text-green-600" };
  };

  if (loading && products.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">Memuat produk...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Produk</h1>
          <p className="text-gray-600">Kelola inventori produk Anda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Impor
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Ekspor
          </Button>
          <Link href="/dashboard/products/create">
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Tambah Produk
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Total Produk
                </p>
                <p className="text-2xl font-bold">{pagination.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stok Rendah</p>
                <p className="text-2xl font-bold">
                  {
                    products.filter((p) => p.stock <= p.minStock && p.stock > 0)
                      .length
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Trash2 className="h-8 w-8 text-red-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Stok Habis</p>
                <p className="text-2xl font-bold">
                  {products.filter((p) => p.stock <= 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Kategori</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Cari produk berdasarkan nama, kode, atau deskripsi..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => handleCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                value={selectedStatus}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Tidak Aktif</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            {pagination.total} total produk ditemukan
          </CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Tidak ada produk ditemukan</p>
              <Link href="/dashboard/products/create">
                <Button className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk Pertama
                </Button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-full">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2 md:p-4 min-w-[200px]">
                        Produk
                      </th>
                      <th className="text-left p-2 md:p-4 min-w-[120px]">
                        Kode
                      </th>
                      <th className="text-left p-2 md:p-4 min-w-[100px] hidden sm:table-cell">
                        Kategori
                      </th>
                      <th className="text-left p-2 md:p-4 min-w-[120px]">
                        Harga
                      </th>
                      <th className="text-left p-2 md:p-4 min-w-[100px]">
                        Stok
                      </th>
                      <th className="text-left p-2 md:p-4 min-w-[80px] hidden md:table-cell">
                        Status
                      </th>
                      <th className="text-left p-2 md:p-4 min-w-[120px]">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => {
                      const stockStatus = getStockStatus(
                        product.stock,
                        product.minStock
                      );
                      return (
                        <tr
                          key={product._id}
                          className="border-b hover:bg-gray-50"
                        >
                          <td className="p-2 md:p-4">
                            <div>
                              <p className="font-medium text-sm md:text-base">
                                {product.name}
                              </p>
                              {product.description && (
                                <p className="text-xs md:text-sm text-gray-500 truncate max-w-[150px] md:max-w-xs">
                                  {product.description}
                                </p>
                              )}
                              {/* Mobile-only category */}
                              <div className="sm:hidden mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {product.category}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 md:p-4">
                            <code className="bg-gray-100 px-1.5 md:px-2 py-1 rounded text-xs md:text-sm">
                              {product.code}
                            </code>
                          </td>
                          <td className="p-2 md:p-4 hidden sm:table-cell">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-2 md:p-4">
                            <div>
                              <p className="font-medium text-sm md:text-base">
                                {formatPrice(product.price)}
                              </p>
                              {product.cost > 0 && (
                                <p className="text-xs md:text-sm text-gray-500">
                                  Modal: {formatPrice(product.cost)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="p-2 md:p-4">
                            <div>
                              <p
                                className={`font-medium text-sm md:text-base ${stockStatus.color}`}
                              >
                                {product.stock} {product.unit}
                              </p>
                              <p className="text-xs text-gray-500">
                                Min: {product.minStock}
                              </p>
                              {/* Mobile-only status */}
                              <div className="md:hidden mt-1">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    product.status === "active"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {product.status === "active"
                                    ? "Aktif"
                                    : "Tidak Aktif"}
                                </span>
                              </div>
                            </div>
                          </td>
                          <td className="p-2 md:p-4 hidden md:table-cell">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                product.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {product.status === "active"
                                ? "Aktif"
                                : "Tidak Aktif"}
                            </span>
                          </td>
                          <td className="p-2 md:p-4">
                            <div className="flex items-center gap-1 md:gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                title="Lihat Detail"
                                onClick={() =>
                                  window.open(
                                    `/dashboard/products/${product._id}`,
                                    "_blank"
                                  )
                                }
                              >
                                <Eye className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                              <Link
                                href={`/dashboard/products/${product._id}/edit`}
                              >
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  title="Edit"
                                >
                                  <Edit className="h-3 w-3 md:h-4 md:w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                title="Hapus"
                                onClick={() => handleDelete(product._id)}
                              >
                                <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-700">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1}{" "}
                sampai{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} produk
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                  }
                  disabled={pagination.page <= 1}
                >
                  Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                  }
                  disabled={pagination.page >= pagination.pages}
                >
                  Selanjutnya
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
