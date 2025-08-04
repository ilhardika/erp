import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("erp");

    // Get all users without passwords
    const users = await db
      .collection("users")
      .find(
        {},
        {
          projection: { password: 0 },
        }
      )
      .toArray();

    return NextResponse.json({
      users: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error getting users:", error);
    return NextResponse.json(
      { error: "Failed to get users", details: error.message },
      { status: 500 }
    );
  }
}
