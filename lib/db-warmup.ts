import clientPromise from "./mongodb";

let isConnected = false;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function connectDB(retries = 3) {
  if (isConnected) {
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(
        `Attempting MongoDB connection (attempt ${attempt}/${retries})...`
      );
      const client = await clientPromise;

      // Test the connection with timeout
      const pingPromise = client.db("bizflow").admin().ping();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      );

      await Promise.race([pingPromise, timeoutPromise]);

      isConnected = true;
      console.log("MongoDB connection established and warmed up");
      return;
    } catch (error) {
      console.error(`MongoDB connection attempt ${attempt} failed:`, error);

      if (attempt < retries) {
        const delay = attempt * 2000; // Progressive delay: 2s, 4s, 6s
        console.log(`Retrying in ${delay}ms...`);
        await sleep(delay);
      } else {
        console.error("All MongoDB connection attempts failed");
        throw error;
      }
    }
  }
}

// Auto-warmup in development with retry
if (process.env.NODE_ENV === "development") {
  connectDB().catch((error) => {
    console.error("Failed to warm up MongoDB connection on startup:", error);
  });
}
