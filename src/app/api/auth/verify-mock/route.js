import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@bizflow.com",
    role: "admin",
  },
  {
    id: 2,
    name: "Staff User",
    email: "staff@bizflow.com",
    role: "staff",
  },
  {
    id: 3,
    name: "Manager User",
    email: "manager@bizflow.com",
    role: "manager",
  },
];

export async function GET(request) {
  try {
    console.log("Verify mock endpoint called");

    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      console.log("No token provided");
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token decoded:", decoded);

    // Find user in mock data
    const user = mockUsers.find((u) => u.id === decoded.userId);

    if (!user) {
      console.log("User not found in mock data");
      return NextResponse.json({ error: "User not found" }, { status: 401 });
    }

    console.log("Mock verify successful for:", user.email);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Mock verify error:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
