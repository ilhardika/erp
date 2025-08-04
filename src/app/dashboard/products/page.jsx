"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  Edit,
  Trash2,
  Package,
  AlertTriangle,
  Eye,
  Download,
  Upload,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

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
    totalPages: 0,
  });

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, selectedCategory, selectedStatus, pagination.page]);

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/products/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteId(null);
        fetchProducts();
      } else {
        setDeleteError("Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError("Gagal menghapus produk");
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) {
      return {
        label: "Habis",
        color: "text-red-600",
        warning: true,
      };
    } else if (stock <= minStock) {
      return {
        label: "Stok Rendah",
        color: "text-yellow-600",
        warning: true,
      };
    }
    return {
      label: "Normal",
      color: "text-green-600",
      warning: false,
    };
  };

  return (
    <div className="space-y-6">
      {/* Dialog konfirmasi hapus produk */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Produk</DialogTitle>
          </DialogHeader>
          <div className="my-4 text-gray-700">
            Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak
            dapat dibatalkan.
          </div>
          {deleteError && (
            <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
              {deleteError}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Konten utama dashboard produk */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Menampilkan {pagination.total} produk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari produk, kode, atau deskripsi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-500">Memuat produk...</p>
            </div>
          ) : products.length === 0 ? (
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
            <div className="w-full overflow-x-auto border rounded-lg">
              <table className="min-w-[800px] bg-white">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 min-w-[200px] font-medium text-gray-900">
                      Produk
                    </th>
                    <th className="text-left p-4 min-w-[100px] font-medium text-gray-900">
                      Kode
                    </th>
                    <th className="text-left p-4 min-w-[100px] font-medium text-gray-900">
                      Kategori
                    </th>
                    <th className="text-left p-4 min-w-[120px] font-medium text-gray-900">
                      Harga
                    </th>
                    <th className="text-left p-4 min-w-[80px] font-medium text-gray-900">
                      Stok
                    </th>
                    <th className="text-left p-4 min-w-[80px] font-medium text-gray-900">
                      Status
                    </th>
                    <th className="text-left p-4 min-w-[120px] font-medium text-gray-900">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(
                      product.stock,
                      product.min_stock || 0
                    );
                    return (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-gray-50"
                      >
                        <td className="p-4">
                          <div>
                            <p className="font-medium">{product.name}</p>
                            {product.description && (
                              <p className="text-sm text-gray-500 truncate max-w-[180px]">
                                {product.description}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                            {product.code}
                          </code>
                        </td>
                        <td className="p-4">
                          <Badge variant="secondary">{product.category}</Badge>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">
                            {formatPrice(product.price)}
                          </p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-medium ${stockStatus.color}`}
                            >
                              {product.stock}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {product.unit}
                            </span>
                          </div>
                          {stockStatus.warning && (
                            <div className="flex items-center gap-1 mt-1">
                              <AlertTriangle className="h-3 w-3 text-yellow-500" />
                              <span className="text-xs text-yellow-600">
                                {stockStatus.label}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <Badge
                            variant={
                              product.status === "active" ? "success" : "danger"
                            }
                          >
                            {product.status === "active" ? "Aktif" : "Nonaktif"}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <Link href={`/dashboard/products/${product.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Link
                              href={`/dashboard/products/${product.id}/edit`}
                            >
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(product.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-gray-500">
              Halaman {pagination.page} dari {pagination.totalPages} (
              {pagination.total} total)
            </div>
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
                disabled={pagination.page >= pagination.totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
