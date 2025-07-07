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
  // console.log("All headers:", JSON.stringify(headers, null, 2));

  const authHeader = request.headers.get("authorization");
  // console.log("Cookie header:", request.headers.get("cookie"));
  const newToken = request.cookies.get("token")?.value;
  console.log("New token: ", newToken);
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
  // console.log(
  //   "Extracted token (first 10 chars):",
  //   token.substring(0, 10) + "..."
  // );
  return token;
}

export function generateToken(payload: any) {
  try {
    // Remove quotes if they exist in the secret (from .env file)
    const rawSecret = process.env.NEXTAUTH_SECRET || "";
    const secret = rawSecret.replace(/"/g, "").trim();

    console.log("Generating token with payload:", {
      ...payload,
      password: "[REDACTED]",
    });
    console.log("Secret first 5 chars:", secret.substring(0, 5) + "...");

    return jwt.sign(payload, secret, { expiresIn: "7d" });
  } catch (error) {
    console.error("Error generating token:", error);
    throw error;
  }
}

export function verifyToken(token: string) {
  try {
    // Remove quotes if they exist in the secret (from .env file)
    const rawSecret = process.env.NEXTAUTH_SECRET || "";
    const secret = rawSecret.replace(/"/g, "").trim();

    console.log("Verifying token (first 10):", token.substring(0, 10) + "...");
    console.log("Secret first 5 chars:", secret.substring(0, 5) + "...");

    const decoded = jwt.verify(token, secret) as JWTPayload;
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
    // Try to get the token from headers or cookies
    const token =
      extractTokenFromHeader(request) ||
      request.cookies.get("token")?.value?.trim();

    // Development bypass if enabled
    if (
      process.env.BYPASS_AUTH === "true" &&
      process.env.NODE_ENV === "development"
    ) {
      console.log("⚠️ Auth bypass enabled - using mock user");
      return {
        id: "mock-user-id",
        email: "dev@example.com",
        name: "Development User",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
      };
    }

    if (!token) {
      console.error("No token found in request");
      return null;
    }

    try {
      const verifiedToken = verifyToken(token);
      return verifiedToken;
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return null;
    }
  } catch (error) {
    console.error("Error in getUserFromToken:", error);
    return null;
  }
}
