import { sql } from "@/lib/neon";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const cookieToken = request.cookies.get("auth-token")?.value;

    const token = authHeader?.replace("Bearer ", "") || cookieToken;

    if (!token) {
      return NextResponse.json(
        { error: "Token tidak ditemukan" },
        { status: 401 }
      );
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user data from Neon PostgreSQL
    const users = await sql`
      SELECT id, email, name, role, status, created_at, updated_at 
      FROM users 
      WHERE id = ${decoded.userId} 
      AND status = 'active'
      LIMIT 1
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { error: "User tidak ditemukan atau tidak aktif" },
        { status: 401 }
      );
    }

    const user = users[0];

    return NextResponse.json({
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        status: user.status,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (error) {
    console.error("Token verification error:", error);

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json({ error: "Token tidak valid" }, { status: 401 });
    }

    if (error.name === "TokenExpiredError") {
      return NextResponse.json(
        { error: "Token sudah kadaluarsa" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
