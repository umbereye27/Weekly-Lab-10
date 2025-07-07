"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth-utils";

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      // console.log("authenticated", authenticated);
      setIsAuth(authenticated);
      setIsLoading(false);

      if (!authenticated) {
        router.push("/auth/signin");
      }
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      fallback || (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <div className="text-white text-lg">Loading...</div>
        </div>
      )
    );
  }

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}
