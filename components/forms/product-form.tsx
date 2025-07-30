"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Loader2 } from "lucide-react";

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
  kode: z.string().min(1, "Kode produk wajib diisi"),
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
}: ProductFormProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [autoGenerateKode, setAutoGenerateKode] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addingCategory, setAddingCategory] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const selectedSatuan = form.watch("satuan");
  const weightUnit = selectedSatuan
    ? satuanToWeightUnit[selectedSatuan as keyof typeof satuanToWeightUnit]
    : "gram";

  useEffect(() => {
    fetchCategories();
  }, []);

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
      }
    } catch (error) {
      console.error("Error generating kode:", error);
    }
  };

  const addNewCategory = async () => {
    if (!newCategoryName.trim()) return;

    try {
      setAddingCategory(true);
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: newCategoryName.trim() }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories((prev) => [...prev, newCategory]);
        form.setValue("kategori", newCategory._id);
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
      // Generate kode otomatis jika diperlukan
      if (autoGenerateKode && !data.kode) {
        await generateKode();
        const kode = form.getValues("kode");
        data.kode = kode;
      }

      await onSubmit(data);
    } catch (error) {
      console.error("Submit error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Kode Produk */}
          <div className="space-y-2">
            <Label>SKU/Kode Produk</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <FormField
                control={form.control}
                name="kode"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Otomatis jika kosong"
                        disabled={autoGenerateKode}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAutoGenerateKode(!autoGenerateKode)}
                className="whitespace-nowrap"
              >
                {autoGenerateKode ? "Manual" : "Auto"}
              </Button>
            </div>
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
          <div className="space-y-2">
            <Label>Kategori *</Label>
            <div className="flex flex-col gap-2">
              <FormField
                control={form.control}
                name="kategori"
                render={({ field }) => (
                  <FormItem>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                      {loadingCategories ? (
                      <SelectItem value="loading" disabled>
                      Memuat...
                      </SelectItem>
                      ) : categories.length === 0 ? (
                      <SelectItem value="empty" disabled>
                      Tidak ada kategori
                      </SelectItem>
                      ) : (
                      categories.map((category) => (
                      <SelectItem
                      key={category._id?.toString() || category.nama}
                      value={category._id?.toString() || category.nama}
                      >
                      {category.nama}
                      </SelectItem>
                      ))
                      )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Kategori baru"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewCategory}
                  disabled={addingCategory || !newCategoryName.trim()}
                >
                  {addingCategory ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Satuan */}
          <FormField
            control={form.control}
            name="satuan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Satuan *</FormLabel>
                <Select
                  onValueChange={(value) => {
                    if (value === "") return; // Prevent selecting empty value
                    field.onChange(value);
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih satuan" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                  <SelectItem value="placeholder" disabled>
                  Pilih satuan
                  </SelectItem>
                    {SATUAN_PRODUK.map((satuan) => (
                      <SelectItem key={satuan} value={satuan}>
                        {satuan}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Barcode */}
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Barcode</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Barcode produk (opsional)" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Berat */}
          <FormField
            control={form.control}
            name="berat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Berat ({weightUnit})</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    step="0.01"
                    placeholder={`Berat dalam ${weightUnit}`}
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? Number(e.target.value) : undefined
                      )
                    }
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
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="" disabled>
                    Pilih status
                  </SelectItem>
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
              form.getValues("kategori") === "" ||
              form.getValues("satuan") === "" ||
              form.getValues("nama") === "" ||
              form.getValues("kode") === ""
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
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            Batal
          </Button>
        </div>
      </form>
    </Form>
  );
}
