"use client";

import { useState } from "react";
import { Building2 } from "lucide-react";
import DashboardDataTableLayout from "@/components/layouts/dashboard-datatable-layout";
import { createSupplierColumns } from "@/components/columns/supplier-columns";
import { useStandardDataTable, API_ENDPOINTS } from "@/hooks";

export default function SuppliersPage() {
  const [selectedType, setSelectedType] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // Use standardized data table hook
  const {
    data: suppliers,
    loading,
    error,
    onDelete,
    showDeleteDialog,
    closeDeleteDialog,
    fetchData: fetchSuppliers,
  } = useStandardDataTable(API_ENDPOINTS.SUPPLIERS, {
    pageSize: 20,
    errorMessage: "Gagal memuat data supplier",
  });

  // Columns for data table
  const columns = createSupplierColumns((id, name) =>
    onDelete(id, `supplier "${name}"`)
  );

  const confirmDelete = async () => {
    await onDelete(showDeleteDialog?.id, showDeleteDialog?.name);
  };

  // Filter components for conditional filtering
  const filters = [
    <select
      key="type"
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Semua Tipe</option>
      <option value="distributor">Distributor</option>
      <option value="manufacturer">Manufacturer</option>
      <option value="wholesaler">Wholesaler</option>
      <option value="retailer">Retailer</option>
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
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesType = !selectedType || supplier.type === selectedType;
    const matchesStatus = !selectedStatus || supplier.status === selectedStatus;
    return matchesType && matchesStatus;
  });

  return (
    <DashboardDataTableLayout
      // Header props
      title="Supplier"
      description="Kelola data supplier dan vendor"
      addButtonText="Tambah Supplier"
      addButtonLink="/dashboard/suppliers/create"
      // Data props
      data={suppliers}
      filteredData={filteredSuppliers}
      loading={loading}
      columns={columns}
      // DataTable props
      searchPlaceholder="Cari supplier, nama perusahaan, atau kontak..."
      filters={filters}
      emptyStateIcon={Building2}
      emptyTitle="Belum ada supplier"
      emptyDescription="Mulai dengan menambahkan supplier pertama Anda"
      emptyActionText="Tambah Supplier Pertama"
      emptyActionLink="/dashboard/suppliers/create"
      pageSize={10}
      // Delete dialog props
      showDeleteDialog={!!showDeleteDialog}
      onCloseDeleteDialog={closeDeleteDialog}
      deleteTitle="Konfirmasi Hapus Supplier"
      deleteDescription={`Apakah Anda yakin ingin menghapus supplier "${
        showDeleteDialog?.name || ""
      }"? Tindakan ini tidak dapat dibatalkan.`}
      deleteError={error}
      onConfirmDelete={confirmDelete}
      // Card customization
      cardTitle="Daftar Supplier"
      cardDescription={`Menampilkan ${filteredSuppliers.length} dari ${suppliers.length} supplier`}
      loadingMessage="Memuat supplier..."
    />
  );
}
