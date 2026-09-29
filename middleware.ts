import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    // Admin routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

    // Mentor routes
    if (pathname.startsWith("/mentor") && role !== "MENTOR") {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

    // Student routes
    if (pathname.startsWith("/student") && role !== "STUDENT") {
      return NextResponse.redirect(
        new URL("/login", req.url)
      );
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/portal/:path*",
    "/admin/:path*",
    "/mentor/:path*",
    "/student/:path*",
  ],
};