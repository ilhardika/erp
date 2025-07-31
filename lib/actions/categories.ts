import clientPromise from "@/lib/mongodb";
import {
  Category,
  CategoryCreateInput,
  CategoryUpdateInput,
} from "@/lib/models/category";
import { ObjectId } from "mongodb";

export async function createCategory(
  data: CategoryCreateInput,
  userId: string
): Promise<Category> {
  const client = await clientPromise;
  const db = client.db("bizflow");
  const collection = db.collection<Category>("categories");

  // Cek apakah nama sudah ada untuk user ini
  const existingCategory = await collection.findOne({
    nama: { $regex: new RegExp(`^${data.nama}$`, "i") },
    createdBy: userId,
  });
  if (existingCategory) {
    throw new Error("Nama kategori sudah digunakan oleh Anda");
  }

  const category: Omit<Category, "_id"> = {
    ...data,
    status: data.status || "aktif",
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: userId,
  };

  const result = await collection.insertOne(category);

  return {
    ...category,
    _id: result.insertedId,
  };
}

// removed duplicate declaration
export async function getCategories(
  userId: string,
  status?: string
): Promise<Category[]> {
  const client = await clientPromise;
  const db = client.db("bizflow");
  const collection = db.collection<Category>("categories");

  const filter: Record<string, unknown> = { createdBy: userId };
  if (status) {
    filter.status = status;
  }

  return await collection.find(filter).sort({ nama: 1 }).toArray();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const client = await clientPromise;
  const db = client.db("bizflow");
  const collection = db.collection<Category>("categories");

  return await collection.findOne({ _id: new ObjectId(id) });
}

export async function updateCategory(
  id: string,
  data: CategoryUpdateInput
): Promise<Category | null> {
  const client = await clientPromise;
  const db = client.db("bizflow");
  const collection = db.collection<Category>("categories");

  // Cek apakah nama sudah ada (kecuali untuk kategori yang sedang diedit)
  if (data.nama) {
    const existingCategory = await collection.findOne({
      nama: { $regex: new RegExp(`^${data.nama}$`, "i") },
      _id: { $ne: new ObjectId(id) },
    });
    if (existingCategory) {
      throw new Error("Nama kategori sudah digunakan");
    }
  }

  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(id) },
    { $set: updateData },
    { returnDocument: "after" }
  );

  return result || null;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db("bizflow");

  // Cek apakah kategori masih digunakan oleh produk
  const productsCollection = db.collection("products");
  const categoryInUse = await productsCollection.findOne({ kategori: id });

  if (categoryInUse) {
    throw new Error(
      "Kategori tidak dapat dihapus karena masih digunakan oleh produk"
    );
  }

  const categoriesCollection = db.collection<Category>("categories");
  const result = await categoriesCollection.deleteOne({
    _id: new ObjectId(id),
  });
  return result.deletedCount > 0;
}
