"use server";

import getDb from "@/lib/mongodb";
import { Satuan, SATUAN_COLLECTION } from "@/lib/models/satuan";
import { ObjectId } from "mongodb";

export async function getSatuans(userId: string) {
  const client = await getDb;
  const db = client.db("bizflow");
  return db
    .collection<Satuan>(SATUAN_COLLECTION)
    .find({ status: "aktif", createdBy: userId })
    .toArray();
}

export async function addSatuan(nama: string, userId: string) {
  const client = await getDb;
  const db = client.db("bizflow");
  const satuan: Satuan = { nama, status: "aktif", createdBy: userId };
  const result = await db
    .collection<Satuan>(SATUAN_COLLECTION)
    .insertOne(satuan);
  return { ...satuan, _id: result.insertedId };
}

export async function deleteSatuan(id: string) {
  const client = await getDb;
  const db = client.db("bizflow");
  return db
    .collection<Satuan>(SATUAN_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });
}
