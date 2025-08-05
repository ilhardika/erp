import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Warehouse, Building, Calendar, BarChart3, Users } from "lucide-react";
import Link from "next/link";
import { formatDateOnly, getStockStatus } from "@/lib/format-utils";

// Product Stock Information Sidebar
export function ProductStockInfo({ product }) {
  if (!product) return null;

  const stockStatus = getStockStatus(product.stock, product.minStock);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Warehouse className="h-5 w-5" />
          Informasi Stok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-600">
            Stok Saat Ini
          </label>
          <p
            className={`text-3xl font-bold ${
              stockStatus.color === "success"
                ? "text-green-600"
                : stockStatus.color === "warning"
                ? "text-yellow-600"
                : "text-red-600"
            }`}
          >
            {product.stock} {product.unit}
          </p>
          <Badge
            variant={
              stockStatus.color === "success"
                ? "default"
                : stockStatus.color === "warning"
                ? "secondary"
                : "destructive"
            }
            className="mt-1"
          >
            {stockStatus.label}
          </Badge>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-600">
            Stok Minimum
          </label>
          <p className="text-lg font-semibold text-gray-700">
            {product.minStock} {product.unit}
          </p>
        </div>

        {product.stock <= product.minStock && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Stok produk ini sudah mencapai batas minimum. Pertimbangkan
              untuk menambah stok.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Supplier Information Sidebar
export function SupplierInfo({ supplier }) {
  if (!supplier) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Supplier
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 font-medium">{supplier}</p>
      </CardContent>
    </Card>
  );
}

// Product Quick Actions Sidebar
export function ProductQuickActions({ productId }) {
  if (!productId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link href={`/dashboard/pos?product=${productId}`} className="block">
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Jual di POS
          </Button>
        </Link>
        <Link
          href={`/dashboard/inventory/mutation?product=${productId}`}
          className="block"
        >
          <Button variant="outline" className="w-full justify-start">
            <Warehouse className="h-4 w-4 mr-2" />
            Mutasi Stok
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Customer Quick Actions Sidebar
export function CustomerQuickActions({ customerId }) {
  if (!customerId) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aksi Cepat</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Link
          href={`/dashboard/sales/new?customer=${customerId}`}
          className="block"
        >
          <Button variant="outline" className="w-full justify-start">
            <BarChart3 className="h-4 w-4 mr-2" />
            Buat Penjualan
          </Button>
        </Link>
        <Link
          href={`/dashboard/customers/${customerId}/transactions`}
          className="block"
        >
          <Button variant="outline" className="w-full justify-start">
            <Users className="h-4 w-4 mr-2" />
            Riwayat Transaksi
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// Generic Metadata Sidebar
export function MetadataSidebar({ data, title = "Informasi Sistem" }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <label className="font-medium text-gray-600">Dibuat</label>
          <p className="text-gray-800">
            {data?.created_at ? formatDateOnly(data.created_at) : "-"}
          </p>
        </div>
        <div>
          <label className="font-medium text-gray-600">Terakhir Diupdate</label>
          <p className="text-gray-800">
            {data?.updated_at ? formatDateOnly(data.updated_at) : "-"}
          </p>
        </div>
        {data?.id && (
          <div>
            <label className="font-medium text-gray-600">ID</label>
            <code className="block bg-gray-100 px-2 py-1 rounded text-xs font-mono mt-1">
              {data.id}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
