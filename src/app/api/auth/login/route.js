import { sql } from "@/lib/neon";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    console.log("Login attempt started");

    const { email, password } = await request.json();
    console.log("Login data received:", {
      email: email ? "***" : "empty",
      password: password ? "***" : "empty",
    });

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email dan password harus diisi" },
        { status: 400 }
      );
    }

    // Check environment variables
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET not found in environment");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    console.log("Attempting database query...");
    // Find user by email in Neon PostgreSQL
    const users = await sql`
      SELECT id, email, password_hash as password, full_name as name, role, is_active
      FROM users 
      WHERE email = ${email.toLowerCase()} 
      AND is_active = true
      LIMIT 1
    `;

    console.log("Database query completed, users found:", users.length);

    if (users.length === 0) {
      console.log("No user found or inactive user");
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    const user = users[0];
    console.log("User found:", {
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password validation:", isPasswordValid ? "valid" : "invalid");

    if (!isPasswordValid) {
      console.log("Invalid password");
      return NextResponse.json(
        { error: "Email atau password salah" },
        { status: 401 }
      );
    }

    // Generate JWT token
    console.log("Generating JWT token...");
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    console.log("Login successful for user:", user.email);
    const response = NextResponse.json({
      message: "Login berhasil",
      user: userWithoutPassword,
      token,
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      { error: "Terjadi kesalahan server", details: error.message },
      { status: 500 }
    );
  }
}
