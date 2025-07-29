import React, { useState } from "react";
import { Header } from "../../components/Header";
import { Link, useNavigate } from "react-router";
import { ArrowLeft } from "lucide-react";

const CreateProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    price: "",
    stock: "",
    description: "",
    status: "active",
  });

  const [errors, setErrors] = useState({});

  const categories = [
    "Makanan",
    "Minuman",
    "Snack",
    "Elektronik",
    "Pakaian",
    "Lainnya",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Special handling for numeric fields
    if (name === "price" || name === "stock") {
      // Allow only numbers and handle empty string
      const numericValue = value === "" ? "" : value.replace(/[^0-9]/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama produk wajib diisi";
    }

    if (!formData.sku.trim()) {
      newErrors.sku = "SKU wajib diisi";
    }

    if (!formData.category) {
      newErrors.category = "Kategori wajib dipilih";
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = "Harga harus lebih dari 0";
    }

    if (!formData.stock || parseInt(formData.stock) < 0) {
      newErrors.stock = "Stok tidak boleh negatif";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock success - nanti akan diganti dengan actual API call
      console.log("Product created:", formData);

      // Navigate back to products list
      navigate("/products");
    } catch (error) {
      console.error("Error creating product:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateSKU = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100)
      .toString()
      .padStart(2, "0");
    const categoryPrefix = formData.category
      ? formData.category.slice(0, 2).toUpperCase()
      : "PR";
    return `${categoryPrefix}${timestamp}${randomNum}`;
  };

  const handleGenerateSKU = () => {
    setFormData((prev) => ({
      ...prev,
      sku: generateSKU(),
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center space-x-4">
            <Link to="/products" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Tambah Produk
              </h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1">
                Tambahkan produk baru ke dalam inventory
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Main Product Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Produk
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Product Name */}
              <div className="md:col-span-2">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Nama Produk *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="Masukkan nama produk"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* SKU */}
              <div>
                <label
                  htmlFor="sku"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  SKU *
                </label>
                <div className="flex space-x-2">
                  <input
                    id="sku"
                    name="sku"
                    type="text"
                    value={formData.sku}
                    onChange={handleInputChange}
                    className={`flex-1 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      errors.sku ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="SKU produk"
                  />
                  <button
                    type="button"
                    onClick={handleGenerateSKU}
                    className="px-3 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Generate
                  </button>
                </div>
                {errors.sku && (
                  <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label
                  htmlFor="category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Kategori *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    errors.category ? "border-red-300" : "border-gray-300"
                  }`}
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Harga & Stok
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Price */}
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Harga Jual *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 text-sm">
                    Rp
                  </span>
                  <input
                    id="price"
                    name="price"
                    type="text"
                    inputMode="numeric"
                    value={formData.price}
                    onChange={handleInputChange}
                    className={`w-full pl-8 pr-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                      errors.price ? "border-red-300" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.price && (
                  <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                )}
              </div>

              {/* Stock */}
              <div>
                <label
                  htmlFor="stock"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Stok Awal *
                </label>
                <input
                  id="stock"
                  name="stock"
                  type="text"
                  inputMode="numeric"
                  value={formData.stock}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
                    errors.stock ? "border-red-300" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-sm text-red-600">{errors.stock}</p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Status */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detail Tambahan
            </h2>

            <div className="space-y-4">
              {/* Description */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Deskripsi
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  placeholder="Deskripsi produk (opsional)"
                />
              </div>

              {/* Status */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Tidak Aktif</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 sm:flex-none px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              {isLoading ? "Menyimpan..." : "Simpan Produk"}
            </button>
            <Link
              to="/products"
              className="flex-1 sm:flex-none px-6 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors text-center focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
