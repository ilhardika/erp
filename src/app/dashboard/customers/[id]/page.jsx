"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Users } from "lucide-react";
import DashboardDetailLayout from "@/components/layouts/dashboard-detail-layout";
import {
  CustomerBasicInfo,
  CustomerAddressInfo,
  CustomerBusinessInfo,
  MetadataInfo,
} from "@/components/detail/info-cards";
import {
  CustomerQuickActions,
  MetadataSidebar,
} from "@/components/detail/sidebar-cards";
import {
  getCustomerTypeLabel,
  getCustomerTypeVariant,
} from "@/lib/format-utils";

export default function CustomerDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <DashboardDetailLayout
        title="Detail Customer"
        loading={true}
        backLink="/dashboard/customers"
        loadingIcon={Users}
        loadingMessage="Memuat customer..."
      />
    );
  }

  if (error || !customer) {
    return (
      <DashboardDetailLayout
        title="Detail Customer"
        error={true}
        errorMessage={error || "Customer tidak ditemukan"}
        backLink="/dashboard/customers"
        errorIcon={Users}
      />
    );
  }

  return (
    <DashboardDetailLayout
      title="Detail Customer"
      subtitle={customer?.name || "Loading..."}
      backLink="/dashboard/customers"
      showEdit={false}
      showDelete={false}
    >
      <div className="space-y-6">
        {/* Detail Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomerBasicInfo
            customer={customer}
            getCustomerTypeLabel={getCustomerTypeLabel}
            getCustomerTypeVariant={getCustomerTypeVariant}
          />
          <CustomerAddressInfo customer={customer} />
        </div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CustomerBusinessInfo customer={customer} />
          <MetadataInfo data={customer} />
        </div>

        {/* Quick Actions */}
        <CustomerQuickActions customerId={customer?.id} />
      </div>
    </DashboardDetailLayout>
  );
}
