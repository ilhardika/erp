import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Mock users data - same as what we would have in database
const mockUsers = [
  {
    id: "1",
    name: "Admin User",
    email: "admin@bizflow.com",
    password: "$2b$10$GIgGvz3TTMiU4NEvc3FnuuLs1/XaoT9gl0I.dvVpynXsxi47f8NJS", // password123
    role: "admin",
  },
  {
    id: "2",
    name: "Manager User",
    email: "manager@bizflow.com",
    password: "$2b$10$GIgGvz3TTMiU4NEvc3FnuuLs1/XaoT9gl0I.dvVpynXsxi47f8NJS", // password123
    role: "manager",
  },
  {
    id: "3",
    name: "Staff User",
    email: "staff@bizflow.com",
    password: "$2b$10$GIgGvz3TTMiU4NEvc3FnuuLs1/XaoT9gl0I.dvVpynXsxi47f8NJS", // password123
    role: "staff",
  },
  // Keep the old test.com emails for backward compatibility
  {
    id: "4",
    name: "Admin User (Test)",
    email: "admin@test.com",
    password: "$2b$10$GIgGvz3TTMiU4NEvc3FnuuLs1/XaoT9gl0I.dvVpynXsxi47f8NJS", // password123
    role: "admin",
  },
];

export async function POST(request) {
  try {
    const { email, password } = await request.json();

    console.log("Login attempt:", { email, passwordLength: password?.length });

    if (!email || !password) {
      console.log("Missing email or password");
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user in mock data
    const user = mockUsers.find((u) => u.email === email);

    console.log("User found:", !!user);

    if (!user) {
      console.log("User not found for email:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      console.log("Password mismatch for user:", email);
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Login successful",
    });

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    console.log("Mock login successful for:", email);
    return response;
  } catch (error) {
    console.error("Mock login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
