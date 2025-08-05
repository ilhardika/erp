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
import { Plus, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
import { createCustomerColumns } from "@/components/columns/customer-columns";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
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
  const columns = createCustomerColumns(handleDeleteClick);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/customers?limit=1000");
      const data = await response.json();

      if (data.success) {
        setCustomers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      const response = await fetch(`/api/customers/${deleteId}`, {
        method: "DELETE",
      });
      if (response.ok) {
        setShowDeleteDialog(false);
        setDeleteId(null);
        fetchCustomers(); // Reload data after delete
      } else {
        setDeleteError("Gagal menghapus customer");
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      setDeleteError("Gagal menghapus customer");
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
      <option value="retail">Retail</option>
      <option value="wholesale">Grosir</option>
      <option value="corporate">Korporat</option>
    </select>,
  ];

  // Filter data based on selected filters
  const filteredCustomers = customers.filter((customer) => {
    const matchesStatus = !selectedStatus || customer.status === selectedStatus;
    const matchesType = !selectedType || customer.customer_type === selectedType;
    return matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Dialog konfirmasi hapus customer */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus Customer</DialogTitle>
          </DialogHeader>
          <div className="my-4 text-gray-700">
            Apakah Anda yakin ingin menghapus customer ini? Tindakan ini tidak
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
          <h1 className="text-3xl font-bold tracking-tight">Customer</h1>
          <p className="text-gray-500 mt-2">Kelola data customer dan pelanggan</p>
        </div>
        <Link href="/dashboard/customers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Tambah Customer
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Customer</CardTitle>
          <CardDescription>
            Menampilkan {filteredCustomers.length} dari {customers.length} customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Memuat customer...</p>
            </div>
          ) : (
            <DataTable
              data={filteredCustomers}
              columns={columns}
              searchPlaceholder="Cari customer, kode, atau email..."
              filters={filters}
              emptyMessage={
                <div className="text-center py-12">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {customers.length === 0
                      ? "Belum ada customer"
                      : "Customer tidak ditemukan"}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {customers.length === 0
                      ? "Mulai dengan menambahkan customer pertama Anda"
                      : "Coba ubah kriteria pencarian atau filter"}
                  </p>
                  {customers.length === 0 && (
                    <Link href="/dashboard/customers/create">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Tambah Customer Pertama
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
