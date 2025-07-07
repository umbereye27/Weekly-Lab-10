import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export interface JWTPayload {
  id: string;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

export function extractTokenFromHeader(request: NextRequest): string | null {
  console.log("Extracting token from request headers");

  // Log all headers for debugging
  const headers = Object.fromEntries(request.headers.entries());
  console.log("All headers:", JSON.stringify(headers, null, 2));

  const authHeader = request.headers.get("authorization");
  console.log("Authorization header:", authHeader);

  if (!authHeader) {
    console.error("No authorization header found");
    return null;
  }

  if (!authHeader.startsWith("Bearer ")) {
    console.error("Authorization header does not start with 'Bearer '");
    return null;
  }

  const token = authHeader.substring(7).trim();
  console.log(
    "Extracted token (first 10 chars):",
    token.substring(0, 10) + "..."
  );
  return token;
}

export function generateToken(payload: any) {
  const secret = Buffer.from(process.env.NEXTAUTH_SECRET!, "base64");
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  try {
    // Check if secret is available
    if (!process.env.NEXTAUTH_SECRET) {
      console.error("CRITICAL ERROR: NEXTAUTH_SECRET is not defined");
      // In development, use a default secret to prevent crashes
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "Using default secret for development - DO NOT USE IN PRODUCTION"
        );
        const devSecret = "development_secret_key_do_not_use_in_production";
        const decoded = jwt.verify(token, devSecret) as JWTPayload;
        return decoded;
      }
      throw new Error("Server configuration error: Missing NEXTAUTH_SECRET");
    }

    // Properly handle secret
    let secret;
    try {
      // Try to use as base64
      secret = Buffer.from(process.env.NEXTAUTH_SECRET, "base64");
    } catch (e) {
      // Fallback to using raw string
      console.warn(
        "Failed to decode NEXTAUTH_SECRET as base64, using as raw string"
      );
      secret = process.env.NEXTAUTH_SECRET;
    }

    // Verify token
    console.log("Attempting to verify token...");
    const decoded = jwt.verify(token, secret) as JWTPayload;
    console.log("Token verified successfully, user:", decoded.email);
    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error("JWT verification error:", error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.error("Token has expired");
    } else {
      console.error("JWT verification error:", error);
    }
    throw error; // Throw the error so middleware can catch it
  }
}

export function getUserFromToken(request: NextRequest): JWTPayload | null {
  try {
    const token = extractTokenFromHeader(request);
    if (!token) {
      console.error("No token found in authorization header");
      return null;
    }

    console.log(
      "Token received (first 10 chars):",
      token.substring(0, 10) + "..."
    );
    return verifyToken(token);
  } catch (error) {
    console.error("Error in getUserFromToken:", error);
    return null;
  }
}
