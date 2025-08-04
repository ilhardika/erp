import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("Please add your Neon DATABASE_URL to .env.local");
}

// Create connection function
export const sql = neon(process.env.DATABASE_URL);
