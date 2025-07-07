"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchWithAuth } from "@/utils/api";

export default function AuthDebugPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [authResponse, setAuthResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get token from localStorage and parse it
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        // Decode the JWT token (without verification)
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setTokenInfo({
            token: token.substring(0, 15) + "...",
            payload,
            expiresAt: new Date(payload.exp * 1000).toLocaleString(),
            isExpired: Date.now() > payload.exp * 1000,
          });
        }
      } catch (error) {
        setError("Failed to parse token");
        console.error(error);
      }
    }
  }, []);

  const testAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      // Test the debug API endpoint
      const response = await fetchWithAuth("/api/debug/auth");
      setAuthResponse(response);
    } catch (error) {
      setError(error instanceof Error ? error.message : String(error));
      console.error("Auth test error:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetToken = () => {
    localStorage.removeItem("token");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Authentication Debug
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Token Information</CardTitle>
          </CardHeader>
          <CardContent>
            {tokenInfo ? (
              <div className="space-y-4 text-white">
                <div>
                  <p className="text-slate-400 mb-1">Token (Partial):</p>
                  <p className="font-mono text-sm break-all">
                    {tokenInfo.token}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">User ID:</p>
                  <p>{tokenInfo.payload.id}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Email:</p>
                  <p>{tokenInfo.payload.email}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Name:</p>
                  <p>{tokenInfo.payload.name}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Expires At:</p>
                  <p
                    className={
                      tokenInfo.isExpired ? "text-red-400" : "text-green-400"
                    }
                  >
                    {tokenInfo.expiresAt}
                    {tokenInfo.isExpired ? " (EXPIRED)" : " (Valid)"}
                  </p>
                </div>
                <Button
                  onClick={resetToken}
                  className="bg-red-600 hover:bg-red-700 mt-4"
                >
                  Clear Token
                </Button>
              </div>
            ) : (
              <div className="text-red-400">No token found in localStorage</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Authentication Test</CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={testAuth}
              className="bg-indigo-600 hover:bg-indigo-700 mb-6"
              disabled={loading}
            >
              {loading ? "Testing..." : "Test Authentication"}
            </Button>

            {error && (
              <div className="p-4 bg-red-900/30 border border-red-600 rounded-md text-red-400 mb-4">
                {error}
              </div>
            )}

            {authResponse && (
              <div className="p-4 bg-green-900/30 border border-green-600 rounded-md text-green-400">
                <p className="font-medium mb-2">Authentication Successful!</p>
                <p>
                  User: {authResponse.user.name} ({authResponse.user.email})
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
