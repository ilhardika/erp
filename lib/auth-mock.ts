import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { findMockUser } from "./mock-data";

// Mock auth options for testing when MongoDB is not available
export const mockAuthOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("=== MOCK AUTH AUTHORIZE START ===");
        console.log("Received credentials:", {
          email: credentials?.email,
          passwordProvided: !!credentials?.password,
        });

        if (!credentials?.email || !credentials?.password) {
          console.error("Missing email or password");
          return null;
        }

        try {
          console.log(
            "Looking for mock user with email:",
            credentials.email.toLowerCase()
          );

          const user = findMockUser(credentials.email);

          if (!user) {
            console.error("Mock user not found for email:", credentials.email);
            return null;
          }

          console.log("Mock user found:", {
            id: user._id,
            email: user.email,
            name: user.name,
            role: user.role,
          });

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.error("Invalid password for email:", credentials.email);
            return null;
          }

          console.log("Mock login success for email:", credentials.email);
          const returnUser = {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role,
          };
          console.log("Returning mock user object:", returnUser);
          console.log("=== MOCK AUTH AUTHORIZE SUCCESS ===");
          return returnUser;
        } catch (error) {
          console.error("=== MOCK AUTH ERROR ===");
          console.error("Mock auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      console.log("Mock JWT callback:", {
        user: user ? "present" : "null",
        token: token ? "present" : "null",
      });
      if (user) {
        token.role = user.role;
        console.log("Added role to token:", user.role);
      }
      return token;
    },
    async session({ session, token }) {
      console.log("Mock Session callback:", {
        session: session ? "present" : "null",
        token: token ? "present" : "null",
      });
      if (token) {
        session.user.id = token.sub!;
        session.user.role = token.role as string;
        console.log("Mock Session user:", {
          id: session.user.id,
          role: session.user.role,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};
