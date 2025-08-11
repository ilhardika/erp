"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import Link from "next/link";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Check,
  X,
  FileText,
  Truck,
  Eye,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format-utils";

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolvedParams, setResolvedParams] = useState(null);

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [successAction, setSuccessAction] = useState("");

  // Resolve params for Next.js 15
  useEffect(() => {
    const resolveParams = async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    };
    resolveParams();
  }, [params]);

  useEffect(() => {
    const loadPurchaseOrder = async () => {
      if (resolvedParams?.id) {
        await fetchPurchaseOrder();
      }
    };
    loadPurchaseOrder();
  }, [resolvedParams?.id]);

  const fetchPurchaseOrder = async () => {
    try {
      setLoading(true);
      console.log("Fetching purchase order with ID:", resolvedParams?.id);
      const response = await fetch(
        `/api/purchases/orders/${resolvedParams.id}`
      );
      const data = await response.json();

      if (data.success) {
        setPurchaseOrder(data.data);
      } else {
        console.error("Error fetching purchase order:", data.error);
      }
    } catch (error) {
      console.error("Error fetching purchase order:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle approval actions
  const handleApprovalClick = (action) => {
    if (action === "approve") {
      setShowApproveDialog(true);
    } else {
      setShowRejectDialog(true);
    }
  };

  const confirmApproval = async (action) => {
    try {
      setActionLoading(true);
      const response = await fetch("/api/purchases/orders/approved", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          po_id: purchaseOrder.id,
          action,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessAction(action);
        setDialogMessage(`Purchase order ${action}d successfully!`);
        setShowSuccessDialog(true);
        fetchPurchaseOrder(); // Refresh data
      } else {
        setDialogMessage("Error processing approval: " + data.error);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      setDialogMessage("Error processing approval");
      setShowErrorDialog(true);
    } finally {
      setActionLoading(false);
      setShowApproveDialog(false);
      setShowRejectDialog(false);
    }
  };

  // Handle delete
  const handleDeleteClick = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setActionLoading(true);
      const response = await fetch(
        `/api/purchases/orders/${resolvedParams.id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (data.success) {
        setDialogMessage("Purchase order deleted successfully!");
        setShowSuccessDialog(true);
        setSuccessAction("delete");
      } else {
        setDialogMessage("Error deleting purchase order: " + data.error);
        setShowErrorDialog(true);
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      setDialogMessage("Error deleting purchase order");
      setShowErrorDialog(true);
    } finally {
      setActionLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    if (successAction === "delete") {
      router.push("/dashboard/purchases");
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

    const labels = {
      draft: "Draft",
      pending_approval: "Pending Approval",
      approved: "Approved",
      received: "Received",
      cancelled: "Cancelled",
    };

    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!purchaseOrder) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">Purchase order not found</div>
      </div>
    );
  }

  const canEdit = ["draft", "pending_approval"].includes(purchaseOrder.status);
  const canDelete = purchaseOrder.status === "draft";
  const canApprove = purchaseOrder.status === "pending_approval";
  const canReceive = purchaseOrder.status === "approved";

  // Define columns for items table
  const itemColumns = [
    {
      accessorKey: "product_name",
      header: "Product",
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="font-medium">{row.original.product_name}</div>
          {row.original.product_code && (
            <div className="text-xs text-muted-foreground">
              Code: {row.original.product_code}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "quantity",
      header: "Qty",
      cell: ({ row }) => (
        <div className="text-center font-medium">
          {row.original.quantity}
          {row.original.product_unit && (
            <div className="text-xs text-muted-foreground">
              {row.original.product_unit}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "unit_cost",
      header: "Unit Price",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(
            row.original.unit_cost || row.original.unit_price || 0
          )}
        </div>
      ),
    },
    {
      accessorKey: "discount",
      header: "Discount",
      cell: ({ row }) => {
        const item = row.original;
        if (item.discount_amount > 0 || item.discount_percentage > 0) {
          return (
            <div className="text-center font-medium text-green-600">
              {item.discount_percentage > 0
                ? `${item.discount_percentage}%`
                : formatCurrency(item.discount_amount)}
            </div>
          );
        }
        return <div className="text-center text-muted-foreground">-</div>;
      },
    },
    {
      accessorKey: "total_cost",
      header: "Total",
      cell: ({ row }) => (
        <div className="text-right font-medium">
          {formatCurrency(row.original.total_cost || row.original.total || 0)}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Back Button */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild className="shrink-0 p-2">
          <Link href="/dashboard/purchases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Header with Responsive Buttons */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-start space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            Purchase Order {purchaseOrder.po_number}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <StatusBadge status={purchaseOrder.status} />
            <p className="text-muted-foreground text-sm md:text-base">
              View and manage purchase order details
            </p>
          </div>
        </div>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center gap-2 flex-wrap">
          {canEdit && (
            <Button variant="outline" asChild>
              <Link href={`/dashboard/purchases/${resolvedParams?.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
          )}

          {canApprove && (
            <>
              <Button
                onClick={() => handleApprovalClick("approve")}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                onClick={() => handleApprovalClick("reject")}
                disabled={actionLoading}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}

          {canReceive && (
            <Button asChild>
              <Link
                href={`/dashboard/purchases/receipts/create?po_id=${purchaseOrder.id}`}
              >
                <Truck className="mr-2 h-4 w-4" />
                Receive Goods
              </Link>
            </Button>
          )}

          {canDelete && (
            <Button
              onClick={handleDeleteClick}
              disabled={actionLoading}
              variant="destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Buttons */}
      <div className="flex md:hidden flex-col space-y-2">
        {canEdit && (
          <Button variant="outline" asChild className="w-full">
            <Link href={`/dashboard/purchases/${resolvedParams?.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
        )}

        {canApprove && (
          <div className="flex space-x-2">
            <Button
              onClick={() => handleApprovalClick("approve")}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700 flex-1"
            >
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button
              onClick={() => handleApprovalClick("reject")}
              disabled={actionLoading}
              variant="destructive"
              className="flex-1"
            >
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}

        {canReceive && (
          <Button asChild className="w-full">
            <Link
              href={`/dashboard/purchases/receipts/create?po_id=${purchaseOrder.id}`}
            >
              <Truck className="mr-2 h-4 w-4" />
              Receive Goods
            </Link>
          </Button>
        )}

        {canDelete && (
          <Button
            onClick={handleDeleteClick}
            disabled={actionLoading}
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    PO Number
                  </div>
                  <div className="text-lg font-semibold">
                    {purchaseOrder.po_number}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Status
                  </div>
                  <div className="mt-1">
                    <StatusBadge status={purchaseOrder.status} />
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Order Date
                  </div>
                  <div>
                    {new Date(purchaseOrder.order_date).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Expected Date
                  </div>
                  <div>
                    {purchaseOrder.expected_date
                      ? new Date(
                          purchaseOrder.expected_date
                        ).toLocaleDateString()
                      : "-"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Created By
                  </div>
                  <div>{purchaseOrder.created_by_name || "-"}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Created At
                  </div>
                  <div>
                    {new Date(purchaseOrder.created_at).toLocaleString()}
                  </div>
                </div>

                {purchaseOrder.approved_by_name && (
                  <>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Approved By
                      </div>
                      <div>{purchaseOrder.approved_by_name}</div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-muted-foreground">
                        Approved At
                      </div>
                      <div>
                        {new Date(purchaseOrder.approved_at).toLocaleString()}
                      </div>
                    </div>
                  </>
                )}
              </div>

              {purchaseOrder.notes && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-muted-foreground">
                    Notes
                  </div>
                  <div className="mt-1 p-3 bg-muted rounded-md">
                    {purchaseOrder.notes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader>
              <CardTitle>
                Purchase Items ({purchaseOrder.items?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!purchaseOrder.items || purchaseOrder.items.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No items found for this purchase order.
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="overflow-x-auto">
                    <DataTable
                      data={purchaseOrder.items}
                      columns={itemColumns}
                      searchable={false}
                      pagination={false}
                    />
                  </div>

                  {/* Total Summary */}
                  <div className="border-t pt-4">
                    <div className="flex flex-col md:flex-row md:justify-end space-y-2 md:space-y-0 md:space-x-8">
                      <div className="flex justify-between md:block">
                        <span className="text-sm text-muted-foreground">
                          Subtotal:
                        </span>
                        <span className="font-medium">
                          {formatCurrency(purchaseOrder.subtotal_amount || 0)}
                        </span>
                      </div>
                      {purchaseOrder.discount_amount > 0 && (
                        <div className="flex justify-between md:block">
                          <span className="text-sm text-muted-foreground">
                            Discount:
                          </span>
                          <span className="font-medium text-green-600">
                            -{formatCurrency(purchaseOrder.discount_amount)}
                          </span>
                        </div>
                      )}
                      {purchaseOrder.tax_amount > 0 && (
                        <div className="flex justify-between md:block">
                          <span className="text-sm text-muted-foreground">
                            Tax:
                          </span>
                          <span className="font-medium">
                            {formatCurrency(purchaseOrder.tax_amount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between md:block border-t md:border-t-0 pt-2 md:pt-0">
                        <span className="text-lg font-semibold">Total:</span>
                        <span className="text-lg font-bold">
                          {formatCurrency(purchaseOrder.total_amount || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Goods Receipts */}
          {purchaseOrder.receipts && purchaseOrder.receipts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Goods Receipts ({purchaseOrder.receipts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchaseOrder.receipts.map((receipt, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">
                          {receipt.receipt_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(receipt.receipt_date).toLocaleDateString()}{" "}
                          | Received by: {receipt.received_by_name}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <StatusBadge status={receipt.status} />
                        <Button variant="ghost" size="sm" asChild>
                          <Link
                            href={`/dashboard/purchases/receipts/${receipt.id}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supplier Information */}
          <Card>
            <CardHeader>
              <CardTitle>Supplier Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="text-sm font-medium text-muted-foreground">
                  Supplier Name
                </div>
                <div className="font-medium">{purchaseOrder.supplier_name}</div>
              </div>

              {purchaseOrder.supplier_email && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Email
                  </div>
                  <div>{purchaseOrder.supplier_email}</div>
                </div>
              )}

              {purchaseOrder.supplier_phone && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Phone
                  </div>
                  <div>{purchaseOrder.supplier_phone}</div>
                </div>
              )}

              {purchaseOrder.supplier_address && (
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    Address
                  </div>
                  <div className="text-sm">
                    {purchaseOrder.supplier_address}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(purchaseOrder.subtotal || 0)}
                </span>
              </div>

              {purchaseOrder.discount_amount > 0 && (
                <div className="flex justify-between text-red-600">
                  <span>Discount:</span>
                  <span>
                    -
                    {new Intl.NumberFormat("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    }).format(purchaseOrder.discount_amount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Tax:</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(purchaseOrder.tax_amount || 0)}
                </span>
              </div>

              <hr />

              <div className="flex justify-between font-bold text-lg">
                <span>Total:</span>
                <span>
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(purchaseOrder.total_amount || 0)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Approve Dialog */}
      <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Purchase Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to approve this purchase order? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirmApproval("approve")}
              disabled={actionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {actionLoading ? "Approving..." : "Yes, Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Purchase Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this purchase order? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => confirmApproval("reject")}
              disabled={actionLoading}
              variant="destructive"
            >
              {actionLoading ? "Rejecting..." : "Yes, Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Purchase Order</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this purchase order? This action
              cannot be undone and all data will be permanently removed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDelete}
              disabled={actionLoading}
              variant="destructive"
            >
              {actionLoading ? "Deleting..." : "Yes, Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success!</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessDialogClose}>OK</Button>
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
