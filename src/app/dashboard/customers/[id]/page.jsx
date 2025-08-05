"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
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
import DashboardDetailLayout from "@/components/layouts/dashboard-detail-layout";
import { useDeleteDialog } from "@/hooks/use-delete-dialog";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const {
    showDeleteDialog,
    setShowDeleteDialog,
    deleteError,
    setDeleteError,
    isDeleting,
    setIsDeleting,
  } = useDeleteDialog();

  useEffect(() => {
    if (params.id) {
      fetchCustomer();
    }
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/customers/${params.id}`);

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCustomer(data.data);
        } else {
          setError(data.error || "Customer tidak ditemukan");
        }
      } else {
        setError("Customer tidak ditemukan");
      }
    } catch (error) {
      console.error("Error fetching customer:", error);
      setError("Gagal memuat data customer");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError("");

      const response = await fetch(`/api/customers/${params.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        router.push("/dashboard/customers");
      } else {
        const errorData = await response.json();
        setDeleteError(errorData.error || "Gagal menghapus customer");
      }
    } catch (error) {
      setDeleteError("Gagal menghapus customer");
    } finally {
      setIsDeleting(false);
    }
  };

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

  if (loading) {
    return (
      <DashboardDetailLayout
        title="Detail Customer"
        loading={true}
        backLink="/dashboard/customers"
      />
    );
  }

  if (error || !customer) {
    return (
      <DashboardDetailLayout
        title="Detail Customer"
        error={error || "Customer tidak ditemukan"}
        errorMessage={error || "Customer tidak ditemukan"}
        backLink="/dashboard/customers"
      />
    );
  }

  return (
    <DashboardDetailLayout
      title="Detail Customer"
      subtitle={customer?.name || "Loading..."}
      backLink="/dashboard/customers"
      editLink={`/dashboard/customers/${customer?.id}/edit`}
      onDelete={() => setShowDeleteDialog(true)}
      showDeleteDialog={showDeleteDialog}
      onCloseDeleteDialog={() => {
        setShowDeleteDialog(false);
        setDeleteError("");
      }}
      onConfirmDelete={handleDelete}
      deleteError={deleteError}
      deleteDescription={`Apakah Anda yakin ingin menghapus customer "${customer?.name}"? Tindakan ini tidak dapat dibatalkan.`}
    >
      <div className="space-y-6">
        {/* Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
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
                  <p className="text-gray-900 font-medium">
                    {customer?.name || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Kode Customer
                  </label>
                  <p className="text-gray-900 font-mono">
                    {customer?.code || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
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
                    <Badge
                      variant={getCustomerTypeVariant(customer?.customer_type)}
                    >
                      {getCustomerTypeLabel(customer?.customer_type)}
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

          {/* Contact Information */}
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
                <label className="text-sm font-medium text-gray-500">
                  Kota
                </label>
                <p className="text-gray-900">{customer?.city || "-"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Kode Pos
                </label>
                <p className="text-gray-900">{customer?.postal_code || "-"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Business Information */}
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
                  {customer?.credit_limit
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
                  {customer?.payment_terms
                    ? `${customer.payment_terms} hari`
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Informasi Sistem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Tanggal Dibuat
                </label>
                <p className="text-gray-900">
                  {customer?.created_at
                    ? new Date(customer.created_at).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "-"}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Terakhir Diperbarui
                </label>
                <p className="text-gray-900">
                  {customer?.updated_at
                    ? new Date(customer.updated_at).toLocaleDateString(
                        "id-ID",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )
                    : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardDetailLayout>
  );
}
