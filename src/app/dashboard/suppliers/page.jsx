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
import { Plus, Building2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { createSupplierColumns } from "@/components/columns/supplier-columns";

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setDeleteError("");
    setShowDeleteDialog(true);
  };

  // Columns for data table
  const columns = createSupplierColumns(handleDeleteClick);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/suppliers?limit=1000");
      const data = await response.json();

      if (data.success) {
        setSuppliers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/suppliers/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteId(null);
        fetchSuppliers(); // Reload data after delete
      } else {
        setDeleteError("Gagal menghapus supplier");
      }
    } catch (error) {
      console.error("Error deleting supplier:", error);
      setDeleteError("Gagal menghapus supplier");
    }
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
      <option value="material">Material</option>
      <option value="service">Jasa</option>
      <option value="goods">Barang</option>
      <option value="equipment">Peralatan</option>
    </select>,
  ];

  // Filter data based on selected filters
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesStatus = !selectedStatus || supplier.status === selectedStatus;
    const matchesType =
      !selectedType || supplier.supplier_type === selectedType;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Dialog konfirmasi hapus supplier */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Supplier</DialogTitle>
          </DialogHeader>
          <div className="my-4 text-gray-700">
            Apakah Anda yakin ingin menghapus supplier ini? Tindakan ini tidak
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
          <h1 className="text-3xl font-bold tracking-tight">Supplier</h1>
          <p className="text-gray-500 mt-2">Kelola data supplier dan vendor</p>
        </div>
        <Link href="/dashboard/suppliers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Supplier
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Supplier</CardTitle>
          <CardDescription>
            Menampilkan {filteredSuppliers.length} dari {suppliers.length}{" "}
            supplier
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Memuat supplier...</p>
            </div>
          ) : (
            <DataTable
              data={filteredSuppliers}
              columns={columns}
              searchPlaceholder="Cari supplier, kode, atau email..."
              filters={filters}
              emptyMessage={
                <div className="text-center py-12">
                  <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {suppliers.length === 0
                      ? "Belum ada supplier"
                      : "Supplier tidak ditemukan"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {suppliers.length === 0
                      ? "Mulai dengan menambahkan supplier pertama Anda"
                      : "Coba ubah kriteria pencarian atau filter"}
                  </p>
                  {suppliers.length === 0 && (
                    <Link href="/dashboard/suppliers/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Supplier Pertama
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
