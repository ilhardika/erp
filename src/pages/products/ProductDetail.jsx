import React, { useState, useMemo } from "react";
import { Header } from "../../components/Header";
import { useParams, Link } from "react-router";
import { DataGrid, StatusBadge } from "../../components/ui/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import {
  Package,
  PackageMinus,
  Settings,
  BarChart3,
  ArrowLeft,
  Edit,
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();

  // Mock data - nanti akan diganti dengan API call
  const [product] = useState({
    id: 1,
    name: "Laptop Asus VivoBook 14",
    sku: "LTP-ASUS-001",
    category: "Elektronik",
    price: 8500000,
    cost: 7500000,
    stock: 15,
    minStock: 5,
    maxStock: 50,
    unit: "pcs",
    barcode: "1234567890123",
    description: "Laptop dengan processor Intel Core i5 dan RAM 8GB",
    supplier: "PT Asus Indonesia",
    location: "Rak A-1",
    status: "active",
    createdAt: "2024-01-15",
    updatedAt: "2024-01-20",
  });

  const [stockHistory] = useState([
    {
      id: 1,
      date: "2024-01-25",
      type: "in",
      quantity: 10,
      note: "Pembelian dari supplier",
      reference: "PO-001",
      user: "Admin",
    },
    {
      id: 2,
      date: "2024-01-24",
      type: "out",
      quantity: 2,
      note: "Penjualan retail",
      reference: "SO-045",
      user: "Kasir 1",
    },
    {
      id: 3,
      date: "2024-01-23",
      type: "out",
      quantity: 1,
      note: "Penjualan online",
      reference: "SO-044",
      user: "Admin",
    },
    {
      id: 4,
      date: "2024-01-22",
      type: "adjustment",
      quantity: -1,
      note: "Koreksi stok - barang rusak",
      reference: "ADJ-001",
      user: "Manager",
    },
  ]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStockStatus = (product) => {
    if (product.stock === 0) {
      return { text: "Habis", variant: "danger" };
    } else if (product.stock <= product.minStock) {
      return { text: "Menipis", variant: "warning" };
    } else if (product.stock >= product.maxStock) {
      return { text: "Berlebih", variant: "info" };
    } else {
      return { text: "Normal", variant: "success" };
    }
  };

  const getProductStatus = (status) => {
    return status === "active"
      ? { text: "Aktif", variant: "success" }
      : { text: "Nonaktif", variant: "danger" };
  };

  const getStockTypeIcon = (type) => {
    switch (type) {
      case "in":
        return Package;
      case "out":
        return PackageMinus;
      case "adjustment":
        return Settings;
      default:
        return Package;
    }
  };

  const getStockTypeText = (type) => {
    switch (type) {
      case "in":
        return "Masuk";
      case "out":
        return "Keluar";
      case "adjustment":
        return "Penyesuaian";
      default:
        return "Lainnya";
    }
  };

  const stockStatus = getStockStatus(product);
  const productStatus = getProductStatus(product.status);
  const marginPercent = (
    ((product.price - product.cost) / product.cost) *
    100
  ).toFixed(1);

  // Define columns for Stock History Table
  const columnHelper = createColumnHelper();

  const stockHistoryColumns = useMemo(
    () => [
      columnHelper.accessor("date", {
        header: "Tanggal",
        cell: (info) => (
          <span className="text-gray-900">{formatDate(info.getValue())}</span>
        ),
        size: 120,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("type", {
        header: "Jenis",
        cell: (info) => {
          const IconComponent = getStockTypeIcon(info.getValue());
          return (
            <div className="flex items-center space-x-2">
              <IconComponent className="h-4 w-4 text-gray-400" />
              <span className="text-gray-900">
                {getStockTypeText(info.getValue())}
              </span>
            </div>
          );
        },
        size: 120,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("quantity", {
        header: "Qty",
        cell: (info) => {
          const history = info.row.original;
          return (
            <div
              className={`text-center font-semibold ${
                history.type === "in"
                  ? "text-green-600"
                  : history.type === "out"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {history.type === "in" ? "+" : history.type === "out" ? "-" : ""}
              {Math.abs(info.getValue())}
            </div>
          );
        },
        size: 80,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("note", {
        header: "Keterangan",
        cell: (info) => (
          <span className="text-gray-900">{info.getValue()}</span>
        ),
        size: 200,
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("reference", {
        header: "Referensi",
        cell: (info) => (
          <span className="text-gray-900 font-mono">{info.getValue()}</span>
        ),
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("user", {
        header: "User",
        cell: (info) => (
          <span className="text-gray-900">{info.getValue()}</span>
        ),
        size: 100,
        enableSorting: false,
        enableColumnFilter: false,
      }),
    ],
    []
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/products"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5 mr-1" />
              Kembali
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Detail Produk
              </h1>
              <p className="text-gray-600 mt-1">
                Informasi lengkap produk dan riwayat stok
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/products/${product.id}/edit`}
              className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Produk
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Produk
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Nama Produk</label>
                    <p className="font-medium text-gray-900">{product.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">SKU</label>
                    <p className="font-medium text-gray-900 font-mono">
                      {product.sku}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Barcode</label>
                    <p className="font-medium text-gray-900 font-mono">
                      {product.barcode}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Kategori</label>
                    <p className="font-medium text-gray-900">
                      {product.category}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Supplier</label>
                    <p className="font-medium text-gray-900">
                      {product.supplier}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-600">Harga Jual</label>
                    <p className="font-medium text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Harga Beli</label>
                    <p className="font-medium text-gray-900">
                      {formatPrice(product.cost)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Margin</label>
                    <p className="font-medium text-green-600">
                      {formatPrice(product.price - product.cost)} (
                      {marginPercent}
                      %)
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Lokasi</label>
                    <p className="font-medium text-gray-900">
                      {product.location}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Status</label>
                    <div className="mt-1">
                      <StatusBadge
                        status={productStatus.text}
                        variant={productStatus.variant}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6">
                <label className="text-sm text-gray-600">Deskripsi</label>
                <p className="mt-1 text-gray-900">{product.description}</p>
              </div>
            </div>

            {/* Stock History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Riwayat Pergerakan Stok
              </h2>

              <DataGrid
                data={stockHistory}
                columns={stockHistoryColumns}
                showSearch={false}
                pageSize={10}
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stock Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Informasi Stok
              </h2>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">
                    {product.stock}
                  </div>
                  <div className="text-sm text-gray-600">Unit tersedia</div>
                  <div className="mt-2">
                    <StatusBadge
                      status={stockStatus.text}
                      variant={stockStatus.variant}
                    />
                  </div>
                </div>
                <div className="border-t pt-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stok Minimum</span>
                    <span className="text-sm font-medium">
                      {product.minStock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Stok Maksimum</span>
                    <span className="text-sm font-medium">
                      {product.maxStock}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Nilai Stok</span>
                    <span className="text-sm font-medium">
                      {formatPrice(product.stock * product.cost)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Aksi Cepat
              </h2>
              <div className="space-y-3">
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <Package className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Tambah Stok
                      </div>
                      <div className="text-sm text-gray-600">
                        Restock produk
                      </div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <PackageMinus className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Kurangi Stok
                      </div>
                      <div className="text-sm text-gray-600">
                        Manual stock out
                      </div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">🔧</span>
                    <div>
                      <div className="font-medium text-gray-900">
                        Penyesuaian Stok
                      </div>
                      <div className="text-sm text-gray-600">
                        Koreksi stok manual
                      </div>
                    </div>
                  </div>
                </button>
                <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-5 w-5 text-gray-400" />
                    <div>
                      <div className="font-medium text-gray-900">
                        Laporan Detail
                      </div>
                      <div className="text-sm text-gray-600">
                        Export data produk
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Product Timeline */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Timeline
              </h2>
              <div className="space-y-4">
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Produk diperbarui
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(product.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Produk dibuat
                    </p>
                    <p className="text-xs text-gray-600">
                      {formatDate(product.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
