"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Plus, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { createProductColumns } from "@/components/columns/product-columns";

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
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setShowDeleteDialog(true);
  };

  // Columns for data table
  const columns = createProductColumns(handleDeleteClick);

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

  // Filter components
  const filters = (
    <>
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
    </>
  );

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Produk</CardTitle>
              <CardDescription>
                Menampilkan {pagination.total} produk
              </CardDescription>
            </div>
            <Link href="/dashboard/products/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Tambah Produk
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
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
            <DataTable
              columns={columns}
              data={products}
              searchPlaceholder="Cari produk, kode, atau deskripsi..."
              filters={filters}
              pagination={pagination}
              setPagination={setPagination}
              onSearchChange={setSearchTerm}
            />
          )}
        </CardContent>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t">
            <div className="flex items-center justify-between">
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
          </div>
        )}
      </Card>
    </div>
  );
}
