"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import { Plus, Eye, Edit, Trash2, Filter } from "lucide-react";

const statusOptions = [
  { value: "all", label: "Semua Status" },
  { value: "draft", label: "Draft" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
];

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  confirmed: "bg-blue-100 text-blue-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
};

export default function SalesOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    status: "all",
    search: "",
    page: 1,
    pageSize: 20,
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filter.status !== "all") params.append("status", filter.status);
      if (filter.search) params.append("search", filter.search);
      params.append("page", filter.page.toString());
      params.append("pageSize", filter.pageSize.toString());

      const response = await fetch(`/api/sales/orders?${params}`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const handleDelete = async (id) => {
    if (!confirm("Apakah Anda yakin ingin menghapus sales order ini?")) return;

    try {
      const response = await fetch(`/api/sales/orders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchOrders();
      } else {
        alert("Gagal menghapus sales order");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Terjadi kesalahan saat menghapus sales order");
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const columns = [
    {
      header: "Order Number",
      accessorKey: "order_number",
      cell: ({ row }) => (
        <div className="font-medium text-blue-600">{row.order_number}</div>
      ),
    },
    {
      header: "Customer",
      accessorKey: "customer_name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.customer_name}</div>
          <div className="text-sm text-gray-500">{row.customer_phone}</div>
        </div>
      ),
    },
    {
      header: "Order Date",
      accessorKey: "order_date",
      cell: ({ row }) => formatDate(row.order_date),
    },
    {
      header: "Delivery Date",
      accessorKey: "delivery_date",
      cell: ({ row }) => formatDate(row.delivery_date),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <Badge
          className={statusColors[row.status] || "bg-gray-100 text-gray-800"}
        >
          {row.status}
        </Badge>
      ),
    },
    {
      header: "Items",
      accessorKey: "item_count",
      cell: ({ row }) => (
        <div className="text-center">
          <span className="text-sm font-medium">{row.item_count}</span>
          <span className="text-xs text-gray-500"> items</span>
        </div>
      ),
    },
    {
      header: "Total Amount",
      accessorKey: "total_amount",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.total_amount)}
        </div>
      ),
    },
    {
      header: "Salesperson",
      accessorKey: "salesperson_name",
      cell: ({ row }) => row.salesperson_name || "-",
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push(`/dashboard/sales/orders/${row.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              router.push(`/dashboard/sales/orders/${row.id}/edit`)
            }
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDelete(row.id)}
            className="text-red-600 hover:text-red-800"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Sales Orders</h1>
          <p className="text-gray-600">Kelola pesanan penjualan</p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/sales/orders/create")}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Buat Order Baru
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <select
                value={filter.status}
                onChange={(e) =>
                  setFilter({ ...filter, status: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Search</label>
              <input
                type="text"
                placeholder="Cari order number atau customer..."
                value={filter.search}
                onChange={(e) =>
                  setFilter({ ...filter, search: e.target.value, page: 1 })
                }
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() =>
                  setFilter({
                    status: "all",
                    search: "",
                    page: 1,
                    pageSize: 20,
                  })
                }
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Sales Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={orders}
            loading={loading}
            pagination={pagination}
            onPageChange={(page) => setFilter({ ...filter, page })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
