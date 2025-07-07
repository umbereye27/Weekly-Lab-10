"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  isAuthenticated: false,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    // console.log(
    //   "Auth Provider - Token found (first 10 chars):",
    //   token.substring(0, 10) + "..."
    // );

    // Parse the JWT token to get user data (simplified approach)
    try {
      // Simple function to decode JWT payload
      const parseJwt = (token: string) => {
        try {
          return JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
          return null;
        }
      };

      const decoded = parseJwt(token);

      if (decoded && decoded.id && decoded.email) {
        setUser({
          id: decoded.id,
          email: decoded.email,
          name: decoded.name || decoded.email.split("@")[0],
        });
      } else {
        // Invalid token format
        localStorage.removeItem("token");
      }
    } catch (error) {
      // console.error("Error parsing token:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    router.push("/");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
