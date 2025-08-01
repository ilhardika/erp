"use server";

import getDb from "@/lib/mongodb";
import { Satuan, SATUAN_COLLECTION } from "@/lib/models/satuan";
import { ObjectId } from "mongodb";

export async function getSatuans(userId: string) {
  const client = await getDb;
  const db = client.db("Bizflow");
  return db
    .collection<Satuan>(SATUAN_COLLECTION)
    .find({ status: "aktif", createdBy: userId })
    .toArray();
}

export async function addSatuan(nama: string, userId: string) {
  const client = await getDb;
  const db = client.db("Bizflow");
  const satuan: Satuan = { nama, status: "aktif", createdBy: userId };
  const result = await db
    .collection<Satuan>(SATUAN_COLLECTION)
    .insertOne(satuan);
  return { ...satuan, _id: result.insertedId };
}

export async function deleteSatuan(id: string) {
  const client = await getDb;
  const db = client.db("Bizflow");
  return db
    .collection<Satuan>(SATUAN_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });
}

// API Actions (for client-side calls)
export async function createSatuanApi(name: string) {
  const response = await fetch("/api/satuans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ nama: name }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Gagal menambah satuan");
  }
  return response.json();
}

export async function deleteSatuanApi(id: string) {
  const response = await fetch(`/api/satuans/${id}`, { method: "DELETE" });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Gagal menghapus satuan");
  }
  return response.json();
}
