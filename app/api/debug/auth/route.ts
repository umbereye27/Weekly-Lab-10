import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken, extractTokenFromHeader } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("DEBUG API: Auth Test Route");

    // Extract all headers for debugging
    const headers = Object.fromEntries(request.headers.entries());

    // Get auth header specifically
    const authHeader = request.headers.get("authorization");
    const extractedToken = extractTokenFromHeader(request);

    // Get token from cookie
    const cookieToken = request.cookies.get("token")?.value;

    // Try to get user from token
    const user = getUserFromToken(request);

    // Check environment settings
    const isDevMode = process.env.NODE_ENV === "development";
    const bypassAuth = process.env.BYPASS_AUTH === "true";

    if (!user) {
      console.log("DEBUG API: No user found from token");
      return NextResponse.json(
        {
          error: "Unauthorized",
          debug: {
            hasAuthHeader: !!authHeader,
            headerToken: extractedToken
              ? `${extractedToken.substring(0, 15)}...`
              : null,
            cookieToken: cookieToken
              ? `${cookieToken.substring(0, 15)}...`
              : null,
            environment: {
              NODE_ENV: process.env.NODE_ENV,
              BYPASS_AUTH: process.env.BYPASS_AUTH,
            },
            authHeaderFormat: authHeader
              ? authHeader.startsWith("Bearer ")
                ? "correct"
                : "incorrect"
              : "missing",
            help: "Make sure your token is valid and properly formatted as 'Bearer YOUR_TOKEN'",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      message: "Authentication successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        tokenExpiry: new Date(user.exp * 1000).toISOString(),
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        BYPASS_AUTH: process.env.BYPASS_AUTH,
        isDevMode,
        bypassAuth,
      },
      token: {
        source: extractedToken
          ? "header"
          : cookieToken
          ? "cookie"
          : "development bypass",
        fromHeader: extractedToken
          ? `${extractedToken.substring(0, 15)}...`
          : null,
        fromCookie: cookieToken ? `${cookieToken.substring(0, 15)}...` : null,
      },
      postmanInstructions: {
        signin: "POST /api/auth/signin with body: { email, password }",
        tasks: "Use header 'Authorization: Bearer YOUR_TOKEN' for all requests",
        createTask:
          "POST /api/tasks with body: { title, description, skillId }",
      },
    });
  } catch (error) {
    console.error("DEBUG API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
