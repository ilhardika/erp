import { signIn } from "next-auth/react";

// Test function to debug login
export async function testLogin() {
  console.log("Testing login with admin@test.com");

  try {
    const result = await signIn("credentials", {
      email: "admin@test.com",
      password: "admin123",
      redirect: false,
    });

    console.log("Login result:", result);
    return result;
  } catch (error) {
    console.error("Login error:", error);
    return null;
  }
}
