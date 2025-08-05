"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Package } from "lucide-react";
import DashboardDetailLayout from "@/components/layouts/dashboard-detail-layout";
import {
  ProductBasicInfo,
  ProductPricingInfo,
  ProductPhysicalInfo,
} from "@/components/detail/info-cards";
import {
  ProductStockInfo,
  SupplierInfo,
  ProductQuickActions,
  MetadataSidebar,
} from "@/components/detail/sidebar-cards";

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();

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
      showEdit={false}
      showDelete={false}
    >
      {product && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Product Info */}
          <div className="lg:col-span-2 space-y-6">
            <ProductBasicInfo product={product} />
            <ProductPricingInfo product={product} />
            <ProductPhysicalInfo product={product} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <ProductStockInfo product={product} />
            {product.supplier && <SupplierInfo supplier={product.supplier} />}
            <MetadataSidebar data={product} />
            <ProductQuickActions productId={product._id} />
          </div>
        </div>
      )}
    </DashboardDetailLayout>
  );
}
