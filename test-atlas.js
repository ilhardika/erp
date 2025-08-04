import { MongoClient } from "mongodb";

async function testAtlasConnection() {
  const uri =
    "mongodb+srv://ilhamhardika48:XVZZqUHZ1b3HoDCx@cluster-erp.pz7qsmu.mongodb.net/bizflow";
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000, // 10 second timeout
    connectTimeoutMS: 10000,
    maxPoolSize: 10,
    retryWrites: true,
    w: "majority",
  });

  try {
    console.log("Testing MongoDB Atlas connection...");
    await client.connect();
    console.log("✅ Successfully connected to MongoDB Atlas");

    const db = client.db("bizflow");
    const users = db.collection("users");

    // Test reading users
    const userCount = await users.countDocuments();
    console.log(`📊 Found ${userCount} users in Atlas database`);

    // List some users
    const sampleUsers = await users.find({}).limit(3).toArray();
    console.log(
      "👥 Sample users:",
      sampleUsers.map((u) => ({ email: u.email, name: u.name }))
    );
  } catch (error) {
    console.error("❌ MongoDB Atlas connection failed:");
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    if (error.code === "ESERVFAIL" || error.message.includes("ESERVFAIL")) {
      console.log("\n🔧 DNS Resolution Issue Detected:");
      console.log("1. Try flushing DNS cache: ipconfig /flushdns");
      console.log("2. Try using Google DNS: 8.8.8.8, 8.8.4.4");
      console.log("3. Check if firewall blocking MongoDB Atlas");
      console.log("4. Try connecting from different network");
    }
  } finally {
    await client.close();
  }
}

testAtlasConnection();
