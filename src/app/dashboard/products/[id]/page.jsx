"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  BarChart3,
  DollarSign,
  Warehouse,
  Calendar,
  Building,
  Info,
} from "lucide-react";
import DashboardDetailLayout from "@/components/layouts/dashboard-detail-layout";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();

  // Use delete dialog hook
  const {
    showDeleteDialog,
    setShowDeleteDialog,
    deleteError,
    setDeleteError,
    isDeleting,
    setIsDeleting,
  } = useDeleteDialog();

  useEffect(() => {
    fetchProduct();
  }, []);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error || "Produk tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
      setError("Terjadi kesalahan saat memuat produk");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");

      const response = await fetch(`/api/products/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setShowDeleteDialog(false);
        router.push("/dashboard/products");
      } else {
        const errorData = await response.json();
        setDeleteError(errorData.error || "Gagal menghapus produk");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      setDeleteError("Gagal menghapus produk");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Tidak tersedia";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Format tanggal tidak valid";

    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getStockStatus = (stock, minStock) => {
    if (stock <= 0) return { label: "Stok Habis", color: "destructive" };
    if (stock <= minStock) return { label: "Stok Rendah", color: "warning" };
    return { label: "Stok Tersedia", color: "success" };
  };

  if (loading) {
    return (
      <DashboardDetailLayout
        title="Detail Produk"
        loading={true}
        backLink="/dashboard/products"
        loadingIcon={Package}
        loadingMessage="Memuat produk..."
      />
    );
  }

  if (error || !product) {
    return (
      <DashboardDetailLayout
        title="Detail Produk"
        error={true}
        errorMessage={error || "Produk tidak ditemukan"}
        backLink="/dashboard/products"
        errorIcon={Package}
      />
    );
  }

  return (
    <DashboardDetailLayout
      title="Detail Produk"
      subtitle={product?.name || "Loading..."}
      backLink="/dashboard/products"
      editLink={`/dashboard/products/${params.id}/edit`}
      onDelete={handleDelete}
      showDeleteDialog={showDeleteDialog}
      onCloseDeleteDialog={() => {
        setShowDeleteDialog(false);
        setDeleteError("");
      }}
      onConfirmDelete={confirmDelete}
      deleteError={deleteError}
      deleteDescription={`Apakah Anda yakin ingin menghapus produk "${product?.name}"? Tindakan ini tidak dapat dibatalkan.`}
    >
      {product &&
        (() => {
          const stockStatus = getStockStatus(product.stock, product.minStock);
          return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Product Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Basic Information */}
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
                        <p className="text-gray-800 mt-1">
                          {product.description}
                        </p>
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
                        <label className="text-sm font-medium text-gray-600">
                          Unit
                        </label>
                        <p className="text-gray-800">{product.unit}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Status
                        </label>
                        <Badge
                          variant={
                            product.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="mt-1"
                        >
                          {product.status === "active"
                            ? "Aktif"
                            : "Tidak Aktif"}
                        </Badge>
                      </div>
                    </div>

                    {product.barcode && (
                      <div>
                        <label className="text-sm font-medium text-gray-600">
                          Barcode
                        </label>
                        <code className="block bg-gray-100 px-3 py-1 rounded text-sm font-mono mt-1">
                          {product.barcode}
                        </code>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Pricing Information */}
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
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      {product.cost > 0 && (
                        <div>
                          <label className="text-sm font-medium text-gray-600">
                            Harga Modal
                          </label>
                          <p className="text-xl font-semibold text-gray-700">
                            {formatPrice(product.cost)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Margin: {formatPrice(product.price - product.cost)}{" "}
                            (
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

                {/* Physical Properties */}
                {(product.weight > 0 ||
                  Object.values(product.dimensions || {}).some(
                    (d) => d > 0
                  )) && (
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
                            <label className="text-sm font-medium text-gray-600">
                              Berat
                            </label>
                            <p className="text-gray-800">{product.weight} kg</p>
                          </div>
                        )}
                        {product.dimensions &&
                          Object.values(product.dimensions).some(
                            (d) => d > 0
                          ) && (
                            <div>
                              <label className="text-sm font-medium text-gray-600">
                                Dimensi (P×L×T)
                              </label>
                              <p className="text-gray-800">
                                {product.dimensions.length} ×{" "}
                                {product.dimensions.width} ×{" "}
                                {product.dimensions.height} cm
                              </p>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Stock Information */}
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
                          ⚠️ Stok produk ini sudah mencapai batas minimum.
                          Pertimbangkan untuk menambah stok.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Supplier Info */}
                {product.supplier && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Supplier
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-800 font-medium">
                        {product.supplier}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Metadata */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5" />
                      Informasi Sistem
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <label className="font-medium text-gray-600">
                        Dibuat
                      </label>
                      <p className="text-gray-800">
                        {formatDate(product.created_at)}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">
                        Terakhir Diupdate
                      </label>
                      <p className="text-gray-800">
                        {formatDate(product.updated_at)}
                      </p>
                    </div>
                    <div>
                      <label className="font-medium text-gray-600">
                        ID Produk
                      </label>
                      <code className="block bg-gray-100 px-2 py-1 rounded text-xs font-mono mt-1">
                        {product.id}
                      </code>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Aksi Cepat</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link
                      href={`/dashboard/pos?product=${product._id}`}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Jual di POS
                      </Button>
                    </Link>
                    <Link
                      href={`/dashboard/inventory/mutation?product=${product._id}`}
                      className="block"
                    >
                      <Button
                        variant="outline"
                        className="w-full justify-start"
                      >
                        <Warehouse className="h-4 w-4 mr-2" />
                        Mutasi Stok
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>
          );
        })()}
    </DashboardDetailLayout>
  );
}
