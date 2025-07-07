"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

// Simple function to decode JWT payload without verification
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error("Error parsing JWT:", e);
    return null;
  }
}

export default function JwtDebugPage() {
  const [storedToken, setStoredToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<any>(null);
  const [inputToken, setInputToken] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage when component mounts
  useEffect(() => {
    try {
      const token = localStorage.getItem("token");
      setStoredToken(token);
      if (token) {
        setInputToken(token);
        const decoded = parseJwt(token);
        setDecodedToken(decoded);
      }
    } catch (e) {
      setError("Error accessing localStorage");
    }
  }, []);

  const decodeToken = () => {
    try {
      setError(null);
      if (!inputToken) {
        setError("Please enter a token");
        return;
      }
      const decoded = parseJwt(inputToken);
      if (!decoded) {
        setError("Invalid token format");
        return;
      }
      setDecodedToken(decoded);
    } catch (e) {
      setError("Error decoding token");
    }
  };

  const saveToken = () => {
    try {
      if (!inputToken) {
        setError("Please enter a token");
        return;
      }
      localStorage.setItem("token", inputToken);
      setStoredToken(inputToken);
      setError(null);
    } catch (e) {
      setError("Error saving token to localStorage");
    }
  };

  const clearToken = () => {
    try {
      localStorage.removeItem("token");
      setStoredToken(null);
      setError(null);
    } catch (e) {
      setError("Error clearing token from localStorage");
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-4">JWT Debug Tool</h1>
        <p className="text-slate-400 mb-8">Analyze and manage your JWT tokens</p>
        
        <div className="flex justify-end space-x-4 mb-6">
          <Button 
            onClick={() => window.location.href = "/"}
            variant="outline"
            className="border-slate-700 text-slate-300"
          >
            Back to Home
          </Button>
          <Button 
            onClick={() => window.location.href = "/debug/auth"}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Auth Debug Tool
          </Button>
        </div>
      
        <div className="grid grid-cols-1 gap-8">
          <Card className="bg-slate-800 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">JWT Token</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-slate-400 mb-2">Enter JWT Token:</p>
                  <Input
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button 
                    onClick={decodeToken}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    Decode Token
                  </Button>
                  <Button 
                    onClick={saveToken}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Save to localStorage
                  </Button>
                  <Button 
                    onClick={clearToken}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Clear Token
                  </Button>
                </div>
                
                {error && (
                  <div className="p-4 bg-red-900/30 border border-red-600 rounded-md text-red-400">
                    {error}
                  </div>
                )}
                
                <div>
                  <p className="text-slate-400 mb-2">Token Status:</p>
                  <p className="text-white">
                    {storedToken 
                      ? `Token in localStorage (${storedToken.substring(0, 10)}...)` 
                      : "No token in localStorage"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {decodedToken && (
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Decoded Token</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-slate-400 mb-2">User ID:</p>
                    <p className="text-white">{decodedToken.id}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Email:</p>
                    <p className="text-white">{decodedToken.email}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Name:</p>
                    <p className="text-white">{decodedToken.name}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Issued At:</p>
                    <p className="text-white">{new Date(decodedToken.iat * 1000).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Expires At:</p>
                    <p className="text-white">
                      {new Date(decodedToken.exp * 1000).toLocaleString()}
                      {Date.now() > decodedToken.exp * 1000 ? " (EXPIRED)" : " (Valid)"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 mb-2">Full Payload:</p>
                    <pre className="bg-slate-900 p-4 rounded-md text-white overflow-auto">
                      {JSON.stringify(decodedToken, null, 2)}
                    </pre>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <div className="pt-4 text-center">
            <Link href="/auth/signin" className="text-indigo-400 hover:text-indigo-300">
              Sign in to get a new token
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
