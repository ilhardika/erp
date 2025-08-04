import { MongoClient } from "mongodb";

async function deleteAllData() {
  const uri =
    "mongodb+srv://ilhamhardika48:XVZZqUHZ1b3HoDCx@cluster-erp.pz7qsmu.mongodb.net/bizflow?authSource=admin&retryWrites=true&w=majority&appName=bizflow";
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db("bizflow");
    const collections = await db.listCollections().toArray();
    for (const col of collections) {
      await db.collection(col.name).deleteMany({});
      console.log(`Deleted all documents from collection: ${col.name}`);
    }
    console.log("✅ Semua data di MongoDB Atlas sudah dihapus!");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

deleteAllData();
