"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { ProductCreateInput, SATUAN_PRODUK } from "@/lib/models/product";
import { Category } from "@/lib/models/category";

const productSchema = z.object({
  kode: z.string().optional(),
  nama: z.string().min(1, "Nama produk wajib diisi"),
  deskripsi: z.string().optional(),
  kategori: z
    .string()
    .min(1, "Kategori wajib dipilih")
    .refine((val) => val !== "", {
      message: "Kategori wajib dipilih",
    }),
  hargaBeli: z.number().min(0, "Harga beli tidak boleh negatif"),
  hargaJual: z.number().min(0, "Harga jual tidak boleh negatif"),
  stok: z.number().min(0, "Stok tidak boleh negatif"),
  stokMinimal: z.number().min(0, "Stok minimal tidak boleh negatif"),
  satuan: z
    .string()
    .min(1, "Satuan wajib dipilih")
    .refine((val) => val !== "", {
      message: "Satuan wajib dipilih",
    }),
  barcode: z.string().optional(),
  berat: z.number().optional(),
  gambar: z.string().optional(),
  status: z.enum(["aktif", "nonaktif"]),
});

// Default values for useForm
const defaultValues: ProductFormData = {
  kode: "",
  nama: "",
  kategori: "",
  hargaBeli: 0,
  hargaJual: 0,
  stok: 0,
  stokMinimal: 1,
  satuan: "",
  status: "aktif",
  deskripsi: "",
  barcode: "",
  berat: undefined,
  gambar: "",
};

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSubmit: (data: ProductCreateInput) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  defaultValues?: Partial<ProductFormData>;
  onCategoryAdded?: () => void;
  onSatuanAdded?: () => void;
}

// Mapping satuan ke unit berat yang sesuai
const satuanToWeightUnit = {
  kg: "kg",
  gram: "gram",
  liter: "liter",
  ml: "ml",
  pcs: "gram",
  meter: "meter",
  cm: "cm",
  box: "kg",
  pack: "kg",
  lusin: "kg",
};

