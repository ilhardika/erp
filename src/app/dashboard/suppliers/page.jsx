"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import DashboardDataTableLayout from "@/components/layouts/dashboard-datatable-layout";
import { createSupplierColumns } from "@/components/columns/supplier-columns";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";

export default function SuppliersPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    showDeleteDialog,
    deleteId,
    deleteError,
    handleDeleteClick: openDeleteDialog,
    closeDeleteDialog,
    setDeleteError,
  } = useDeleteDialog();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const result = await response.json();
        // Handle the new API response format
        setSuppliers(result.success ? result.data : []);
      } else {
        }
    } catch (error) {
      } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    openDeleteDialog(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;

    try {
      const response = await fetch(`/api/suppliers/${deleteId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setSuppliers((prev) =>
          prev.filter((supplier) => supplier.id !== deleteId)
        );
        closeDeleteDialog();
      } else {
        setDeleteError("Failed to delete supplier");
      }
    } catch (error) {
      setDeleteError("Error deleting supplier");
    }
  };

  const columnsWithDelete = createSupplierColumns(handleDeleteClick);

  return (
    <>
      <DashboardDataTableLayout
        title="Suppliers"
        description="Manage your suppliers"
        data={suppliers}
        filteredData={suppliers}
        loading={isLoading}
        columns={columnsWithDelete}
        emptyTitle="Belum ada supplier"
        emptyDescription="Mulai dengan menambahkan supplier pertama Anda"
        emptyActionText="Tambah Supplier"
        emptyActionLink="/dashboard/suppliers/create"
        addButtonText="Tambah Supplier"
        addButtonLink="/dashboard/suppliers/create"
        showDeleteDialog={showDeleteDialog}
        onCloseDeleteDialog={closeDeleteDialog}
        deleteTitle="Konfirmasi Hapus"
        deleteDescription="Apakah Anda yakin ingin menghapus supplier ini? Tindakan ini tidak dapat dibatalkan."
        deleteError={deleteError}
        onConfirmDelete={confirmDelete}
      />
    </>
  );
}

