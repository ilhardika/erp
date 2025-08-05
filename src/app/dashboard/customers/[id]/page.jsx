"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Users,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Building,
  Info,
  CreditCard,
  FileText,
} from "lucide-react";

export default function CustomerViewPage() {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchCustomer();
  }, []);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setCustomer(data.data);
      } else {
        setError(data.error || "Customer tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      setError("Terjadi kesalahan saat memuat customer");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Users className="h-12 w-12 mx-auto text-gray-400 mb-4 animate-pulse" />
            <p className="text-gray-500">Memuat customer...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Customer Tidak Ditemukan
                </h3>
                <p className="text-gray-500 mb-4">
                  {error || "Customer yang Anda cari tidak dapat ditemukan."}
                </p>
                <Link href="/dashboard/customers">
                  <Button>Kembali ke Daftar Customer</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getCustomerTypeLabel = (type) => {
    const labels = {
      retail: "Retail",
      wholesale: "Grosir",
      corporate: "Korporat",
    };
    return labels[type] || type;
  };

  const getCustomerTypeVariant = (type) => {
    const variants = {
      retail: "secondary",
      wholesale: "outline",
      corporate: "default",
    };
    return variants[type] || "secondary";
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 items-start xs:items-center">
          <Link href="/dashboard/customers">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="mt-2 xs:mt-0">
            <h1 className="text-2xl md:text-3xl font-bold">{customer.name}</h1>
            <p className="text-gray-600">
              Detail customer dan informasi kontak
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informasi Utama */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detail Customer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informasi Customer
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Nama Customer
                  </label>
                  <p className="text-gray-900 font-medium">{customer.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kode Customer
                  </label>
                  <p className="text-gray-900 font-mono">{customer.code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">
                    {customer.email || <span className="text-gray-400">-</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Telepon
                  </label>
                  <p className="text-gray-900">
                    {customer.phone || <span className="text-gray-400">-</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Tipe Customer
                  </label>
                  <div className="mt-1">
                    <Badge
                      variant={getCustomerTypeVariant(customer.customer_type)}
                    >
                      {getCustomerTypeLabel(customer.customer_type)}
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
                        customer.status === "active" ? "success" : "danger"
                      }
                    >
                      {customer.status === "active" ? "Aktif" : "Nonaktif"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alamat */}
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
                    {customer.address || (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kota
                  </label>
                  <p className="text-gray-900">
                    {customer.city || <span className="text-gray-400">-</span>}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kode Pos
                  </label>
                  <p className="text-gray-900">
                    {customer.postal_code || (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informasi Bisnis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Informasi Bisnis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    NPWP / Tax ID
                  </label>
                  <p className="text-gray-900">
                    {customer.tax_id || (
                      <span className="text-gray-400">-</span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Batas Kredit
                  </label>
                  <p className="text-gray-900">
                    {customer.credit_limit
                      ? new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          minimumFractionDigits: 0,
                        }).format(customer.credit_limit)
                      : "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Termin Pembayaran
                  </label>
                  <p className="text-gray-900">
                    {customer.payment_terms
                      ? `${customer.payment_terms} hari`
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ringkasan */}
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
                    {new Date(customer.created_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">Terakhir Update</span>
                  <span className="text-sm font-medium">
                    {new Date(customer.updated_at).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Kontak */}
          {(customer.email || customer.phone) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Kontak
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{customer.email}</span>
                  </div>
                )}
                {customer.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{customer.phone}</span>
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
