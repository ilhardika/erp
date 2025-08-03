import { z } from "zod";

export const categoryCreateSchema = z.object({
  nama: z.string().min(1, "Nama kategori wajib diisi"),
  deskripsi: z.string().optional(),
  status: z.enum(["aktif", "nonaktif"]).default("aktif"),
});

export const satuanCreateSchema = z.object({
  nama: z.string().min(1, "Nama satuan wajib diisi"),
});

export const productSchema = z.object({
  kode: z.string().optional(),
  nama: z.string().min(1, "Nama produk wajib diisi"),
  kategori: z.string().min(1, "Kategori wajib diisi"),
  hargaBeli: z.number().min(0, "Harga beli tidak boleh negatif"),
  hargaJual: z.number().min(0, "Harga jual tidak boleh negatif"),
  stok: z.number().min(0, "Stok tidak boleh negatif"),
  stokMinimal: z.number().min(0, "Stok minimal tidak boleh negatif"),
  satuan: z.string().min(1, "Satuan wajib diisi"),
  status: z.enum(["aktif", "nonaktif"]).default("aktif"),
  deskripsi: z.string().optional(),
  barcode: z.string().optional(),
  berat: z.number().optional(),
  gambar: z.string().optional(),
});
