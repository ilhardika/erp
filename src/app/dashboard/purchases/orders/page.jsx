"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Filter,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatCurrency, formatDateOnly } from "@/lib/format-utils";
import {
  PURCHASE_STATUS_COLORS,
  PO_STATUS_OPTIONS,
  PURCHASE_STATUS_LABELS,
} from "@/lib/purchase-constants";
import { usePurchaseOrders } from "@/hooks/use-purchases";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const {
    orders,
    loading,
    pagination,
    filters,
    updateFilters,
    updatePagination,
    refreshOrders,
  } = usePurchaseOrders();

  const handleDeleteOrder = async (orderId, orderNumber) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus PO ${orderNumber}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/purchases/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Purchase order berhasil dihapus!");
        refreshOrders();
      } else {
        alert(`Gagal menghapus purchase order: ${data.error}`);
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      alert("Terjadi kesalahan saat menghapus purchase order");
    }
  };

  const columns = [
    {
      header: "PO Number",
      accessorKey: "po_number",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">
            {row.original.po_number}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {formatDateOnly(row.original.order_date)}
          </div>
        </div>
      ),
    },
    {
      header: "Supplier",
      accessorKey: "supplier_name",
      cell: ({ row }) => (
        <div className="min-w-0">
          <div className="font-medium text-sm truncate">
            {row.original.supplier_name}
          </div>
          <div className="text-xs text-gray-500 truncate">
            {row.original.supplier_phone}
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
            PURCHASE_STATUS_COLORS[row.original.status] ||
            "bg-gray-100 text-gray-800"
          } text-xs`}
        >
          {PURCHASE_STATUS_LABELS[row.original.status] || row.original.status}
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
      header: "Items",
      accessorKey: "item_count",
      cell: ({ row }) => (
        <div className="text-center text-sm">
          {row.original.item_count} item
          {row.original.item_count > 1 ? "s" : ""}
        </div>
      ),
    },
    {
      header: "Expected Date",
      accessorKey: "expected_date",
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.expected_date
            ? formatDateOnly(row.original.expected_date)
            : "-"}
        </div>
      ),
    },
    {
      header: "Actions",
      accessorKey: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/purchases/orders/${row.original.id}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(
                  `/dashboard/purchases/orders/${row.original.id}/edit`
                )
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            {(row.original.status === "draft" ||
              row.original.status === "cancelled") && (
              <DropdownMenuItem
                onClick={() =>
                  handleDeleteOrder(row.original.id, row.original.po_number)
                }
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard")}
          className="shrink-0 p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Purchase Orders</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Kelola pesanan pembelian
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/purchases/orders/create")}
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat PO Baru
        </Button>
      </div>

      {/* Purchase Orders Table with Integrated Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Daftar Purchase Orders</CardTitle>

          {/* Filters integrated in header */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => updateFilters({ status: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Semua Status</option>
                {PO_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Dari Tanggal
              </label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => updateFilters({ date_from: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Sampai Tanggal
              </label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => updateFilters({ date_to: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            pagination={pagination}
            onPaginationChange={updatePagination}
            searchable={true}
            searchPlaceholder="Cari PO number, supplier..."
            onSearchChange={(search) => updateFilters({ search })}
            searchValue={filters.search}
          />
        </CardContent>
      </Card>
    </div>
  );
}
