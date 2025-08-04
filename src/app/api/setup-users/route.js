import clientPromise from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("Setting up database users...");

    const client = await clientPromise;
    const db = client.db("erp");

    // Check if users already exist
    const existingUsersCount = await db.collection("users").countDocuments();
    console.log("Existing users count:", existingUsersCount);

    if (existingUsersCount > 0) {
      return NextResponse.json({
        message: "Users already exist in database",
        count: existingUsersCount,
      });
    }

    // Hash password for all users
    const hashedPassword = await bcrypt.hash("password123", 12);

    const users = [
      {
        name: "Admin User",
        email: "admin@bizflow.com",
        password: hashedPassword,
        role: "admin",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Manager User",
        email: "manager@bizflow.com",
        password: hashedPassword,
        role: "manager",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Staff User",
        email: "staff@bizflow.com",
        password: hashedPassword,
        role: "staff",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: "Admin Test",
        email: "admin@test.com",
        password: hashedPassword,
        role: "admin",
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    console.log("Inserting users into database...");
    const result = await db.collection("users").insertMany(users);
    console.log("Users inserted successfully:", result.insertedCount);

    return NextResponse.json({
      message: "Database setup completed successfully",
      usersCreated: result.insertedCount,
      users: users.map((user) => ({
        name: user.name,
        email: user.email,
        role: user.role,
      })),
    });
  } catch (error) {
    console.error("Database setup error:", error);
    return NextResponse.json(
      { error: "Database setup failed", details: error.message },
      { status: 500 }
    );
  }
}