export function ProductForm({
  onSubmit,
  onCancel,
  loading = false,
  defaultValues,
  onCategoryAdded,
  onSatuanAdded,
}: ProductFormProps) {
  const [satuans, setSatuans] = useState<{ _id: string; nama: string }[]>([]);
  const [loadingSatuans, setLoadingSatuans] = useState(true);
  const [newSatuanName, setNewSatuanName] = useState("");
  const [addingSatuan, setAddingSatuan] = useState(false);
  const [deleteSatuanId, setDeleteSatuanId] = useState<string | null>(null);

  // State untuk produk, agar bisa cek satuan yang sedang dipakai
  const [allProducts, setAllProducts] = useState<any[]>([]);

  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  // Kode produk selalu otomatis jika kosong
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: defaultValues || {
      kode: "",
      nama: "",
      kategori: "",
      hargaBeli: 0,
      hargaJual: 0,
      stok: 0,
      stokMinimal: 1,
      satuan: "",
      status: "aktif",
      deskripsi: "",
      barcode: "",
      berat: undefined,
      gambar: "",
    },
    mode: "onChange",
  });

  const selectedSatuan = form.watch("satuan");
  const weightUnit = selectedSatuan
    ? satuanToWeightUnit[selectedSatuan as keyof typeof satuanToWeightUnit]
    : "gram";

  // Sinkronisasi value kategori & satuan agar label selalu muncul
  useEffect(() => {
    // Kategori
    if (form.watch("kategori") && categories.length > 0) {
      const found = categories.find(
        (cat: Category) => cat._id?.toString() === form.watch("kategori")
      );
      if (!found) {
        const byName = categories.find(
          (cat: Category) => cat.nama === newCategoryName.trim()
        );
        if (byName) {
          form.setValue("kategori", byName._id?.toString() ?? "");
        }
      }
    }
    // Satuan
    if (form.watch("satuan") && satuans.length > 0) {
      const found = satuans.find(
        (sat: { _id: string; nama: string }) => sat._id === form.watch("satuan")
      );
      if (!found) {
        const byName = satuans.find(
          (sat: { _id: string; nama: string }) =>
            sat.nama === newSatuanName.trim()
        );
        if (byName) {
          form.setValue("satuan", byName._id);
        }
      }
    }
  }, [categories, satuans, form, newCategoryName, newSatuanName]);

  const fetchSatuans = async () => {
    try {
      setLoadingSatuans(true);
      const response = await fetch("/api/satuans");
      if (response.ok) {
        const data = await response.json();
        setSatuans(data);
      }
    } catch (error) {
      console.error("Error fetching satuans:", error);
    } finally {
      setLoadingSatuans(false);
    }
  };

  // Fetch produk, kategori, satuan saat mount
  useEffect(() => {
    fetchCategories();
    fetchSatuans();
    fetchAllProducts();
  }, []);

  // Fungsi fetch produk
  const fetchAllProducts = async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      setLoadingCategories(true);
      const response = await fetch("/api/categories?status=aktif");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const generateKode = async () => {
    try {
      const response = await fetch("/api/products?limit=1");
      if (response.ok) {
        const data = await response.json();
        const lastProduct = data.products[0];
        const lastNumber = lastProduct?.kode
          ? parseInt(lastProduct.kode.replace("PRD", ""))
          : 0;
        const newKode = `PRD${String(lastNumber + 1).padStart(6, "0")}`;
        form.setValue("kode", newKode);
        return newKode;
      }
    } catch (error) {
      console.error("Error generating kode:", error);
    }
    return "";
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    setAddingCategory(true);
    try {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newCategoryName.trim() }),
      });
      if (response.ok) {
        // After adding, refetch categories from backend
        const getResponse = await fetch("/api/categories?status=aktif");
        if (getResponse.ok) {
          const allCategories = await getResponse.json();
          setCategories(allCategories);
          // Find the newly added category by name
          const found = allCategories.find(
            (cat: Category) => cat.nama === newCategoryName.trim()
          );
          if (found) {
            form.setValue("kategori", found._id);
          }
          if (onCategoryAdded) onCategoryAdded();
        }
        setNewCategoryName("");
      } else {
        const error = await response.json();
        alert(error.error || "Gagal menambah kategori");
      }
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Gagal menambah kategori");
    } finally {
      setAddingCategory(false);
    }
  };

  const handleSubmit = async (data: ProductFormData) => {
    try {
      // Pastikan kode produk terisi
      if (!data.kode) {
        const kode = await generateKode();
        data.kode = kode || "";
      }
      // Pastikan kode selalu string
      await onSubmit({
        ...data,
        kode: data.kode || "",
      });
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  // Sinkronisasi value kategori & satuan agar label selalu muncul
  useEffect(() => {
    // Kategori
    if (form.watch("kategori") && categories.length > 0) {
      const found = categories.find(
        (cat: Category) => cat._id?.toString() === form.watch("kategori")
      );
      if (!found) {
        const byName = categories.find(
          (cat: Category) => cat.nama === newCategoryName.trim()
        );
        if (byName) {
          form.setValue("kategori", byName._id?.toString() ?? "");
        }
      }
    }
    // Satuan
    if (form.watch("satuan") && satuans.length > 0) {
      const found = satuans.find(
        (sat: { _id: string; nama: string }) => sat._id === form.watch("satuan")
      );
      if (!found) {
        const byName = satuans.find(
          (sat: { _id: string; nama: string }) =>
            sat.nama === newSatuanName.trim()
        );
        if (byName) {
          form.setValue("satuan", byName._id);
        }
      }
    }
  }, [categories, satuans, form, newCategoryName, newSatuanName]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Kode Produk */}
          <div className="space-y-2">
            <Label>SKU/Kode Produk</Label>
            <FormField
              control={form.control}
              name="kode"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input {...field} placeholder="Otomatis jika kosong" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Nama Produk */}
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Produk *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Masukkan nama produk" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Deskripsi */}
        <FormField
          control={form.control}
          name="deskripsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Deskripsi</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder="Deskripsi produk (opsional)"
                  className="resize-none"
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kategori */}
          <div className="space-y-2 col-span-1 sm:col-span-2">
            <Label>Kategori *</Label>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {loadingCategories ? (
                          <SelectItem value="loading-placeholder" disabled>
                            Memuat...
                          </SelectItem>
                        ) : null}
                        {categories.length === 0 && !loadingCategories ? (
                          <SelectItem value="empty-placeholder" disabled>
                            Tidak ada kategori
                          </SelectItem>
                        ) : null}
                        {categories.map((category) => (
                          <div
                            key={category._id?.toString() || category.nama}
                            className="flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded relative"
                          >
                            <SelectItem
                              value={
                                category._id?.toString() ||
                                category.nama ||
                                "unknown"
                              }
                              className="flex-1"
                            >
                              {category.nama}
                            </SelectItem>
                            <button
                              type="button"
                              aria-label="Hapus kategori"
                              className={`ml-2 text-red-500 px-2 py-0.5 rounded border border-transparent flex items-center justify-center ${
                                allProducts &&
                                allProducts.some(
                                  (product) =>
                                    String(product.kategori) ===
                                    String(category._id)
                                )
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:text-red-700 hover:border-red-300"
                              }`}
                              disabled={
                                allProducts &&
                                allProducts.some(
                                  (product) =>
                                    String(product.kategori) ===
                                    String(category._id)
                                )
                              }
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (
                                  allProducts &&
                                  allProducts.some(
                                    (product) =>
                                      String(product.kategori) ===
                                      String(category._id)
                                  )
                                )
                                  return;
                                // Langsung delete kategori
                                const response = await fetch(
                                  `/api/categories/${category._id}`,
                                  { method: "DELETE" }
                                );
                                if (response.ok) {
                                  setCategories((prev) =>
                                    prev.filter((c) => c._id !== category._id)
                                  );
                                  if (
                                    form.watch("kategori") ===
                                    String(category._id)
                                  ) {
                                    form.setValue("kategori", "");
                                  }
                                }
                              }}
                            >
                              <span className="sr-only">Hapus</span>
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex items-center gap-2 px-2 py-2 border-t mt-2">
                          <Input
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="Nama kategori baru"
                            className="flex-1 h-6 text-xs px-2 py-1 w-full"
                            disabled={addingCategory}
                          />
                          <Button
                            type="button"
                            size="sm"
                            className="h-6 px-2 text-xs min-w-[56px]"
                            disabled={addingCategory || !newCategoryName.trim()}
                            onClick={async () => {
                              if (!newCategoryName.trim()) return;
                              setAddingCategory(true);
                              const postResponse = await fetch(
                                "/api/categories",
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({
                                    nama: newCategoryName.trim(),
                                  }),
                                }
                              );
                              if (postResponse.ok) {
                                // Fetch latest categories dari backend
                                const getResponse = await fetch(
                                  "/api/categories?status=aktif"
                                );
                                if (getResponse.ok) {
                                  const allCategories =
                                    await getResponse.json();
                                  setCategories(allCategories);
                                  // Find the newly added category by name
                                  const found = allCategories.find(
                                    (cat: Category) =>
                                      cat.nama === newCategoryName.trim()
                                  );
                                  if (found) {
                                    form.setValue("kategori", found._id);
                                  }
                                  if (onCategoryAdded) onCategoryAdded();
                                }
                                setNewCategoryName("");
                              }
                              setAddingCategory(false);
                            }}
                          >
                            {addingCategory ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              "Tambah"
                            )}
                          </Button>
                        </div>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* End flex container for category dropdown */}
            </div>
          </div>

          {/* Satuan */}
          <div className="space-y-2 col-span-1 sm:col-span-2">
            <FormLabel>Satuan *</FormLabel>
            <FormField
              control={form.control}
              name="satuan"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col">
                  <Select
                    onValueChange={(value) => {
                      if (value === "") return;
                      field.onChange(value);
                    }}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="w-full">
                      {loadingSatuans ? (
                        <SelectItem value="loading-placeholder" disabled>
                          Memuat...
                        </SelectItem>
                      ) : (
                        <>
                          {satuans.length === 0 && (
                            <SelectItem value="empty-placeholder" disabled>
                              Tidak ada satuan
                            </SelectItem>
                          )}
                          {satuans.map((satuan) => (
                            <div
                              key={satuan._id}
                              className="flex items-center justify-between px-2 py-1 hover:bg-gray-100 rounded relative w-full"
                            >
                              <SelectItem
                                value={satuan._id}
                                className="flex-1 w-full"
                              >
                                {satuan.nama}
                              </SelectItem>
                              <button
                                type="button"
                                aria-label="Hapus satuan"
                                className={`ml-2 text-red-500 px-2 py-0.5 rounded border border-transparent flex items-center justify-center ${
                                  allProducts &&
                                  allProducts.some(
                                    (product) =>
                                      String(product.satuan) ===
                                      String(satuan._id)
                                  )
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:text-red-700 hover:border-red-300"
                                }`}
                                disabled={
                                  allProducts &&
                                  allProducts.some(
                                    (product) =>
                                      String(product.satuan) ===
                                      String(satuan._id)
                                  )
                                }
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  if (
                                    allProducts &&
                                    allProducts.some(
                                      (product) =>
                                        String(product.satuan) ===
                                        String(satuan._id)
                                    )
                                  )
                                    return;
                                  // Langsung delete satuan
                                  const response = await fetch(
                                    `/api/satuans/${satuan._id}`,
                                    { method: "DELETE" }
                                  );
                                  if (response.ok) {
                                    setSatuans((prev) =>
                                      prev.filter((s) => s._id !== satuan._id)
                                    );
                                    if (form.watch("satuan") === satuan._id) {
                                      form.setValue("satuan", "");
                                    }
                                  }
                                }}
                              >
                                <span className="sr-only">Hapus</span>
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                          <div className="flex items-center gap-2 px-2 py-2 border-t mt-2 w-full">
                            <Input
                              value={newSatuanName}
                              onChange={(e) => setNewSatuanName(e.target.value)}
                              placeholder="Nama satuan baru"
                              className="flex-1 h-6 text-xs px-2 py-1 w-full"
                              disabled={addingSatuan}
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="h-6 px-2 text-xs min-w-[56px]"
                              disabled={addingSatuan || !newSatuanName.trim()}
                              onClick={async () => {
                                if (!newSatuanName.trim()) return;
                                setAddingSatuan(true);
                                const postResponse = await fetch(
                                  "/api/satuans",
                                  {
                                    method: "POST",
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                    body: JSON.stringify({
                                      nama: newSatuanName.trim(),
                                    }),
                                  }
                                );
                                if (postResponse.ok) {
                                  // Fetch latest satuans dari backend
                                  const getResponse = await fetch(
                                    "/api/satuans"
                                  );
                                  if (getResponse.ok) {
                                    const allSatuans = await getResponse.json();
                                    setSatuans(allSatuans);
                                    // Find the newly added satuan by name
                                    const found = allSatuans.find(
                                      (sat: { _id: string; nama: string }) =>
                                        sat.nama === newSatuanName.trim()
                                    );
                                    if (found) {
                                      form.setValue("satuan", found._id);
                                    }
                                    if (onSatuanAdded) onSatuanAdded();
                                  }
                                  setNewSatuanName("");
                                }
                                setAddingSatuan(false);
                              }}
                            >
                              {addingSatuan ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                "Tambah"
                              )}
                            </Button>
                          </div>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Harga Beli */}
          <FormField
            control={form.control}
            name="hargaBeli"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Beli *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Harga Jual */}
          <FormField
            control={form.control}
            name="hargaJual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Harga Jual *</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Stok */}
          <FormField
            control={form.control}
            name="stok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok Awal</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Stok Minimal */}
          <FormField
            control={form.control}
            name="stokMinimal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stok Minimal</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder="1"
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          {/* Barcode */}
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Barcode produk (opsional)"
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Status */}
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="nonaktif">Non-aktif</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={
              loading ||
              !form.watch("kategori") ||
              !form.watch("satuan") ||
              !form.watch("nama")
            }
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Menyimpan...
              </>
            ) : (
              "Simpan Produk"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
