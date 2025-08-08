"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { usePurchaseOrder } from "@/hooks/use-purchases";
import { formatIDR, formatDate } from "@/lib/utils";
import {
  PURCHASE_ORDER_STATUS,
  PURCHASE_STATUS_COLORS,
  PURCHASE_STATUS_LABELS,
  getAvailableStatusTransitions,
} from "@/lib/purchase-constants";
import {
  ArrowLeft,
  Edit,
  Trash2,
  MoreHorizontal,
  Package,
  Building2,
  Calendar,
  FileText,
  CheckCircle,
  TruckIcon,
} from "lucide-react";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const orderId = params.id;

  const { data: order, isLoading, error, mutate } = usePurchaseOrder(orderId);
  const [isStatusLoading, setIsStatusLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  // Update status
  const updateStatus = async (newStatus) => {
    setIsStatusLoading(true);
    try {
      const response = await fetch(`/api/purchases/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Sukses",
          description: `Status berhasil diubah ke ${PURCHASE_STATUS_LABELS[newStatus]}`,
        });
        mutate(); // Refresh data
      } else {
        throw new Error(data.error || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal mengubah status",
        variant: "destructive",
      });
    } finally {
      setIsStatusLoading(false);
    }
  };

  // Delete order
  const deleteOrder = async () => {
    setIsDeleteLoading(true);
    try {
      const response = await fetch(`/api/purchases/orders/${orderId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: "Sukses",
          description: "Purchase order berhasil dihapus",
        });
        router.push("/dashboard/purchases/orders");
      } else {
        throw new Error(data.error || "Failed to delete purchase order");
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast({
        title: "Error",
        description: error.message || "Gagal menghapus purchase order",
        variant: "destructive",
      });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" disabled>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 bg-gray-100 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-4 bg-gray-200 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
        </div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Purchase order tidak ditemukan
              </h3>
              <p className="text-gray-500 mb-4">
                Purchase order yang Anda cari tidak dapat ditemukan atau sudah
                dihapus.
              </p>
              <Button
                onClick={() => router.push("/dashboard/purchases/orders")}
              >
                Kembali ke Daftar Purchase Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const availableStatusTransitions = getAvailableStatusTransitions(
    order.status
  );
  const canEdit = order.status === PURCHASE_ORDER_STATUS.DRAFT;
  const canDelete = order.status === PURCHASE_ORDER_STATUS.DRAFT;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              Purchase Order #{order.po_number}
            </h1>
            <p className="text-muted-foreground">
              Dibuat {formatDate(order.created_at)} •
              <Badge
                variant="outline"
                className={`ml-2 ${PURCHASE_STATUS_COLORS[order.status]}`}
              >
                {PURCHASE_STATUS_LABELS[order.status]}
              </Badge>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canEdit && (
            <Button
              onClick={() =>
                router.push(`/dashboard/purchases/orders/${orderId}/edit`)
              }
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Edit
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isStatusLoading}>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {availableStatusTransitions.map((status) => (
                <DropdownMenuItem
                  key={status}
                  onClick={() => updateStatus(status)}
                  disabled={isStatusLoading}
                  className="flex items-center gap-2"
                >
                  {status === PURCHASE_ORDER_STATUS.SENT && (
                    <FileText className="h-4 w-4" />
                  )}
                  {status === PURCHASE_ORDER_STATUS.RECEIVED && (
                    <TruckIcon className="h-4 w-4" />
                  )}
                  {status === PURCHASE_ORDER_STATUS.COMPLETED && (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  Ubah ke {PURCHASE_STATUS_LABELS[status]}
                </DropdownMenuItem>
              ))}

              {availableStatusTransitions.length > 0 && canDelete && (
                <DropdownMenuSeparator />
              )}

              {canDelete && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-red-600 focus:text-red-600 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Hapus
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Hapus Purchase Order</AlertDialogTitle>
                      <AlertDialogDescription>
                        Apakah Anda yakin ingin menghapus purchase order #
                        {order.po_number}? Aksi ini tidak dapat dibatalkan.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Batal</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={deleteOrder}
                        disabled={isDeleteLoading}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {isDeleteLoading ? "Menghapus..." : "Hapus"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Items Purchase Order
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{item.product_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.product_code}
                      </div>
                      {item.note && (
                        <div className="text-sm text-gray-600 mt-1">
                          Note: {item.note}
                        </div>
                      )}
                    </div>

                    <div className="text-right space-y-1">
                      <div className="text-sm text-muted-foreground">
                        {item.quantity} x {formatIDR(item.unit_price)}
                      </div>
                      <div className="font-medium">
                        {formatIDR(item.quantity * item.unit_price)}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Totals */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-medium">
                      {formatIDR(order.total_amount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatIDR(order.total_amount)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Catatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {order.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Purchase Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Supplier</div>
                  <div className="font-medium">{order.supplier_name}</div>
                </div>
              </div>

              {order.expected_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="text-sm text-muted-foreground">
                      Tanggal Diharapkan
                    </div>
                    <div className="font-medium">
                      {formatDate(order.expected_date)}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">Status</div>
                  <Badge
                    variant="outline"
                    className={PURCHASE_STATUS_COLORS[order.status]}
                  >
                    {PURCHASE_STATUS_LABELS[order.status]}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Package className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="text-sm text-muted-foreground">
                    Total Items
                  </div>
                  <div className="font-medium">
                    {order.items?.length || 0} produk
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-muted-foreground">
                  Total Amount
                </div>
                <div className="text-xl font-bold">
                  {formatIDR(order.total_amount)}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="text-sm">
                    <div className="font-medium">Purchase Order Dibuat</div>
                    <div className="text-muted-foreground">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>

                {order.status !== PURCHASE_ORDER_STATUS.DRAFT && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="text-sm">
                      <div className="font-medium">
                        Status: {PURCHASE_STATUS_LABELS[order.status]}
                      </div>
                      <div className="text-muted-foreground">
                        {formatDate(order.updated_at)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
