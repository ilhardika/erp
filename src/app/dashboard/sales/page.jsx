"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Eye, Edit, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDateOnly } from "@/lib/format-utils";
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/sales-constants";
import { useSalesOrders } from "@/hooks/use-sales";

export default function SalesPage() {
  const router = useRouter();
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    order: null,
  });
  const { orders, loading, error, filter, pagination, setFilter, deleteOrder } =
    useSalesOrders();

  const handleDeleteClick = (order) => {
    setDeleteDialog({ open: true, order });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.order) return;

    const result = await deleteOrder(deleteDialog.order.id);
    if (result.success) {
      // Order deleted successfully
    } else {
      alert("Gagal menghapus sales order");
    }
    setDeleteDialog({ open: false, order: null });
  };

  const statusLabels = {
    draft: "Draft",
    confirmed: "Dikonfirmasi",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Selesai",
  };

  const columns = [
    {
      header: "No. Order",
      accessorKey: "order_number",
      cell: ({ row }) => (
        <div className="font-medium text-blue-600 text-sm">
          {row.original.order_number}
        </div>
      ),
    },
    {
      header: "Pelanggan",
      accessorKey: "customer_name",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">
            {row.original.customer_name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {row.original.customer_phone}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge
          className={`${
            STATUS_COLORS[row.original.status] || "bg-gray-100 text-gray-800"
          } text-xs`}
        >
          {statusLabels[row.original.status] || row.original.status}
        </Badge>
      ),
    },
    {
      header: "Total",
      accessorKey: "total_amount",
      cell: ({ row }) => (
        <div className="text-right font-medium text-sm">
          {formatCurrency(row.original.total_amount)}
        </div>
      ),
    },
    {
      header: "Aksi",
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => router.push(`/dashboard/sales/${row.original.id}`)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/sales/${row.original.id}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDeleteClick(row.original)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pesanan Penjualan</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Kelola pesanan penjualan
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/sales/create")}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Order Baru
        </Button>
      </div>

      {/* Orders Table with Integrated Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Pesanan Penjualan</CardTitle>

          {/* Filters integrated in header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">Semua Status</option>
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Pencarian
              </label>
              <input
                type="text"
                placeholder="Cari nomor order atau customer..."
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <DataTable
              columns={columns}
              data={orders}
              loading={loading}
              pagination={pagination}
              onPageChange={(page) => setFilter({ ...filter, page })}
              showSearch={false}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ open, order: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus sales order "
              {deleteDialog.order?.order_number}"? Tindakan ini tidak dapat
              dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, order: null })}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
