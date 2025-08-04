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
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
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
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products");
      const data = await response.json();

      if (data.success) {
        setProducts(data.data.products || []);
        setCategories(data.data.categories || []);
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
        fetchProducts(); // Reload data after delete
      } else {
        setDeleteError("Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError("Gagal menghapus produk");
    }
  };

  // Filter components for conditional filtering
  const filters = [
    <select
      key="category"
      value={selectedCategory}
      onChange={(e) => setSelectedCategory(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Semua Kategori</option>
      {categories.map((category) => (
        <option key={category} value={category}>
          {category}
        </option>
      ))}
    </select>,
    <select
      key="status"
      value={selectedStatus}
      onChange={(e) => setSelectedStatus(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Semua Status</option>
      <option value="active">Aktif</option>
      <option value="inactive">Nonaktif</option>
    </select>,
  ];

  // Filter data based on selected filters
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      !selectedCategory || product.category === selectedCategory;
    const matchesStatus = !selectedStatus || product.status === selectedStatus;
    return matchesCategory && matchesStatus;
  });

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Produk</h1>
          <p className="text-gray-500 mt-2">Kelola data produk dan inventori</p>
        </div>
        <Link href="/dashboard/products/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Produk
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            Menampilkan {filteredProducts.length} dari {products.length} produk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Memuat produk...</p>
            </div>
          ) : (
            <DataTable
              data={filteredProducts}
              columns={columns}
              searchPlaceholder="Cari produk, kode, atau deskripsi..."
              filters={filters}
              emptyMessage={
                <div className="text-center py-12">
                  <Package className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {products.length === 0
                      ? "Belum ada produk"
                      : "Produk tidak ditemukan"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {products.length === 0
                      ? "Mulai dengan menambahkan produk pertama Anda"
                      : "Coba ubah kriteria pencarian atau filter"}
                  </p>
                  {products.length === 0 && (
                    <Link href="/dashboard/products/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Produk Pertama
                      </Button>
                    </Link>
                  )}
                </div>
              }
              pageSize={10}
              showSearch={true}
              showPagination={true}
              enableSorting={true}
              enableFiltering={true}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
