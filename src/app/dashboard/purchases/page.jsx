"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/ui/data-table";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });

  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    approvedOrders: 0,
    totalValue: 0,
  });

  useEffect(() => {
    fetchPurchaseOrders();
    fetchStats();
  }, [pagination.page, pagination.pageSize]);

  const fetchPurchaseOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/purchases/orders?page=${pagination.page}&pageSize=${pagination.pageSize}`
      );

      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data.orders || []);
        setPagination((prev) => ({
          ...prev,
          total: data.total || 0,
          totalPages: data.totalPages || 0,
        }));
      } else {
        console.error("Failed to fetch purchase orders");
        setPurchaseOrders([]);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      setPurchaseOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/purchases/orders/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      draft: {
        variant: "secondary",
        icon: FileText,
        label: "Draft",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      },
      pending: {
        variant: "outline",
        icon: Clock,
        label: "Pending",
        className:
          "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
      },
      approved: {
        variant: "default",
        icon: CheckCircle,
        label: "Approved",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      rejected: {
        variant: "destructive",
        icon: XCircle,
        label: "Rejected",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      received: {
        variant: "default",
        icon: CheckCircle,
        label: "Received",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
    };

    const config = statusConfig[status] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      accessorKey: "po_number",
      header: "PO Number",
      cell: ({ row }) => (
        <div className="font-medium text-blue-600">
          {row.getValue("po_number")}
        </div>
      ),
    },
    {
      accessorKey: "supplier_name",
      header: "Supplier",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.getValue("supplier_name") || "Unknown"}
        </div>
      ),
    },
    {
      accessorKey: "order_date",
      header: "Order Date",
      cell: ({ row }) => formatDate(row.getValue("order_date")),
    },
    {
      accessorKey: "expected_date",
      header: "Expected Date",
      cell: ({ row }) => {
        const date = row.getValue("expected_date");
        return date ? formatDate(date) : "-";
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("total_amount"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const purchaseOrder = row.original;

        return (
          <div className="flex items-center space-x-2">
            <Link href={`/dashboard/purchases/${purchaseOrder.id}`}>
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-1" />
                View
              </Button>
            </Link>
            <Link href={`/dashboard/purchases/${purchaseOrder.id}/edit`}>
              <Button variant="outline" size="sm">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(purchaseOrder.id)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this purchase order?")
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/purchases/orders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchPurchaseOrders(); // Refresh the list
      } else {
        alert("Failed to delete purchase order");
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      alert("Error deleting purchase order");
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage your purchase orders and track supplier deliveries
          </p>
        </div>
        <Link href="/dashboard/purchases/create">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Purchase Order
          </Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">All purchase orders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingOrders}
            </div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedOrders}
            </div>
            <p className="text-xs text-muted-foreground">Ready for delivery</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">
              Combined order value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders</CardTitle>
          <CardDescription>
            A list of all purchase orders with their current status and details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={purchaseOrders}
            loading={loading}
            pagination={{
              pageIndex: pagination.page - 1,
              pageSize: pagination.pageSize,
              pageCount: pagination.totalPages,
              total: pagination.total,
            }}
            onPaginationChange={(newPagination) => {
              setPagination((prev) => ({
                ...prev,
                page: newPagination.pageIndex + 1,
                pageSize: newPagination.pageSize,
              }));
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
