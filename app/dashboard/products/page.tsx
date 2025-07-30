"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Filter, Edit, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Product, KATEGORI_PRODUK } from "@/lib/models/product";

interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kategori, setKategori] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createSuccess, setCreateSuccess] = useState("");
  const [formData, setFormData] = useState({
    nama: "",
    kategori: "",
    hargaBeli: 0,
    hargaJual: 0,
    stok: 0,
    stokMinimal: 0,
    satuan: "",
    barcode: "",
    berat: 0,
    deskripsi: "",
    status: "aktif",
  });

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (kategori) params.append("kategori", kategori);
      if (status) params.append("status", status);

      const response = await fetch(`/api/products?${params}`);
      if (!response.ok) throw new Error("Gagal mengambil data produk");

      const data: ProductsResponse = await response.json();
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search, kategori, status]);

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockStatus = (product: Product) => {
    if (product.stok <= 0)
      return { label: "Habis", variant: "destructive" as const };
    if (product.stok <= product.stokMinimal)
      return { label: "Stok Menipis", variant: "outline" as const };
    return { label: "Stok Aman", variant: "default" as const };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Manajemen Produk
          </h1>
          <p className="text-muted-foreground">
            Kelola data produk, stok, dan harga penjualan
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Produk
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tambah Produk Baru</DialogTitle>
              <DialogDescription>
                Isi form di bawah untuk menambahkan produk baru ke sistem
              </DialogDescription>
            </DialogHeader>
            <form
              className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateLoading(true);
                setCreateError("");
                setCreateSuccess("");
                try {
                  const res = await fetch("/api/products", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(formData),
                  });
                  const data = await res.json();
                  if (!res.ok) {
                    setCreateError(data.error || "Gagal tambah produk");
                  } else {
                    setCreateSuccess("Produk berhasil ditambahkan!");
                    setFormData({
                      nama: "",
                      kategori: "",
                      hargaBeli: 0,
                      hargaJual: 0,
                      stok: 0,
                      stokMinimal: 0,
                      satuan: "",
                      barcode: "",
                      berat: 0,
                      deskripsi: "",
                      status: "aktif",
                    });
                    setShowCreateDialog(false);
                    fetchProducts();
                  }
                } catch (err) {
                  setCreateError("Gagal tambah produk");
                } finally {
                  setCreateLoading(false);
                }
              }}
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Produk
                </label>
                <Input
                  name="nama"
                  value={formData.nama}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, nama: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Kategori
                </label>
                <Select
                  value={formData.kategori}
                  onValueChange={(val) =>
                    setFormData((f) => ({ ...f, kategori: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    {KATEGORI_PRODUK.map((kat) => (
                      <SelectItem key={kat} value={kat}>
                        {kat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Harga Beli
                </label>
                <Input
                  name="hargaBeli"
                  type="number"
                  min={0}
                  value={formData.hargaBeli}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      hargaBeli: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Harga Jual
                </label>
                <Input
                  name="hargaJual"
                  type="number"
                  min={0}
                  value={formData.hargaJual}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      hargaJual: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Stok</label>
                <Input
                  name="stok"
                  type="number"
                  min={0}
                  value={formData.stok}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, stok: Number(e.target.value) }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stok Minimal
                </label>
                <Input
                  name="stokMinimal"
                  type="number"
                  min={0}
                  value={formData.stokMinimal}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      stokMinimal: Number(e.target.value),
                    }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Satuan</label>
                <Input
                  name="satuan"
                  value={formData.satuan}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, satuan: e.target.value }))
                  }
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Barcode
                </label>
                <Input
                  name="barcode"
                  value={formData.barcode}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, barcode: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Berat (gram)
                </label>
                <Input
                  name="berat"
                  type="number"
                  min={0}
                  value={formData.berat}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      berat: Number(e.target.value),
                    }))
                  }
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Deskripsi
                </label>
                <Input
                  name="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, deskripsi: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <Select
                  value={formData.status}
                  onValueChange={(val) =>
                    setFormData((f) => ({ ...f, status: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Non-aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 mt-2">
                <Button type="submit" disabled={createLoading}>
                  {createLoading ? "Menyimpan..." : "Simpan Produk"}
                </Button>
              </div>
              {createError && (
                <div className="md:col-span-2 text-red-600 text-sm text-center mt-2">
                  {createError}
                </div>
              )}
              {createSuccess && (
                <div className="md:col-span-2 text-green-600 text-sm text-center mt-2">
                  {createSuccess}
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari berdasarkan kode, nama, atau barcode..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={kategori} onValueChange={setKategori}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Semua Kategori" />
              </SelectTrigger>
              <SelectContent>
                {KATEGORI_PRODUK.map((kat) => (
                  <SelectItem key={kat} value={kat}>
                    {kat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Semua Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aktif">Aktif</SelectItem>
                <SelectItem value="nonaktif">Non-aktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Produk</CardTitle>
          <CardDescription>
            {loading ? "Memuat..." : `Menampilkan ${products.length} produk`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Memuat data produk...</div>
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Tidak ada produk</h3>
              <p className="text-muted-foreground">
                Belum ada produk yang terdaftar. Tambahkan produk pertama Anda.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Nama Produk</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Harga Jual</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Status Stok</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const stockStatus = getStockStatus(product);
                    return (
                      <TableRow key={product._id?.toString()}>
                        <TableCell className="font-mono text-sm">
                          {product.kode}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{product.nama}</div>
                            {product.deskripsi && (
                              <div className="text-sm text-muted-foreground">
                                {product.deskripsi}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.kategori}</Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatRupiah(product.hargaJual)}
                        </TableCell>
                        <TableCell>
                          {product.stok} {product.satuan}
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>
                            {stockStatus.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.status === "aktif"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {product.status === "aktif" ? "Aktif" : "Non-aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <span className="text-sm text-muted-foreground">
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
