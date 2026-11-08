"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface BrandWorkspace {
  id: string;
  user_id?: string | null;
  name: string;
  industry: string;
  description: string;
  target_audience: string;
  market_region: string;
  brand_voice: string;
  preferred_language?: string;
  restrictions?: string | null;
  is_synthetic: boolean;
  is_archived?: boolean;
  website?: string | null;
  instagram_handle?: string | null;
  products_or_services?: string | null;
  unique_selling_points?: string | null;
  price_range?: string | null;
  key_offers?: string | null;
  competitors?: string | null;
  hindsight_bank_id?: string | null;
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  brands: BrandWorkspace[];
  activeBrand: BrandWorkspace | null;
  activeBrandId: string | null;
  setActiveBrandId: (id: string) => void;
  refreshBrands: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<BrandWorkspace[]>([]);
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(null);

  const setActiveBrandId = (id: string) => {
    setActiveBrandIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("campaignecho_active_brand_id", id);
    }
  };

  const refreshBrands = useCallback(async () => {
    try {
      const headers: Record<string, string> = { Accept: "application/json" };
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("campaignecho_auth_token") : null;
      if (storedToken) {
        headers["Authorization"] = `Bearer ${storedToken}`;
      }

      const res = await fetch(`${API_BASE}/brands`, { headers, cache: "no-store" });
      if (res.ok) {
        const data: BrandWorkspace[] = await res.json();
        setBrands(data);

        // Update active brand if needed
        const storedActiveId = typeof window !== "undefined" ? localStorage.getItem("campaignecho_active_brand_id") : null;
        if (storedActiveId && data.some((b) => b.id === storedActiveId)) {
          setActiveBrandIdState(storedActiveId);
        } else if (data.length > 0) {
          // Default to first user-created brand if available, else first synthetic brand
          const userBrand = data.find((b) => !b.is_synthetic);
          const defaultBrand = userBrand || data[0];
          setActiveBrandIdState(defaultBrand.id);
          if (typeof window !== "undefined") {
            localStorage.setItem("campaignecho_active_brand_id", defaultBrand.id);
          }
        }
      }
    } catch (err) {
      console.warn("Failed to refresh brand workspaces:", err);
    }
  }, []);

  // Initial authentication hydration
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("campaignecho_auth_token") : null;
      if (storedToken) {
        setToken(storedToken);
        try {
          const meRes = await fetch(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${storedToken}` },
            cache: "no-store",
          });
          if (meRes.ok) {
            const userData: User = await meRes.json();
            setUser(userData);
          } else {
            // Token expired or invalid
            localStorage.removeItem("campaignecho_auth_token");
            setToken(null);
            setUser(null);
          }
        } catch {
          // Network failure or backend not yet ready
        }
      }
      await refreshBrands();
      setIsLoading(false);
    };

    initAuth();
  }, [refreshBrands]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || "Authentication failed" };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("campaignecho_auth_token", data.access_token);
      await refreshBrands();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during login" };
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || "Registration failed" };
      }

      const data = await res.json();
      setToken(data.access_token);
      setUser(data.user);
      localStorage.setItem("campaignecho_auth_token", data.access_token);
      await refreshBrands();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during registration" };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("campaignecho_auth_token");
    refreshBrands();
  };

  const activeBrand = brands.find((b) => b.id === activeBrandId) || brands[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        brands,
        activeBrand,
        activeBrandId,
        setActiveBrandId,
        refreshBrands,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
