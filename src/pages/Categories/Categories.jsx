import React, { useState, useMemo } from "react";
import { Header } from "../../components/Header";
import {
  DataGrid,
  StatusBadge,
  ActionButton,
  TableActions,
} from "../../components/ui/DataTable";
import { createColumnHelper } from "@tanstack/react-table";
import { Edit, Trash2, Plus } from "lucide-react";

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: [],
  });
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });

  // Mock data - nanti akan diganti dengan API call
  const [categories, setCategories] = useState([
    {
      id: 1,
      name: "Elektronik",
      description: "Perangkat elektronik dan gadget",
      productCount: 25,
      status: "active",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-20",
    },
    {
      id: 2,
      name: "Pakaian",
      description: "Pakaian pria, wanita, dan anak-anak",
      productCount: 150,
      status: "active",
      createdAt: "2024-01-10",
      updatedAt: "2024-01-18",
    },
    {
      id: 3,
      name: "Makanan & Minuman",
      description: "Produk makanan dan minuman",
      productCount: 80,
      status: "active",
      createdAt: "2024-01-12",
      updatedAt: "2024-01-19",
    },
    {
      id: 4,
      name: "Kesehatan & Kecantikan",
      description: "Produk perawatan dan kosmetik",
      productCount: 45,
      status: "active",
      createdAt: "2024-01-08",
      updatedAt: "2024-01-25",
    },
    {
      id: 5,
      name: "Rumah Tangga",
      description: "Peralatan dan perlengkapan rumah tangga",
      productCount: 0,
      status: "inactive",
      createdAt: "2024-01-14",
      updatedAt: "2024-01-22",
    },
  ]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getCategoryStatus = (status) => {
    return status === "active"
      ? { text: "Aktif", variant: "success" }
      : { text: "Nonaktif", variant: "danger" };
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleFilter = (filterKey, values) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: values,
    }));
  };

  // Dynamic filter options
  const getStatusOptions = () => {
    const statuses = [...new Set(categories.map((item) => item.status))];
    return statuses.map((status) => ({
      value: status,
      label: status === "active" ? "Aktif" : "Nonaktif",
    }));
  };

  const filteredCategories = categories
    .filter((category) => {
      const matchesSearch =
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        !filters.status ||
        filters.status.length === 0 ||
        filters.status.includes(category.status);

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue = a[sortField];
      let bValue = b[sortField];

      if (sortField === "productCount") {
        aValue = Number(aValue);
        bValue = Number(bValue);
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

  // Handler functions
  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      status: category.status,
    });
    setIsCreateModalOpen(true);
  };

  const handleDeleteCategory = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (category.productCount > 0) {
      alert(
        `Tidak dapat menghapus kategori "${category.name}" karena masih memiliki ${category.productCount} produk. Pindahkan produk terlebih dahulu.`
      );
      return;
    }

    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus kategori "${category.name}"?`
      )
    ) {
      setCategories(categories.filter((cat) => cat.id !== categoryId));
    }
  };

  // Define columns for TanStack Table
  const columnHelper = createColumnHelper();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Nama Kategori",
        cell: (info) => (
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        ),
        size: 200,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("description", {
        header: "Deskripsi",
        cell: (info) => (
          <div className="max-w-xs truncate text-gray-900">
            {info.getValue()}
          </div>
        ),
        size: 250,
        enableSorting: false,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("productCount", {
        header: "Jumlah Produk",
        cell: (info) => (
          <div className="text-center">
            <span
              className={`font-semibold ${
                info.getValue() > 0 ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {info.getValue()}
            </span>
          </div>
        ),
        size: 150,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const categoryStatus = getCategoryStatus(info.getValue());
          return (
            <StatusBadge
              status={categoryStatus.text}
              variant={categoryStatus.variant}
            />
          );
        },
        size: 120,
        enableSorting: true,
        enableColumnFilter: true,
        meta: {
          filterOptions: getStatusOptions(),
          filterType: "multiselect",
        },
        filterFn: (row, columnId, value) => {
          if (!value || value.length === 0) return true;
          return value.includes(row.original.status);
        },
      }),
      columnHelper.accessor("updatedAt", {
        header: "Terakhir Update",
        cell: (info) => (
          <span className="text-gray-900">{formatDate(info.getValue())}</span>
        ),
        size: 150,
        enableSorting: true,
        enableColumnFilter: false,
      }),
      columnHelper.display({
        id: "actions",
        header: "Aksi",
        cell: (info) => {
          const category = info.row.original;
          return (
            <TableActions>
              <ActionButton
                variant="default"
                onClick={() => handleEditCategory(category)}
                title="Edit Kategori"
              >
                <Edit className="h-4 w-4" />
              </ActionButton>
              <ActionButton
                variant="danger"
                onClick={() => handleDeleteCategory(category.id)}
                title="Hapus Kategori"
                disabled={category.productCount > 0}
              >
                <Trash2 className="h-4 w-4" />
              </ActionButton>
            </TableActions>
          );
        },
        size: 120,
        enableSorting: false,
        enableColumnFilter: false,
      }),
    ],
    [categories, handleEditCategory, handleDeleteCategory]
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateCategory = (e) => {
    e.preventDefault();
    const newCategory = {
      id: categories.length + 1,
      ...formData,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setCategories([...categories, newCategory]);
    setFormData({ name: "", description: "", status: "active" });
    setIsCreateModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsCreateModalOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", status: "active" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Manajemen Kategori
            </h1>
            <p className="text-gray-600 mt-1">
              Kelola kategori produk untuk organisasi yang lebih baik
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-gray-800 transition-colors sm:w-auto w-fit"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Kategori
          </button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {categories.length}
            </div>
            <div className="text-sm text-gray-600">Total Kategori</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {categories.filter((c) => c.status === "active").length}
            </div>
            <div className="text-sm text-gray-600">Aktif</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {categories.filter((c) => c.status === "inactive").length}
            </div>
            <div className="text-sm text-gray-600">Nonaktif</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">
              {categories.reduce((total, c) => total + c.productCount, 0)}
            </div>
            <div className="text-sm text-gray-600">Total Produk</div>
          </div>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Daftar Kategori
          </h3>

          <DataGrid
            data={filteredCategories}
            columns={columns}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showSearch={false}
            pageSize={10}
          />
        </div>
      </div>

      {/* Modal Create/Edit Category */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCategory ? "Edit Kategori" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form
              onSubmit={
                editingCategory ? handleUpdateCategory : handleCreateCategory
              }
            >
              <div className="p-6 space-y-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Nama Kategori *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Contoh: Elektronik"
                  />
                </div>

                <div>
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Deskripsi
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    placeholder="Deskripsi kategori (opsional)"
                  />
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {editingCategory ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
