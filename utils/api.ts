import { NextResponse } from "next/server";

export const ApiResponse = {
  unauthorized() {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  },

  notFound(message = "Resource not found") {
    return NextResponse.json({ error: message }, { status: 404 });
  },

  badRequest(message: string) {
    return NextResponse.json({ error: message }, { status: 400 });
  },

  serverError(error: unknown) {
    // console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  },

  success(data: any, status = 200) {
    return NextResponse.json(data, { status });
  },
};

export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  if (!token) {
    // console.error("No token found in localStorage");
    throw new Error("No authentication token found");
  }

  const defaultOptions: RequestInit = {
    headers: {
      Authorization: `Bearer ${token.trim()}`,
      "Content-Type": "application/json",
    },
    credentials: "include",
    ...options,
  };

  const response = await fetch(url, defaultOptions);
  // console.log(`Response status: ${response.status} ${response.statusText}`);
  if (response.status === 401) {
    console.error("Authentication failed - token may be expired or invalid");
    localStorage.removeItem("token");
    throw new Error("Your session has expired. Please sign in again.");
  }

  if (!response.ok) {
    const errorText = await response.text();
    // console.error(`API error (${response.status}): ${errorText}`);
    throw new Error(
      `API request failed: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
};
