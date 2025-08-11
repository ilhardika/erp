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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [deleteOrderId, setDeleteOrderId] = useState(null);
  const [deleteOrderNumber, setDeleteOrderNumber] = useState("");

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
        console.log("Purchase orders response:", data); // Debug log
        setPurchaseOrders(data.data || []); // Fixed: use data.data instead of data.orders
        setPagination((prev) => ({
          ...prev,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 0,
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
        label: "Menunggu",
        className:
          "bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100",
      },
      pending_approval: {
        variant: "outline",
        icon: AlertCircle,
        label: "Menunggu Persetujuan",
        className:
          "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100",
      },
      approved: {
        variant: "default",
        icon: CheckCircle,
        label: "Disetujui",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      processing: {
        variant: "outline",
        icon: Clock,
        label: "Diproses",
        className:
          "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100",
      },
      shipped: {
        variant: "outline",
        icon: CheckCircle,
        label: "Dikirim",
        className:
          "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100",
      },
      received: {
        variant: "default",
        icon: CheckCircle,
        label: "Diterima",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      rejected: {
        variant: "destructive",
        icon: XCircle,
        label: "Ditolak",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
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
      header: "Nomor PO",
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
          {row.getValue("supplier_name") || "Tidak diketahui"}
        </div>
      ),
    },
    {
      accessorKey: "order_date",
      header: "Tanggal Order",
      cell: ({ row }) => formatDate(row.getValue("order_date")),
    },
    {
      accessorKey: "expected_date",
      header: "Tanggal Diharapkan",
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
      header: "Total Jumlah",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.getValue("total_amount"))}
        </div>
      ),
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const purchaseOrder = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Buka menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/purchases/${purchaseOrder.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Lihat Detail
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/purchases/${purchaseOrder.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setDeleteOrderId(purchaseOrder.id);
                  setDeleteOrderNumber(purchaseOrder.po_number);
                  setShowDeleteDialog(true);
                }}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/purchases/orders/${deleteOrderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setShowDeleteDialog(false);
        setDialogMessage("Pesanan pembelian berhasil dihapus!");
        setShowSuccessDialog(true);
        fetchPurchaseOrders(); // Refresh the list
      } else {
        setShowDeleteDialog(false);
        setDialogMessage(data.error || "Gagal menghapus pesanan pembelian");
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      setShowDeleteDialog(false);
      setDialogMessage("Terjadi error saat menghapus pesanan pembelian");
      setShowErrorDialog(true);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Pesanan Pembelian
          </h1>
          <p className="text-muted-foreground">
            Kelola pesanan pembelian dan lacak pengiriman supplier
          </p>
        </div>
        <Link href="/dashboard/purchases/create" className="hidden md:block">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Buat Pesanan Pembelian
          </Button>
        </Link>
        <div className="block md:hidden">
          <Link href="/dashboard/purchases/create">
            <Button className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Buat Pesanan Pembelian
            </Button>
          </Link>
        </div>
      </div>

      {/* Purchase Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pesanan Pembelian</CardTitle>
          <CardDescription>
            Daftar semua pesanan pembelian dengan status dan detail terkini.
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Hapus</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus pesanan pembelian{" "}
              <span className="font-semibold">{deleteOrderNumber}</span>? Aksi
              ini tidak dapat dibatalkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Batal
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Berhasil</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowSuccessDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowErrorDialog(false)}>OK</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
