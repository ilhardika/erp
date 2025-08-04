import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const token = request.cookies.get("auth-token")?.value;
    console.log("Verify API: Token exists:", !!token);

    if (!token) {
      console.log("Verify API: No token found");
      return NextResponse.json(
        { error: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Verify API: Token decoded successfully for:", decoded.email);

    const client = await clientPromise;
    const db = client.db("erp");

    // Get fresh user data
    const user = await db.collection("users").findOne(
      {
        _id: new ObjectId(decoded.userId),
        active: true,
      },
      {
        projection: { password: 0 }, // Exclude password
      }
    );

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user,
      isAuthenticated: true,
    });
  } catch (error) {
    console.error("Auth verification error:", error);
    return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
  }
}
