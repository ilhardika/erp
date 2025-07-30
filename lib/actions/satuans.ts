import getDb from "@/lib/mongodb";
import { Satuan, SATUAN_COLLECTION } from "@/lib/models/satuan";
import { ObjectId } from "mongodb";

export async function getSatuans() {
  const client = await getDb;
  const db = client.db();
  return db
    .collection<Satuan>(SATUAN_COLLECTION)
    .find({ status: "aktif" })
    .toArray();
}

export async function addSatuan(nama: string) {
  const client = await getDb;
  const db = client.db();
  const satuan: Satuan = { nama, status: "aktif" };
  const result = await db
    .collection<Satuan>(SATUAN_COLLECTION)
    .insertOne(satuan);
  return { ...satuan, _id: result.insertedId };
}

export async function deleteSatuan(id: string) {
  const client = await getDb;
  const db = client.db();
  return db
    .collection<Satuan>(SATUAN_COLLECTION)
    .deleteOne({ _id: new ObjectId(id) });
}
