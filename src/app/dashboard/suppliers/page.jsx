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

  const { deleteDialog, showDeleteDialog, confirmDelete } = useDeleteDialog();

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers");
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data);
      } else {
        console.error("Failed to fetch suppliers");
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    showDeleteDialog(
      "Delete Supplier",
      "Are you sure you want to delete this supplier?",
      async () => {
        try {
          const response = await fetch(`/api/suppliers/${id}`, {
            method: "DELETE",
          });

          if (response.ok) {
            setSuppliers((prev) =>
              prev.filter((supplier) => supplier.id !== id)
            );
          } else {
            console.error("Failed to delete supplier");
          }
        } catch (error) {
          console.error("Error deleting supplier:", error);
        }
      }
    );
  };

  const columnsWithDelete = createSupplierColumns(handleDeleteClick);

  const renderHeaderActions = () => (
    <Button onClick={() => router.push("/dashboard/suppliers/create")}>
      <Plus className="mr-2 h-4 w-4" />
      Add Supplier
    </Button>
  );

  return (
    <>
      <DashboardDataTableLayout
        title="Suppliers"
        description="Manage your suppliers"
        data={suppliers}
        columns={columnsWithDelete}
        isLoading={isLoading}
        actions={renderHeaderActions()}
      />

      {deleteDialog}
    </>
  );
}
