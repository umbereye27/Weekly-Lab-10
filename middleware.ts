import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "./lib/jwt";

// Log request details for debugging
function logRequestDetails(request: NextRequest) {
  console.log("Request URL:", request.nextUrl.pathname);
  console.log("Headers:", Object.fromEntries(request.headers.entries()));
  console.log("Method:", request.method);
}

// This is the required middleware function for Next.js
export function middleware(request: NextRequest) {
  // Debug logging
  console.log("\n--- Middleware Executed ---");
  // logRequestDetails(request);

  // DEVELOPMENT BYPASS - REMOVE IN PRODUCTION
  // Allow all requests in development to troubleshoot other issues
  if (
    process.env.NODE_ENV === "development" &&
    process.env.BYPASS_AUTH === "true"
  ) {
    console.log(
      "⚠️ AUTH BYPASS ENABLED - All requests allowed in development mode"
    );
    return NextResponse.next();
  }

  // Paths that don't require authentication
  const publicPaths = [
    "/",
    "/auth/signin",
    "/auth/signup",
    "/api/auth/signin",
    "/api/auth/signup",
  ];

  // Debug paths (allowed in development)
  const debugPaths = ["/api/debug/", "/debug/"];

  // Allow debug paths in development mode
  const isDebugPath =
    process.env.NODE_ENV === "development" &&
    debugPaths.some((path) => request.nextUrl.pathname.startsWith(path));

  if (isDebugPath) {
    console.log("Debug path accessed:", request.nextUrl.pathname);
    return NextResponse.next();
  }

  // Check if the path is in the public paths
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname === path ||
      request.nextUrl.pathname.startsWith("/api/auth/")
  );

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from the authorization header (which will be set by the client)
  const authHeader = request.headers.get("authorization");

  // const token = authHeader?.startsWith("Bearer ")
  //   ? authHeader.substring(7)
  //   : null;
  const token = request.cookies.get("token")?.value;

  if (token) {
    console.log("Token found in cookie: ", token);
    console.log(
      "Token from header (first 10 chars):",
      token.substring(0, 10) + "..."
    );
  } else {
    console.log("No valid token found in authorization header");
  }

  // If no token and trying to access protected route, redirect to login
  if (!token) {
    // For API routes, return 401
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // For page routes, redirect to login
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  try {
    // Verify the token (this will throw if invalid)
    verifyToken(token);
    return NextResponse.next();
  } catch (error) {
    // If token verification fails
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }
}

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    // Only run middleware on API routes (except auth routes)
    "/api/((?!auth).+)",
  ],
};
