import { NextResponse } from "next/server";

export default function middleware(request) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    const token = request.cookies.get("auth-token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // For edge runtime, we'll do basic token existence check
    // Real JWT verification will be done in the API routes
    try {
      // Simple check if token exists and has basic JWT structure
      if (token.split(".").length !== 3) {
        throw new Error("Invalid token format");
      }
      return NextResponse.next();
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
