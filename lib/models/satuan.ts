import { ObjectId } from "mongodb";

export interface Satuan {
  _id?: ObjectId | string;
  nama: string;
  status?: "aktif" | "nonaktif";
}

export const SATUAN_COLLECTION = "satuans";
