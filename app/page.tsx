"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export default function HomePage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
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

      if (!response.ok) {
        setError(data.error || "Invalid credentials");
      } else {
        // Store the token in localStorage
        localStorage.setItem("token", data.token);
        router.push("/vault");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      if (response.ok) {
        // After successful signup, automatically sign in
        const loginResponse = await fetch("/api/auth/signin", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();

        if (!loginResponse.ok) {
          setError("Account created but login failed");
        } else {
          // Store the token in localStorage
          localStorage.setItem("token", loginData.token);
          router.push("/vault");
        }
      } else {
        const data = await response.json();
        setError(data.error || "Something went wrong");
      }
    } catch (error) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">SkillVault</h1>
          <p className="text-slate-400 text-sm">Track your learning journey</p>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <form
            onSubmit={isSignUp ? handleSignUp : handleSignIn}
            className="space-y-6"
          >
            {isSignUp && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-slate-300 mb-2"
                >
                  Name
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                  required={isSignUp}
                />
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-700/50 border-slate-600 text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isSignUp
                  ? "Creating account..."
                  : "Signing in..."
                : isSignUp
                ? "Sign Up"
                : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {isSignUp ? (
              <div>
                Already have an account?{" "}
                <Link
                  href="/auth/signin"
                  className="text-indigo-600 hover:underline"
                >
                  Sign in
                </Link>
              </div>
            ) : (
              <div>
                Don't have an account?{" "}
                <Link
                  href="/auth/signup"
                  className="text-indigo-600 hover:underline"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Debug links */}
            <div className="mt-6 pt-4 border-t border-slate-700 text-center">
              <p className="text-slate-500 text-xs mb-2">Debug Tools</p>
              <div className="flex justify-center space-x-4">
                <Link href="/debug/auth" className="text-indigo-500 text-sm hover:underline">
                  Auth Debug
                </Link>
                <Link href="/debug/jwt" className="text-indigo-500 text-sm hover:underline">
                  JWT Debug
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
