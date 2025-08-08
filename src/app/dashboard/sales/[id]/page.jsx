"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/format-utils";
import { STATUS_COLORS } from "@/lib/sales-constants";
import { useSalesOrder } from "@/hooks/use-sales";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;

  const { order, loading, error } = useSalesOrder(orderId);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 w-64 bg-gray-200 rounded mt-2 animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4"></div>
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Sales order tidak ditemukan
              </h3>
              <p className="text-gray-500 mb-4">
                Sales order yang Anda cari tidak dapat ditemukan.
              </p>
              <Button onClick={() => router.push("/dashboard/sales")}>
                Kembali ke Daftar Sales Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statusLabel = {
    draft: "Draft",
    confirmed: "Dikonfirmasi",
    processing: "Diproses",
    shipped: "Dikirim",
    delivered: "Selesai",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/sales")}
          className="w-fit p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold">
              Sales Order {order.order_number}
            </h1>
            <p className="text-gray-600 mt-1">
              Dibuat pada {formatDate(order.created_at)}
            </p>
            {/* Edit button on mobile - below title */}
            <Button
              size="sm"
              onClick={() => router.push(`/dashboard/sales/${order.id}/edit`)}
              className="mt-3 sm:hidden"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
          {/* Edit button on desktop - right side */}
          <Button
            size="sm"
            onClick={() => router.push(`/dashboard/sales/${order.id}/edit`)}
            className="mt-3 hidden sm:inline-flex"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Customer</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Customer
                  </label>
                  <p className="font-medium">{order.customer_name}</p>
                </div>
                {order.customer_phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Telepon
                    </label>
                    <p>{order.customer_phone}</p>
                  </div>
                )}
                {order.customer_email && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email
                    </label>
                    <p>{order.customer_email}</p>
                  </div>
                )}
                {/* Status in center */}
                <div className="flex justify-start pt-3">
                  <label className="text-sm font-medium text-gray-500">
                    Status{" "}
                  </label>
                  <Badge
                    className={
                      STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                    }
                  >
                    {statusLabel[order.status] || order.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Item Pesanan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium text-gray-500">
                        Produk
                      </th>
                      <th className="text-center p-3 font-medium text-gray-500 min-w-[80px]">
                        Qty
                      </th>
                      <th className="text-right p-3 font-medium text-gray-500 min-w-[100px]">
                        Harga
                      </th>
                      <th className="text-right p-3 font-medium text-gray-500 min-w-[120px]">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-3">
                          <div className="font-medium">{item.product_name}</div>
                          <div className="text-sm text-gray-500">
                            {item.product_code}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <div className="font-medium">{item.quantity}</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-medium">
                            {formatCurrency(item.unit_price)}
                          </div>
                          <div className="text-sm text-gray-500">per item</div>
                        </td>
                        <td className="p-3 text-right">
                          <div className="font-medium">
                            {formatCurrency(item.total_price)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Diskon</span>
                <span>-{formatCurrency(order.discount_amount || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pajak</span>
                <span>{formatCurrency(order.tax_amount || 0)}</span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatCurrency(order.total_amount)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Order</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tanggal Order
                </label>
                <p>{formatDate(order.order_date)}</p>
              </div>
              {order.expected_date && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tanggal Diharapkan
                  </label>
                  <p>{formatDate(order.expected_date)}</p>
                </div>
              )}
              {order.salesperson_name && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Salesperson
                  </label>
                  <p>{order.salesperson_name}</p>
                </div>
              )}
              {order.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Catatan
                  </label>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
