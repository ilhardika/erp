"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import DashboardDataTableLayout from "@/components/layouts/dashboard-datatable-layout";
import { createProductColumns } from "@/components/columns/product-columns";
import { useStandardDataTable, useDataFetch, API_ENDPOINTS } from "@/hooks";

export default function ProductsPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Use standardized data table hook
  const {
    data: products,
    loading,
    error,
    onDelete,
    showDeleteDialog,
    closeDeleteDialog,
    fetchData: fetchProducts,
  } = useStandardDataTable(API_ENDPOINTS.PRODUCTS, {
    pageSize: 20,
    errorMessage: "Gagal memuat data produk",
  });

  // Fetch categories separately
  const { data: categoriesData, fetchData: fetchCategories } = useDataFetch(
    "/api/products/categories",
    {
      immediate: true,
      errorMessage: "Gagal memuat kategori",
    }
  );

  useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Columns for data table
  const columns = createProductColumns((id, name) =>
    onDelete(id, `produk "${name}"`)
  );

  const confirmDelete = async () => {
    await onDelete(showDeleteDialog?.id, showDeleteDialog?.name);
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
    <DashboardDataTableLayout
      // Header props
      title="Produk"
      description="Kelola data produk dan inventori"
      addButtonText="Tambah Produk"
      addButtonLink="/dashboard/products/create"
      // Data props
      data={products}
      filteredData={filteredProducts}
      loading={loading}
      columns={columns}
      // DataTable props
      searchPlaceholder="Cari produk, kode, atau deskripsi..."
      filters={filters}
      emptyStateIcon={Package}
      emptyTitle="Belum ada produk"
      emptyDescription="Mulai dengan menambahkan produk pertama Anda"
      emptyActionText="Tambah Produk Pertama"
      emptyActionLink="/dashboard/products/create"
      pageSize={10}
      // Delete dialog props
      showDeleteDialog={!!showDeleteDialog}
      onCloseDeleteDialog={closeDeleteDialog}
      deleteTitle="Konfirmasi Hapus Produk"
      deleteDescription={`Apakah Anda yakin ingin menghapus produk "${
        showDeleteDialog?.name || ""
      }"? Tindakan ini tidak dapat dibatalkan.`}
      deleteError={error}
      onConfirmDelete={confirmDelete}
      // Card customization
      cardTitle="Daftar Produk"
      cardDescription={`Menampilkan ${filteredProducts.length} dari ${products.length} produk`}
      loadingMessage="Memuat produk..."
    />
  );
}
