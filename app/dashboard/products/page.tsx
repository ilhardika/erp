"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Package,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ResponsiveModal } from "@/components/ui/responsive-modal";
import { ProductForm } from "@/components/forms/product-form";
import { Product, ProductCreateInput } from "@/lib/models/product";
import { Category } from "@/lib/models/category";
import { Satuan } from "@/lib/models/satuan";

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

type SortField =
  | "kode"
  | "nama"
  | "kategori"
  | "hargaJual"
  | "stok"
  | "updatedAt";
type SortOrder = "asc" | "desc";

export default function ProductsPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [satuans, setSatuans] = useState<Satuan[]>([]);
  const [search, setSearch] = useState("");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [sortField, setSortField] = useState<SortField>("updatedAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDeleteProduct = async (id: string) => {
    if (!id) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal menghapus produk");
      }
      await fetchProducts();
      setShowDeleteDialog(false);
      setDeleteId(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menghapus produk");
    } finally {
      setDeleteLoading(false);
    }
  };
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/products?limit=1000");
      if (!response.ok) throw new Error("Gagal mengambil data produk");

      const data: ProductsResponse = await response.json();
      setAllProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
    fetchSatuans();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories?status=aktif");
      if (!response.ok) throw new Error("Gagal mengambil data kategori");
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchSatuans = async () => {
    try {
      const response = await fetch("/api/satuans");
      if (!response.ok) throw new Error("Gagal mengambil data satuan");
      const data = await response.json();
      setSatuans(data);
    } catch (error) {
      console.error("Error fetching satuans:", error);
    }
  };

  // Filter dan sorting
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = allProducts;

    // Filter berdasarkan search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.kode?.toLowerCase().includes(searchLower) ||
          product.nama.toLowerCase().includes(searchLower) ||
          product.barcode?.toLowerCase().includes(searchLower) ||
          product.kategori.toLowerCase().includes(searchLower)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal: string | number = a[sortField] as string | number;
      let bVal: string | number = b[sortField] as string | number;

      if (sortField === "updatedAt") {
        aVal = new Date(aVal as string).getTime();
        bVal = new Date(bVal as string).getTime();
      }

      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = (bVal as string).toLowerCase();
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [allProducts, search, sortField, sortOrder]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortableHeader = ({
    field,
    children,
    className = "",
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead
      className={`cursor-pointer hover:bg-muted/50 select-none ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortField === field &&
          (sortOrder === "asc" ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          ))}
      </div>
    </TableHead>
  );

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    if (product.stok <= 0)
      return {
        label: "Habis",
        className: "bg-red-100 text-red-800 border-red-200",
      };
    if (product.stok <= product.stokMinimal)
      return {
        label: "Menipis",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      };
    return {
      label: "Aman",
      className: "bg-green-100 text-green-800 border-green-200",
    };
  };

  const getStatusBadge = (status: string) => {
    if (status === "aktif") {
      return { className: "bg-green-100 text-green-800 border-green-200" };
    }
    return { className: "bg-gray-100 text-gray-800 border-gray-200" };
  };

  const handleCreateProduct = async (data: ProductCreateInput) => {
    try {
      setCreateLoading(true);
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal membuat produk");
      }

      await fetchProducts();
      setShowCreateDialog(false);
    } catch (error) {
      console.error("Error creating product:", error);
      alert(error instanceof Error ? error.message : "Gagal membuat produk");
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditProduct = async (data: ProductCreateInput) => {
    if (!editProduct) return;
    try {
      setEditLoading(true);
      const response = await fetch(`/api/products/${editProduct._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Gagal mengupdate produk");
      }
      await fetchProducts();
      setShowEditDialog(false);
      setEditProduct(null);
    } catch (error) {
      console.error("Error updating product:", error);
      alert(error instanceof Error ? error.message : "Gagal mengupdate produk");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-6 px-2 sm:px-0 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Manajemen Produk</h1>
          <p className="text-muted-foreground text-sm">
            Kelola data produk, stok, dan harga penjualan
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Tambah Produk
        </Button>
      </div>

      {/* Products Table - Responsive grid and scrollable on mobile */}
      <div className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
          <Card className="col-span-1 lg:col-span-5 w-full min-w-0  border-0">
            <CardHeader className=" border-0">
              <CardTitle className="text-lg ">Daftar Produk</CardTitle>
              <p className="text-sm text-muted-foreground ">
                {loading
                  ? "Memuat..."
                  : `Menampilkan ${filteredAndSortedProducts.length} produk`}
              </p>
            </CardHeader>
            <CardContent className=" border-0">
              {/* Search form tanpa padding/margin */}
              <div className="flex justify-start items-center p-0 w-full mb-3">
                <div className="relative max-w-md w-full sm:w-80 ">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground " />
                  <Input
                    placeholder="Cari berdasarkan kode, nama, barcode, atau kategori..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="overflow-x-auto max-w-full block ">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-muted-foreground">
                      Memuat data produk...
                    </div>
                  </div>
                ) : filteredAndSortedProducts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Package className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold">Tidak ada produk</h3>
                    <p className="text-muted-foreground">
                      {search
                        ? "Tidak ada produk yang sesuai dengan pencarian."
                        : "Belum ada produk yang terdaftar."}
                    </p>
                  </div>
                ) : (
                  <div className="border rounded-lg overflow-hidden min-w-0 ">
                    <Table className="w-full table-auto">
                      <TableHeader>
                        <TableRow>
                          <SortableHeader
                            field="kode"
                            className="min-w-[120px]"
                          >
                            Kode
                          </SortableHeader>
                          <SortableHeader
                            field="nama"
                            className="min-w-[200px]"
                          >
                            Nama Produk
                          </SortableHeader>
                          <SortableHeader
                            field="kategori"
                            className="min-w-[120px]"
                          >
                            Kategori
                          </SortableHeader>
                          <SortableHeader
                            field="hargaJual"
                            className="min-w-[120px]"
                          >
                            Harga Jual
                          </SortableHeader>
                          <SortableHeader
                            field="stok"
                            className="min-w-[100px]"
                          >
                            Stok
                          </SortableHeader>
                          <TableHead className="min-w-[120px]">
                            Status Stok
                          </TableHead>
                          <TableHead className="min-w-[100px]">
                            Status
                          </TableHead>
                          <TableHead className="min-w-[120px]">Aksi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredAndSortedProducts.map((product) => {
                          const stockStatus = getStockStatus(product);
                          const statusBadge = getStatusBadge(product.status);
                          // Mapping kategori dan satuan
                          let kategoriId: string = "";
                          if (
                            typeof product.kategori === "object" &&
                            product.kategori !== null &&
                            "_id" in product.kategori
                          ) {
                            kategoriId = String((product.kategori as any)._id);
                          } else {
                            kategoriId = String(product.kategori);
                          }
                          const kategoriObj = categories.find(
                            (c) => String(c._id) === String(kategoriId)
                          );
                          const kategoriNama = kategoriObj
                            ? kategoriObj.nama
                            : "Kategori tidak ditemukan";
                          let satuanId: string = "";
                          if (
                            typeof product.satuan === "object" &&
                            product.satuan !== null &&
                            "_id" in product.satuan
                          ) {
                            satuanId = String((product.satuan as any)._id);
                          } else {
                            satuanId = String(product.satuan);
                          }
                          const satuanObj = satuans.find(
                            (s) => String(s._id) === String(satuanId)
                          );
                          const satuanNama = satuanObj
                            ? satuanObj.nama
                            : "Satuan tidak ditemukan";
                          return (
                            <TableRow key={product._id?.toString()}>
                              <TableCell className="font-mono text-sm">
                                {product.kode}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {product.nama}
                                  </div>
                                  {product.deskripsi && (
                                    <div className="text-xs text-muted-foreground line-clamp-2 max-w-[200px]">
                                      {product.deskripsi}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline" className="text-xs">
                                  {kategoriNama}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">
                                {formatRupiah(product.hargaJual)}
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">
                                  {product.stok}
                                </span>
                                <span className="text-sm ml-1">
                                  {satuanNama}
                                </span>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${stockStatus.className}`}
                                >
                                  {stockStatus.label}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${statusBadge.className}`}
                                >
                                  {product.status === "aktif"
                                    ? "Aktif"
                                    : "Non-aktif"}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => {
                                      setEditProduct(product);
                                      setShowEditDialog(true);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    disabled={
                                      deleteLoading &&
                                      deleteId === product._id?.toString()
                                    }
                                    onClick={() => {
                                      setDeleteId(
                                        product._id?.toString() || ""
                                      );
                                      setShowDeleteDialog(true);
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                    {/* Info geser di mobile */}
                    <div className="p-4 border-t bg-muted/20 sm:hidden">
                      <p className="text-xs text-muted-foreground text-center">
                        💡 Geser tabel ke kiri/kanan untuk melihat kolom lainnya
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Product Modal */}
      {/* Delete Product Modal */}
      {showDeleteDialog && (
        <ResponsiveModal
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          title="Hapus Produk"
          description="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        >
          <div className="flex flex-col gap-4">
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDeleteProduct(deleteId)}
              disabled={deleteLoading}
            >
              {deleteLoading ? "Menghapus..." : "Hapus Produk"}
            </Button>
          </div>
        </ResponsiveModal>
      )}
      <ResponsiveModal
        open={showCreateDialog}
        onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) {
            // Refetch kategori dan satuan setelah modal ditutup
            fetchCategories();
            fetchSatuans();
          }
        }}
        title="Tambah Produk Baru"
        description="Isi form di bawah untuk menambahkan produk baru ke sistem"
      >
        <ProductForm
          onSubmit={handleCreateProduct}
          onCancel={() => setShowCreateDialog(false)}
          loading={createLoading}
          onCategoryAdded={fetchCategories}
          onSatuanAdded={fetchSatuans}
        />
      </ResponsiveModal>
      {/* Edit Product Modal */}
      <ResponsiveModal
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) setEditProduct(null);
        }}
        title="Edit Produk"
        description="Ubah data produk di bawah ini"
      >
        {editProduct && (
          <ProductForm
            onSubmit={handleEditProduct}
            onCancel={() => {
              setShowEditDialog(false);
              setEditProduct(null);
            }}
            loading={editLoading}
            defaultValues={{
              ...editProduct,
              kategori: String(editProduct.kategori),
              satuan: String(editProduct.satuan),
            }}
          />
        )}
      </ResponsiveModal>
    </div>
  );
}
