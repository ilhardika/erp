"use client";

import { useState, useEffect, useCallback } from "react";
import type { Product } from "../../lib/models/product";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CreatableSelect } from "@/components/ui/CreatableSelect";
import { ProductCreateInput } from "@/lib/models/product";
import { Category } from "@/lib/models/category";
import { UI_TEXT } from "@/lib/constants";
import { productSchema } from "@/lib/schemas";
// ...existing code...
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ProductFormData = {
  kode?: string;
  nama: string;
  kategori: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  stokMinimal: number;
  satuan: string;
  status?: "aktif" | "nonaktif";
  deskripsi?: string;
  barcode?: string;
  berat?: number;
  gambar?: string;
};

interface ProductFormProps {
  onSubmit: (data: ProductCreateInput) => Promise<void>;
  loading?: boolean;
  defaultValues?: Partial<ProductFormData>;
  onCategoryAdded?: () => void;
  onSatuanAdded?: () => void;
  onCancel?: () => void;
}

export function ProductForm({
  onSubmit,
  loading = false,
  defaultValues,
  onCategoryAdded,
  onSatuanAdded,
}: ProductFormProps) {
  const [satuans, setSatuans] = useState<{ _id: string; nama: string }[]>([]);
  const [loadingSatuans, setLoadingSatuans] = useState(true);
  const [addingSatuan, setAddingSatuan] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [addingCategory, setAddingCategory] = useState(false);

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      kode: defaultValues?.kode || undefined,
      nama: defaultValues?.nama || "",
      kategori: defaultValues?.kategori || "",
      hargaBeli: defaultValues?.hargaBeli || 0,
      hargaJual: defaultValues?.hargaJual || 0,
      stok: defaultValues?.stok || 0,
      stokMinimal: defaultValues?.stokMinimal || 1,
      satuan: defaultValues?.satuan || "",
      status: defaultValues?.status ?? "aktif",
      deskripsi: defaultValues?.deskripsi || "",
      barcode: defaultValues?.barcode || "",
      berat: defaultValues?.berat || undefined,
      gambar: defaultValues?.gambar || "",
    } as ProductFormData,
    mode: "onChange",
  });

  const fetchSatuans = useCallback(async () => {
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
  }, []);

  const fetchAllProducts = useCallback(async () => {
    try {
      const response = await fetch("/api/products");
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.products || []);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchSatuans();
    fetchAllProducts();
  }, [fetchCategories, fetchSatuans, fetchAllProducts]);

  const handleCreateCategory = useCallback(
    async (name: string) => {
      setAddingCategory(true);
      try {
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama: name }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal menambah kategori");
        }
        await fetchCategories();
        if (onCategoryAdded) onCategoryAdded();
      } catch (error) {
        console.error("Error creating category:", error);
        alert(
          error instanceof Error ? error.message : "Gagal menambah kategori"
        );
      } finally {
        setAddingCategory(false);
      }
    },
    [fetchCategories, onCategoryAdded]
  );

  const handleDeleteCategory = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/categories/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal menghapus kategori");
        }
        await fetchCategories();
        form.setValue("kategori", ""); // Clear selected category if deleted
      } catch (error) {
        console.error("Error deleting category:", error);
        alert(
          error instanceof Error ? error.message : "Gagal menghapus kategori"
        );
      }
    },
    [fetchCategories, form]
  );

  const isCategoryInUse = useCallback(
    (id: string) => {
      return allProducts.some((p) => p.kategori === id);
    },
    [allProducts]
  );

  const handleCreateSatuan = useCallback(
    async (name: string) => {
      setAddingSatuan(true);
      try {
        const response = await fetch("/api/satuans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nama: name }),
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal menambah satuan");
        }
        await fetchSatuans();
        if (onSatuanAdded) onSatuanAdded();
      } catch (error) {
        console.error("Error creating satuan:", error);
        alert(error instanceof Error ? error.message : "Gagal menambah satuan");
      } finally {
        setAddingSatuan(false);
      }
    },
    [fetchSatuans, onSatuanAdded]
  );

  const handleDeleteSatuan = useCallback(
    async (id: string) => {
      try {
        const response = await fetch(`/api/satuans/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Gagal menghapus satuan");
        }
        await fetchSatuans();
        form.setValue("satuan", ""); // Clear selected satuan if deleted
      } catch (error) {
        console.error("Error deleting satuan:", error);
        alert(
          error instanceof Error ? error.message : "Gagal menghapus satuan"
        );
      }
    },
    [fetchSatuans, form]
  );

  const isSatuanInUse = useCallback(
    (id: string) => {
      return allProducts.some((p) => p.satuan === id);
    },
    [allProducts]
  );

  const generateKode = useCallback(async () => {
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
  }, [form]);

  const handleSubmit = useCallback(
    async (data: ProductFormData) => {
      try {
        let kode = data.kode;
        if (!kode) {
          kode = await generateKode();
        }
        await onSubmit({
          ...data,
          kode: kode || "",
        });
      } catch (error) {
        console.error("Submit error:", error);
      }
    },
    [onSubmit, generateKode]
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="kode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI_TEXT.PRODUCT_SKU_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={UI_TEXT.PRODUCT_SKU_PLACEHOLDER}
                  />
                </FormControl>
                {/* Tidak perlu validasi error untuk field kosong */}
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nama"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI_TEXT.PRODUCT_NAME_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={UI_TEXT.PRODUCT_NAME_PLACEHOLDER}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="deskripsi"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{UI_TEXT.PRODUCT_DESCRIPTION_LABEL}</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  placeholder={`${UI_TEXT.PRODUCT_DESCRIPTION_PLACEHOLDER} ${UI_TEXT.OPTIONAL}`}
                  className="resize-none"
                  rows={2}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CreatableSelect<ProductFormData>
            control={form.control}
            name="kategori"
            label={UI_TEXT.CATEGORY_LABEL}
            placeholder={UI_TEXT.CATEGORY_PLACEHOLDER}
            items={categories.map((cat) => ({
              _id: String(cat._id ?? ""),
              nama: cat.nama,
            }))}
            loading={loadingCategories}
            adding={addingCategory}
            onItemCreate={handleCreateCategory}
            onItemDelete={handleDeleteCategory}
            isItemInUse={isCategoryInUse}
            newItemPlaceholder={UI_TEXT.CATEGORY_NEW_PLACEHOLDER}
          />
          <CreatableSelect<ProductFormData>
            control={form.control}
            name="satuan"
            label={UI_TEXT.SATUAN_LABEL}
            placeholder={UI_TEXT.SATUAN_PLACEHOLDER}
            items={satuans.map((sat) => ({
              _id: String(sat._id ?? ""),
              nama: sat.nama,
            }))}
            loading={loadingSatuans}
            adding={addingSatuan}
            onItemCreate={handleCreateSatuan}
            onItemDelete={handleDeleteSatuan}
            isItemInUse={isSatuanInUse}
            newItemPlaceholder={UI_TEXT.SATUAN_NEW_PLACEHOLDER}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="hargaBeli"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI_TEXT.PRODUCT_BUY_PRICE_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={UI_TEXT.PRODUCT_PRICE_PLACEHOLDER}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="hargaJual"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI_TEXT.PRODUCT_SELL_PRICE_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={UI_TEXT.PRODUCT_PRICE_PLACEHOLDER}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="stok"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI_TEXT.PRODUCT_STOCK_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={UI_TEXT.PRODUCT_STOCK_PLACEHOLDER}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stokMinimal"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI_TEXT.PRODUCT_MIN_STOCK_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    placeholder={UI_TEXT.PRODUCT_MIN_STOCK_PLACEHOLDER}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="barcode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{UI_TEXT.PRODUCT_BARCODE_LABEL}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder={
                      UI_TEXT.PRODUCT_BARCODE_PLACEHOLDER +
                      " " +
                      UI_TEXT.OPTIONAL
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{UI_TEXT.PRODUCT_STATUS_LABEL}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Pilih status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="aktif">
                    {UI_TEXT.PRODUCT_STATUS_ACTIVE}
                  </SelectItem>
                  <SelectItem value="nonaktif">
                    {UI_TEXT.PRODUCT_STATUS_INACTIVE}
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button type="submit" disabled={loading} className="w-full sm:w-auto">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {UI_TEXT.SAVING}
              </>
            ) : (
              UI_TEXT.SAVE_PRODUCT
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
