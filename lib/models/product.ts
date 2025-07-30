import { ObjectId } from "mongodb";

export interface Product {
  _id?: ObjectId;
  kode: string;
  nama: string;
  deskripsi?: string;
  kategori: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  stokMinimal: number;
  satuan: string;
  barcode?: string;
  gambar?: string;
  status: "aktif" | "nonaktif";
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface ProductCreateInput {
  kode: string;
  nama: string;
  deskripsi?: string;
  kategori: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  stokMinimal: number;
  satuan: string;
  barcode?: string;
  gambar?: string;
  status?: "aktif" | "nonaktif";
}

export interface ProductUpdateInput {
  nama?: string;
  deskripsi?: string;
  kategori?: string;
  hargaBeli?: number;
  hargaJual?: number;
  stok?: number;
  stokMinimal?: number;
  satuan?: string;
  barcode?: string;
  gambar?: string;
  status?: "aktif" | "nonaktif";
}

// Kategori produk yang tersedia
export const KATEGORI_PRODUK = [
  "Makanan",
  "Minuman",
  "Elektronik",
  "Pakaian",
  "Kesehatan",
  "Kecantikan",
  "Rumah Tangga",
  "Olahraga",
  "Buku & Alat Tulis",
  "Lainnya",
] as const;

// Satuan produk yang tersedia
export const SATUAN_PRODUK = [
  "pcs",
  "kg",
  "gram",
  "liter",
  "ml",
  "meter",
  "cm",
  "box",
  "pack",
  "lusin",
] as const;

export type KategoriProduk = (typeof KATEGORI_PRODUK)[number];
export type SatuanProduk = (typeof SATUAN_PRODUK)[number];
