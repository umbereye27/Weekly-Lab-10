"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormLabel, FormMessage } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      console.log("Sign-in response:", data);

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
      } else {
        // Store token and log
        console.log(
          "Storing token (first 10 chars):",
          data.token.substring(0, 10) + "..."
        );
        localStorage.setItem("token", data.token);

        // Add debug token check
        setTimeout(() => {
          const storedToken = localStorage.getItem("token");
          console.log(
            "Verifying stored token:",
            storedToken ? "Token found" : "No token found",
            storedToken
              ? `(first 10 chars: ${storedToken.substring(0, 10)}...)`
              : ""
          );
        }, 100);

        // Force reload to ensure the AuthProvider picks up the token
        window.location.href = "/vault"; // First redirect to debug page
      }
    } catch (error) {
      setError("Something went wrong");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">
            Welcome to <span className="text-indigo-600">SkillVault</span>
          </CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleSubmit}>
            <FormField>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormField>
            <FormField>
              <FormLabel htmlFor="password">Password</FormLabel>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </FormField>
            {error && <FormMessage>{error}</FormMessage>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="text-indigo-600 hover:underline"
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
