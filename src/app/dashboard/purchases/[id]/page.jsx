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

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [purchaseOrder, setPurchaseOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [resolvedParams, setResolvedParams] = useState(null);

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
  const handleApproval = async (action) => {
    const confirmMessage =
      action === "approve"
        ? "Are you sure you want to approve this purchase order?"
        : "Are you sure you want to reject this purchase order?";

    if (!confirm(confirmMessage)) return;

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
        alert(`Purchase order ${action}d successfully!`);
        fetchPurchaseOrder(); // Refresh data
      } else {
        alert("Error processing approval: " + data.error);
      }
    } catch (error) {
      console.error("Error processing approval:", error);
      alert("Error processing approval");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this purchase order?"))
      return;

    try {
      setActionLoading(true);
      const response = await fetch(`/api/purchases/orders/${params.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        alert("Purchase order deleted successfully!");
        router.push("/dashboard/purchases");
      } else {
        alert("Error deleting purchase order: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      alert("Error deleting purchase order");
    } finally {
      setActionLoading(false);
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

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/dashboard/purchases">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Purchase Order {purchaseOrder.po_number}
            </h1>
            <p className="text-muted-foreground">
              View and manage purchase order details
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={purchaseOrder.status} />

            {canEdit && (
              <Button variant="outline" asChild>
                <Link href={`/dashboard/purchases/${params.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Link>
              </Button>
            )}

            {canApprove && (
              <>
                <Button
                  onClick={() => handleApproval("approve")}
                  disabled={actionLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="mr-2 h-4 w-4" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleApproval("reject")}
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
                onClick={handleDelete}
                disabled={actionLoading}
                variant="destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
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
                  {purchaseOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <div className="font-medium">{item.product_name}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {item.product_code} | Unit: {item.product_unit}
                        </div>
                        {item.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            Notes: {item.notes}
                          </div>
                        )}
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Quantity
                        </div>
                        <div className="font-medium">{item.quantity}</div>
                      </div>

                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">
                          Unit Cost
                        </div>
                        <div className="font-medium">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(item.unit_cost)}
                        </div>
                      </div>

                      {(item.discount_amount > 0 ||
                        item.discount_percentage > 0) && (
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">
                            Discount
                          </div>
                          <div className="font-medium text-green-600">
                            {item.discount_percentage > 0
                              ? `${item.discount_percentage}%`
                              : new Intl.NumberFormat("id-ID", {
                                  style: "currency",
                                  currency: "IDR",
                                }).format(item.discount_amount)}
                          </div>
                        </div>
                      )}

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">
                          Total
                        </div>
                        <div className="font-medium">
                          {new Intl.NumberFormat("id-ID", {
                            style: "currency",
                            currency: "IDR",
                          }).format(item.total_cost)}
                        </div>
                      </div>
                    </div>
                  ))}
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
    </div>
  );
}
