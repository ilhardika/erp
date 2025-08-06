import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Info,
  DollarSign,
  Package,
  MapPin,
  Building,
  Calendar,
  Warehouse,
  Mail,
  Phone,
} from "lucide-react";
import { formatIDR } from "@/lib/currency";
import { formatDateOnly } from "@/lib/format-utils";

// Product Basic Information Card
export function ProductBasicInfo({ product }) {
  if (!product) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Informasi Dasar
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Nama Produk
            </label>
            <p className="text-lg font-semibold">{product.name}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">
              Kode Produk
            </label>
            <code className="block bg-gray-100 px-3 py-1 rounded text-sm font-mono">
              {product.code}
            </code>
          </div>
        </div>

        {product.description && (
          <div>
            <label className="text-sm font-medium text-gray-600">
              Deskripsi
            </label>
            <p className="text-gray-800 mt-1">{product.description}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Kategori
            </label>
            <Badge variant="secondary" className="mt-1">
              {product.category}
            </Badge>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Unit</label>
            <p className="text-gray-800">{product.unit}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-600">Status</label>
            <Badge
              variant={product.status === "active" ? "default" : "secondary"}
              className="mt-1"
            >
              {product.status === "active" ? "Aktif" : "Tidak Aktif"}
            </Badge>
          </div>
        </div>

        {product.barcode && (
          <div>
            <label className="text-sm font-medium text-gray-600">Barcode</label>
            <code className="block bg-gray-100 px-3 py-1 rounded text-sm font-mono mt-1">
              {product.barcode}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Product Pricing Information Card
export function ProductPricingInfo({ product }) {
  if (!product) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Informasi Harga
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-600">
              Harga Jual
            </label>
            <p className="text-2xl font-bold text-green-600">
              {formatIDR(product.price)}
            </p>
          </div>
          {product.cost > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Harga Modal
              </label>
              <p className="text-xl font-semibold text-gray-700">
                {formatIDR(product.cost)}
              </p>
              <p className="text-sm text-gray-500">
                Margin: {formatIDR(product.price - product.cost)} (
                {(
                  ((product.price - product.cost) / product.cost) *
                  100
                ).toFixed(1)}
                %)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Product Physical Properties Card
export function ProductPhysicalInfo({ product }) {
  if (!product) return null;

  const hasPhysicalData =
    product.weight > 0 ||
    (product.dimensions &&
      Object.values(product.dimensions).some((d) => d > 0));

  if (!hasPhysicalData) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Properti Fisik
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {product.weight > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-600">Berat</label>
              <p className="text-gray-800">{product.weight} kg</p>
            </div>
          )}
          {product.dimensions &&
            Object.values(product.dimensions).some((d) => d > 0) && (
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Dimensi (P×L×T)
                </label>
                <p className="text-gray-800">
                  {product.dimensions.length} × {product.dimensions.width} ×{" "}
                  {product.dimensions.height} cm
                </p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Basic Information Card
export function CustomerBasicInfo({
  customer,
  getCustomerTypeLabel,
  getCustomerTypeVariant,
}) {
  if (!customer) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Informasi Customer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Nama Customer
            </label>
            <p className="text-gray-900 font-medium">{customer?.name || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Kode Customer
            </label>
            <p className="text-gray-900 font-mono">{customer?.code || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900">{customer?.email || "-"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              No. Telepon
            </label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900">{customer?.phone || "-"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Tipe Customer
            </label>
            <div className="mt-1">
              <Badge variant={getCustomerTypeVariant(customer?.customer_type)}>
                {getCustomerTypeLabel(customer?.customer_type)}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge
                variant={
                  customer?.status === "active" ? "default" : "secondary"
                }
              >
                {customer?.status === "active" ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Address Information Card
export function CustomerAddressInfo({ customer }) {
  if (!customer) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Informasi Alamat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-500">
            Alamat Lengkap
          </label>
          <p className="text-gray-900">{customer?.address || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Kota</label>
          <p className="text-gray-900">{customer?.city || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Kode Pos</label>
          <p className="text-gray-900">{customer?.postal_code || "-"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Customer Business Information Card
export function CustomerBusinessInfo({ customer }) {
  if (!customer) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Informasi Bisnis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-500">
            NPWP / Tax ID
          </label>
          <p className="text-gray-900">{customer?.tax_id || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Batas Kredit
          </label>
          <p className="text-gray-900">
            {customer?.credit_limit ? formatIDR(customer.credit_limit) : "-"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Termin Pembayaran
          </label>
          <p className="text-gray-900">
            {customer?.payment_terms ? `${customer.payment_terms} hari` : "-"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Generic Metadata Information Card
export function MetadataInfo({ data, title = "Informasi Sistem" }) {
  if (!data) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-500">
            Tanggal Dibuat
          </label>
          <p className="text-gray-900">
            {data?.created_at ? formatDateOnly(data.created_at) : "-"}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">
            Terakhir Diperbarui
          </label>
          <p className="text-gray-900">
            {data?.updated_at ? formatDateOnly(data.updated_at) : "-"}
          </p>
        </div>
        {data?.id && (
          <div>
            <label className="text-sm font-medium text-gray-500">ID</label>
            <code className="block bg-gray-100 px-2 py-1 rounded text-xs font-mono mt-1">
              {data.id}
            </code>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Supplier Basic Information Card
export function SupplierBasicInfo({
  supplier,
  getSupplierTypeLabel,
  getSupplierTypeVariant,
}) {
  if (!supplier) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Informasi Supplier
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Nama Supplier
            </label>
            <p className="text-gray-900 font-medium">{supplier?.name || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Kode Supplier
            </label>
            <p className="text-gray-900 font-mono">{supplier?.code || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900">{supplier?.email || "-"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              No. Telepon
            </label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-gray-500" />
              <p className="text-gray-900">{supplier?.phone || "-"}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Tipe Supplier
            </label>
            <div className="mt-1">
              <Badge variant={getSupplierTypeVariant(supplier?.supplier_type)}>
                {getSupplierTypeLabel(supplier?.supplier_type)}
              </Badge>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-1">
              <Badge
                variant={
                  supplier?.status === "active" ? "default" : "secondary"
                }
              >
                {supplier?.status === "active" ? "Aktif" : "Tidak Aktif"}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Supplier Address Information Card
export function SupplierAddressInfo({ supplier }) {
  if (!supplier) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Informasi Alamat
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-500">
            Alamat Lengkap
          </label>
          <p className="text-gray-900">{supplier?.address || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Kota</label>
          <p className="text-gray-900">{supplier?.city || "-"}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-500">Kode Pos</label>
          <p className="text-gray-900">{supplier?.postal_code || "-"}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Supplier Business Information Card
export function SupplierBusinessInfo({ supplier }) {
  if (!supplier) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Informasi Bisnis & Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              NPWP / Tax ID
            </label>
            <p className="text-gray-900">{supplier?.tax_id || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Batas Kredit
            </label>
            <p className="text-gray-900">
              {supplier?.credit_limit ? formatIDR(supplier.credit_limit) : "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Termin Pembayaran
            </label>
            <p className="text-gray-900">
              {supplier?.payment_terms ? `${supplier.payment_terms} hari` : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Supplier Bank Information Card
export function SupplierBankInfo({ supplier }) {
  if (!supplier) return null;

  const hasBankInfo =
    supplier.bank_name || supplier.bank_account || supplier.account_holder;

  if (!hasBankInfo) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building className="h-5 w-5" />
          Informasi Bank
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-500">
              Nama Bank
            </label>
            <p className="text-gray-900">{supplier?.bank_name || "-"}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Nomor Rekening
            </label>
            <p className="text-gray-900 font-mono">
              {supplier?.bank_account || "-"}
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">
              Nama Pemegang Rekening
            </label>
            <p className="text-gray-900">{supplier?.account_holder || "-"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
