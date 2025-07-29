import React, { useState, useMemo } from "react";
import { Header } from "../../components/Header";
import { Link } from "react-router";
import { DataGrid, StatusBadge } from "../../components/ui/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Plus, BarChart3, Upload, Download, Eye, Trash2 } from "lucide-react";

const ProductsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: [],
    stockStatus: [],
    productStatus: [],
  });

  // Mock data - nanti akan diganti dengan API call
  const [products, setProducts] = useState([
    {
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
    },
    {
      id: 2,
      name: "Mouse Wireless Logitech",
      sku: "MSE-LOGI-002",
      category: "Elektronik",
      price: 250000,
      cost: 200000,
      stock: 50,
      minStock: 10,
      maxStock: 100,
      unit: "pcs",
      barcode: "2345678901234",
      description: "Mouse wireless dengan DPI tinggi",
      supplier: "CV Tech Solutions",
      location: "Rak B-2",
      status: "active",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
    },
    {
      id: 3,
      name: "Keyboard Mechanical RGB",
      sku: "KBD-MECH-003",
      category: "Elektronik",
      price: 750000,
      cost: 600000,
      stock: 3,
      minStock: 5,
      maxStock: 25,
      unit: "pcs",
      barcode: "3456789012345",
      description: "Keyboard mechanical dengan lampu RGB",
      supplier: "PT Gaming Gear",
      location: "Rak B-3",
      status: "active",
      createdAt: "2024-01-12",
      updatedAt: "2024-01-19",
    },
    {
      id: 4,
      name: "Monitor LED 24 inch",
      sku: "MON-LED-004",
      category: "Elektronik",
      price: 2200000,
      cost: 1900000,
      stock: 0,
      minStock: 2,
      maxStock: 15,
      unit: "pcs",
      barcode: "4567890123456",
      description: "Monitor LED Full HD 24 inch",
      supplier: "PT Display Tech",
      location: "Rak A-3",
      status: "inactive",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-25",
    },
    {
      id: 5,
      name: "Webcam HD 1080p",
      sku: "WEB-HD-005",
      category: "Elektronik",
      price: 450000,
      cost: 350000,
      stock: 25,
      minStock: 8,
      maxStock: 40,
      unit: "pcs",
      barcode: "5678901234567",
      description: "Webcam HD dengan resolusi 1080p",
      supplier: "CV Digital Store",
      location: "Rak C-1",
      status: "active",
      createdAt: "2024-01-14",
      updatedAt: "2024-01-22",
    },
  ]);

  // Filter and search logic
  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchLower) ||
          product.sku.toLowerCase().includes(searchLower) ||
          product.barcode.toLowerCase().includes(searchLower) ||
          product.category.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }, [products, searchTerm]);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      setProducts(products.filter((product) => product.id !== productId));
    }
  };

  // Dynamic filter values based on current data and filters
  const getCategoryOptions = () => {
    let data = products;

    // Apply other filters first to get dynamic category options
    if (filters.stockStatus && filters.stockStatus.length > 0) {
      data = data.filter((item) => {
        const stockStatus = getStockStatus(item);
        return filters.stockStatus.includes(stockStatus.text); // Use original case
      });
    }

    if (filters.productStatus && filters.productStatus.length > 0) {
      data = data.filter((item) => filters.productStatus.includes(item.status));
    }

    const categories = [...new Set(data.map((item) => item.category))];
    return categories.map((cat) => ({ value: cat, label: cat }));
  };

  const getStockStatusOptions = () => {
    let data = products;

    // Apply other filters first to get dynamic stock status options
    if (filters.category && filters.category.length > 0) {
      data = data.filter((item) => filters.category.includes(item.category));
    }

    if (filters.productStatus && filters.productStatus.length > 0) {
      data = data.filter((item) => filters.productStatus.includes(item.status));
    }

    const statusSet = new Set();
    data.forEach((item) => {
      const stockStatus = getStockStatus(item);
      statusSet.add(stockStatus.text); // Use original case, not lowercase
    });

    return Array.from(statusSet).map((status) => ({
      value: status,
      label: status, // Use the same case for both value and label
    }));
  };

  const getProductStatusOptions = () => {
    let data = products;

    // Apply other filters first to get dynamic product status options
    if (filters.category && filters.category.length > 0) {
      data = data.filter((item) => filters.category.includes(item.category));
    }

    if (filters.stockStatus && filters.stockStatus.length > 0) {
      data = data.filter((item) => {
        const stockStatus = getStockStatus(item);
        return filters.stockStatus.includes(stockStatus.text); // Use original case
      });
    }

    const statuses = [...new Set(data.map((item) => item.status))];
    return statuses.map((status) => ({
      value: status,
      label: status === "active" ? "Aktif" : "Nonaktif",
    }));
  };

  // Define columns for TanStack Table
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        ),
        size: 50,
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("name", {
        header: "Produk",
        cell: (info) => {
          const product = info.row.original;
          return (
            <div>
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">SKU: {product.sku}</div>
              {product.barcode && (
                <div className="text-xs text-gray-400">
                  Barcode: {product.barcode}
                </div>
              )}
            </div>
          );
        },
        size: 300,
        enableSorting: true,
        enableColumnFilter: true,
      }),
      columnHelper.accessor("category", {
        header: "Kategori",
        cell: (info) => (
          <span className="text-gray-900">{info.getValue()}</span>
        ),
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          filterOptions: getCategoryOptions(),
          filterType: "multiselect",
        },
      }),
      columnHelper.accessor("price", {
        header: "Harga Jual",
        cell: (info) => (
          <div className="text-right font-semibold text-gray-900">
            {formatPrice(info.getValue())}
          </div>
        ),
        size: 180,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("stock", {
        header: "Stok",
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="text-center">
              <div className="font-medium text-gray-900">
                {product.stock} {product.unit}
              </div>
              <div className="text-xs text-gray-500">
                Min: {product.minStock} | Max: {product.maxStock}
              </div>
            </div>
          );
        },
        size: 180,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.display({
        id: "stockStatus",
        header: "Status Stok",
        cell: (info) => {
          const product = info.row.original;
          const stockStatus = getStockStatus(product);
          return (
            <StatusBadge
              status={stockStatus.text}
              variant={stockStatus.variant}
            />
          );
        },
        size: 150,
        enableSorting: false,
        enableColumnFilter: true,
        meta: {
          filterOptions: getStockStatusOptions(),
          filterType: "multiselect",
        },
        filterFn: (row, columnId, value) => {
          if (!value || value.length === 0) return true;
          const stockStatus = getStockStatus(row.original);
          return value.includes(stockStatus.text);
        },
      }),
      columnHelper.accessor("status", {
        header: "Status Produk",
        cell: (info) => {
          const productStatus = getProductStatus(info.getValue());
          return (
            <StatusBadge
              status={productStatus.text}
              variant={productStatus.variant}
            />
          );
        },
        size: 150,
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          filterOptions: getProductStatusOptions(),
          filterType: "multiselect",
        },
        filterFn: (row, columnId, value) => {
          if (!value || value.length === 0) return true;
          return value.includes(row.original.status);
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => {
          const product = info.row.original;
          return (
            <div className="flex items-center space-x-2">
              <Link
                to={`/products/${product.id}`}
                className="p-1 text-blue-600 hover:text-blue-800 rounded hover:bg-blue-50"
                title="Lihat Detail"
              >
                <Eye className="h-4 w-4" />
              </Link>
              <button
                onClick={() => {
                  if (
                    confirm("Apakah Anda yakin ingin menghapus produk ini?")
                  ) {
                    handleDeleteProduct(product.id);
                  }
                }}
                className="p-1 text-red-600 hover:text-red-800 rounded hover:bg-red-50"
                title="Hapus Produk"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          );
        },
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
      }),
    ],
    [handleDeleteProduct]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Manajemen Produk
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola semua produk dan inventori Anda
            </p>
          </div>
          <Link
            to="/products/create"
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors sm:w-auto w-fit"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Tambah Produk
          </Link>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {products.length}
            </div>
            <div className="text-sm text-gray-600">Total Produk</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {products.filter((p) => p.status === "active").length}
            </div>
            <div className="text-sm text-gray-600">Produk Aktif</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {products.filter((p) => p.stock === 0).length}
            </div>
            <div className="text-sm text-gray-600">Stok Habis</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {
                products.filter((p) => p.stock <= p.minStock && p.stock > 0)
                  .length
              }
            </div>
            <div className="text-sm text-gray-600">Stok Menipis</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 col-span-2 lg:col-span-1">
            <div className="text-2xl font-bold text-gray-900">
              {formatPrice(
                products.reduce((total, p) => total + p.price * p.stock, 0)
              )}
            </div>
            <div className="text-sm text-gray-600">Nilai Stok</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Link
            to="/products/create"
            className="bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <div className="text-center">
              <Plus className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium">Tambah Produk</div>
            </div>
          </Link>
          <button className="bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <BarChart3 className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium">Laporan Stok</div>
            </div>
          </button>
          <button className="bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium">Import Produk</div>
            </div>
          </button>
          <button className="bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
            <div className="text-center">
              <Download className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium">Export Data</div>
            </div>
          </button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daftar Produk
          </h3>

          <DataGrid
            data={filteredProducts}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showSearch={true}
            pageSize={10}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
