const BASE_URL = (import.meta.env?.VITE_API_URL as string) || "http://localhost:8000/api";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
};

export const setToken = (token: string | null) => {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
};

export const getUser = (): any | null => {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("auth_user");
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: any | null) => {
  if (typeof window === "undefined") return;
  if (user) {
    localStorage.setItem("auth_user", JSON.stringify(user));
  } else {
    localStorage.removeItem("auth_user");
  }
};

export async function apiRequest<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  const url = `${BASE_URL}/${cleanPath}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("Unauthenticated");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const errorMsg = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg) as any;
    error.status = response.status;
    error.errors = data?.errors;
    throw error;
  }

  return data as T;
}

export async function login(email: string, password: string) {
  const res = await apiRequest("login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (res.access_token) {
    setToken(res.access_token);
  }
  if (res.data) {
    setUser(res.data);
  }
  return res;
}

export async function logout() {
  try {
    await apiRequest("logout", {
      method: "POST",
    });
  } catch (error) {
    console.error("Logout request failed:", error);
  } finally {
    setToken(null);
    setUser(null);
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
  }
}
