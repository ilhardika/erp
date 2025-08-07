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
import { STATUS_COLORS, STATUS_OPTIONS } from "@/lib/sales-constants";
import { useSalesOrders } from "@/hooks/use-sales";

export default function SalesOrdersPage() {
  const router = useRouter();
  const { orders, loading, error, filter, pagination, setFilter, deleteOrder } =
    useSalesOrders();

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sales order ini?")) return;

    const result = await deleteOrder(id);
    if (result.success) {
      console.log(result.message);
    } else {
      console.error(result.message);
    }
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
              onClick={() =>
                router.push(`/dashboard/sales/orders/${row.original.id}`)
              }
            >
              <Eye className="mr-2 h-4 w-4" />
              Lihat Detail
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() =>
                router.push(`/dashboard/sales/orders/${row.original.id}/edit`)
              }
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleDelete(row.original.id)}
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
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/sales")}
          className="shrink-0 p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-center sm:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Pesanan Penjualan</h1>
          <p className="text-gray-600 text-sm md:text-base">
            Kelola pesanan penjualan
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/sales/orders/create")}
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
    </div>
  );
}
