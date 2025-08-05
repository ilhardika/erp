"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Mail,
  Phone,
  FileText,
  CreditCard,
  Building2,
  ArrowLeft,
  Info,
  MapPin,
} from "lucide-react";

export default function SupplierDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [supplier, setSupplier] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSupplier();
  }, []);

  const fetchSupplier = async () => {
    try {
      const response = await fetch(`/api/suppliers/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setSupplier(data.data);
      } else {
        setError(data.error || "Supplier tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching supplier:", error);
      setError("Terjadi kesalahan saat memuat supplier");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Building2 className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-500">Memuat supplier...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !supplier) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Supplier Tidak Ditemukan
                </h3>
                <p className="text-gray-500 mb-4">
                  {error || "Supplier yang Anda cari tidak dapat ditemukan."}
                </p>
                <Link href="/dashboard/suppliers">
                  <Button>Kembali ke Daftar Supplier</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getSupplierTypeLabel = (type) => {
    const types = {
      material: "Material",
      service: "Jasa",
      goods: "Barang",
      equipment: "Peralatan",
    };
    return types[type] || type;
  };

  const getSupplierTypeVariant = (type) => {
    const variants = {
      material: "default",
      service: "secondary",
      goods: "outline",
      equipment: "destructive",
    };
    return variants[type] || "default";
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 items-start xs:items-center">
          <Link href="/dashboard/suppliers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-2 xs:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold">{supplier.name}</h1>
            <p className="text-gray-600">
              Detail supplier dan informasi kontak
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/suppliers/${supplier.id}/edit`}>
            <Button>
              <Edit className="h-4 w-4 mr-2" />
              Edit Supplier
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
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
                  <p className="text-gray-900 font-medium">{supplier.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kode Supplier
                  </label>
                  <p className="text-gray-900 font-mono">{supplier.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {supplier.email || <span className="text-gray-400">-</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Telepon
                  </label>
                  <p className="text-gray-900">
                    {supplier.phone || <span className="text-gray-400">-</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tipe Supplier
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={getSupplierTypeVariant(supplier.supplier_type)}
                    >
                      {getSupplierTypeLabel(supplier.supplier_type)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Status
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={
                        supplier.status === "active" ? "success" : "danger"
                      }
                    >
                      {supplier.status === "active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Address Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Alamat
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-500">
                    Alamat Lengkap
                  </label>
                  <p className="text-gray-900">
                    {supplier.address || (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kota
                  </label>
                  <p className="text-gray-900">
                    {supplier.city || <span className="text-gray-400">-</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kode Pos
                  </label>
                  <p className="text-gray-900">
                    {supplier.postal_code || (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business & Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informasi Bisnis & Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    NPWP / Tax ID
                  </label>
                  <p className="text-gray-900">
                    {supplier.tax_id || (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Limit Kredit
                  </label>
                  <p className="text-gray-900">
                    {supplier.credit_limit
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(supplier.credit_limit)
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Termin Pembayaran
                  </label>
                  <p className="text-gray-900">
                    {supplier.payment_terms
                      ? `${supplier.payment_terms} hari`
                      : "Cash"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bank Information */}
          {(supplier.bank_name ||
            supplier.bank_account ||
            supplier.account_holder) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informasi Bank
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nama Bank
                    </label>
                    <p className="text-gray-900">
                      {supplier.bank_name || (
                        <span className="text-gray-400">-</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nomor Rekening
                    </label>
                    <p className="text-gray-900 font-mono">
                      {supplier.bank_account || (
                        <span className="text-gray-400">-</span>
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Nama Pemegang Rekening
                    </label>
                    <p className="text-gray-900">
                      {supplier.account_holder || (
                        <span className="text-gray-400">-</span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {supplier.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Catatan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {supplier.notes}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Ringkasan
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Dibuat</span>
                  <span className="text-sm font-medium">
                    {new Date(supplier.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Terakhir Update</span>
                  <span className="text-sm font-medium">
                    {new Date(supplier.updated_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          {(supplier.email || supplier.phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {supplier.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{supplier.email}</span>
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{supplier.phone}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
