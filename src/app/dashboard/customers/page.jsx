"use client";

import { useState } from "react";
import { Users } from "lucide-react";
import DashboardDataTableLayout from "@/components/layouts/dashboard-datatable-layout";
import { createCustomerColumns } from "@/components/columns/customer-columns";
import { useStandardDataTable, API_ENDPOINTS } from "@/hooks";

export default function CustomersPage() {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");

  // Use standardized data table hook
  const {
    data: customers,
    loading,
    error,
    onDelete,
    showDeleteDialog,
    deleteId,
    deleteError,
    handleDeleteClick,
    closeDeleteDialog,
    fetchData: fetchCustomers,
  } = useStandardDataTable(API_ENDPOINTS.CUSTOMERS, {
    pageSize: 20,
    errorMessage: "Gagal memuat data customer",
  });

  // Columns for data table
  const columns = createCustomerColumns(handleDeleteClick);

  const confirmDelete = async () => {
    const customer = customers.find((c) => c.id === deleteId);
    await onDelete(deleteId, customer?.name || `customer ${deleteId}`);
  };

  // Filter components for conditional filtering
  const filters = [
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
    <select
      key="type"
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
    >
      <option value="">Semua Tipe</option>
      <option value="retail">Retail</option>
      <option value="wholesale">Grosir</option>
      <option value="corporate">Korporat</option>
    </select>,
  ];

  // Filter data based on selected filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesStatus = !selectedStatus || customer.status === selectedStatus;
    const matchesType =
      !selectedType || customer.customer_type === selectedType;
    return matchesStatus && matchesType;
  });

  return (
    <DashboardDataTableLayout
      // Header props
      title="Customer"
      description="Kelola data customer dan pelanggan"
      addButtonText="Tambah Customer"
      addButtonLink="/dashboard/customers/create"
      // Data props
      data={customers}
      filteredData={filteredCustomers}
      loading={loading}
      columns={columns}
      // DataTable props
      searchPlaceholder="Cari customer, kode, atau email..."
      filters={filters}
      emptyStateIcon={Users}
      emptyTitle="Belum ada customer"
      emptyDescription="Mulai dengan menambahkan customer pertama Anda"
      emptyActionText="Tambah Customer Pertama"
      emptyActionLink="/dashboard/customers/create"
      pageSize={10}
      // Delete dialog props
      showDeleteDialog={!!showDeleteDialog}
      onCloseDeleteDialog={closeDeleteDialog}
      deleteTitle="Konfirmasi Hapus Customer"
      deleteDescription={`Apakah Anda yakin ingin menghapus customer "${
        customers.find((c) => c.id === deleteId)?.name || ""
      }"? Tindakan ini tidak dapat dibatalkan.`}
      deleteError={deleteError}
      onConfirmDelete={confirmDelete}
      // Card customization
      cardTitle="Daftar Customer"
      cardDescription={`Menampilkan ${filteredCustomers.length} dari ${customers.length} customer`}
      loadingMessage="Memuat customer..."
    />
  );
}
