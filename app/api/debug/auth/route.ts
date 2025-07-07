import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/jwt";

export async function GET(request: NextRequest) {
  try {
    console.log("DEBUG API: Auth Test Route");
    
    // Log all headers for debugging
    const headers = Object.fromEntries(request.headers.entries());
    console.log("All request headers:", JSON.stringify(headers, null, 2));
    
    // Try to get user from token
    const user = getUserFromToken(request);
    
    if (!user) {
      console.log("DEBUG API: No user found from token");
      return NextResponse.json(
        { 
          error: "Unauthorized",
          debug: { 
            hasAuthHeader: !!request.headers.get("authorization"),
            headers: headers 
          }
        }, 
        { status: 401 }
      );
    }
    
    console.log("DEBUG API: User authenticated successfully:", user.email);
    
    return NextResponse.json({
      message: "Authentication successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error("DEBUG API error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
