"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  FileText,
  Eye,
  Edit,
  Trash2,
} from "lucide-react";

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    supplier_id: "",
    date_from: "",
    date_to: "",
  });

  // Fetch purchase orders
  const fetchPurchases = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value !== "")
        ),
      });

      const response = await fetch(`/api/purchases/orders?${queryParams}`);
      const data = await response.json();

      if (data.success) {
        setPurchases(data.data);
        setPagination(data.pagination);
      } else {
        console.error("Error fetching purchases:", data.error);
      }
    } catch (error) {
      console.error("Error fetching purchases:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [pagination.page, pagination.pageSize]);

  // Handle search
  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchPurchases();
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this purchase order?"))
      return;

    try {
      const response = await fetch(`/api/purchases/orders/${id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        fetchPurchases(); // Refresh data
      } else {
        alert("Error deleting purchase order: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      alert("Error deleting purchase order");
    }
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const variants = {
      draft: "secondary",
      pending_approval: "warning",
      approved: "success",
      received: "primary",
      cancelled: "destructive",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {status?.replace("_", " ").toUpperCase()}
      </Badge>
    );
  };

  // Table columns
  const columns = [
    {
      accessorKey: "po_number",
      header: "PO Number",
      cell: ({ row }) => (
        <Link
          href={`/dashboard/purchases/${row.original.id}`}
          className="font-medium text-blue-600 hover:text-blue-800"
        >
          {row.getValue("po_number")}
        </Link>
      ),
    },
    {
      accessorKey: "supplier_name",
      header: "Supplier",
    },
    {
      accessorKey: "order_date",
      header: "Order Date",
      cell: ({ row }) =>
        new Date(row.getValue("order_date")).toLocaleDateString(),
    },
    {
      accessorKey: "expected_date",
      header: "Expected Date",
      cell: ({ row }) => {
        const date = row.getValue("expected_date");
        return date ? new Date(date).toLocaleDateString() : "-";
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
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("total_amount") || 0);
        return new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(amount);
      },
    },
    {
      accessorKey: "item_count",
      header: "Items",
      cell: ({ row }) => `${row.getValue("item_count") || 0} items`,
    },
    {
      accessorKey: "created_by_name",
      header: "Created By",
    },
  ];

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Purchase Orders</h1>
          <p className="text-muted-foreground">
            Manage purchase orders and procurement process
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/purchases/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Purchase Order
          </Link>
        </Button>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Orders List</CardTitle>
          <CardDescription>
            {pagination.total} purchase orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={purchases}
            loading={loading}
            pagination={pagination}
            onPaginationChange={setPagination}
          />
        </CardContent>
      </Card>
    </div>
  );
}
