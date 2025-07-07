// Authentication utility functions for client-side

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
};

export const setAuthToken = (token: string): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
};

export const removeAuthToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// API request helper with authentication
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
