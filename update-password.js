import { MongoClient } from "mongodb";
import bcrypt from "bcryptjs";

async function updateUserPassword() {
  const uri =
    "mongodb+srv://ilhamhardika48:XVZZqUHZ1b3HoDCx@cluster-erp.pz7qsmu.mongodb.net/bizflow?authSource=admin&retryWrites=true&w=majority&appName=bizflow";
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB Atlas");

    const db = client.db("bizflow");
    const users = db.collection("users");

    // Hash new password
    const newPassword = "demo123";
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update demo@example.com password
    const result = await users.updateOne(
      { email: "demo@example.com" },
      { $set: { password: hashedPassword } }
    );

    if (result.matchedCount > 0) {
      console.log(`✅ Password updated for demo@example.com`);
      console.log(`🔑 New password: ${newPassword}`);
    } else {
      console.log("❌ User demo@example.com not found");
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.close();
  }
}

updateUserPassword();
