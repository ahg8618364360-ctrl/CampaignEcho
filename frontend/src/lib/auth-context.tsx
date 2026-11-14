"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getApiBaseUrl, apiFetch } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  is_active: boolean;
  created_at: string;
}

export interface BrandWorkspace {
  id: string;
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
  created_at?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  brands: BrandWorkspace[];
  activeBrand: BrandWorkspace | null;
  activeBrandId: string | null;
  setActiveBrandId: (id: string) => void;
  refreshBrands: () => Promise<BrandWorkspace[]>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; brandsCount?: number }>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<BrandWorkspace[]>([]);
  const [activeBrandId, setActiveBrandIdState] = useState<string | null>(null);

  const setActiveBrandId = (id: string) => {
    setActiveBrandIdState(id);
    if (typeof window !== "undefined") {
      localStorage.setItem("campaignecho_active_brand_id", id);
    }
  };

  const refreshBrands = useCallback(async (): Promise<BrandWorkspace[]> => {
    try {
      const res = await apiFetch("/brands", {
        cache: "no-store",
      });
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
        } else {
          setActiveBrandIdState(null);
        }
        return data;
      }
      return [];
    } catch (err) {
      console.warn("Failed to refresh brand workspaces:", err);
      return [];
    }
  }, []);

  // Initial authentication hydration via HttpOnly cookie
  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const meRes = await apiFetch("/auth/me", {
          cache: "no-store",
        });
        if (meRes.ok) {
          const userData: User = await meRes.json();
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
      await refreshBrands();
      setIsLoading(false);
    };

    initAuth();
  }, [refreshBrands]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; brandsCount?: number }> => {
    try {
      const res = await apiFetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || "Authentication failed" };
      }

      const data = await res.json();
      setUser(data.user);
      const loadedBrands = await refreshBrands();
      return { success: true, brandsCount: loadedBrands.length };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during login" };
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await apiFetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        return { success: false, error: errData.detail || "Registration failed" };
      }

      const data = await res.json();
      setUser(data.user);
      await refreshBrands();
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || "Network error during registration" };
    }
  };

  const logout = async () => {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
      });
    } catch {
      // Ignore network errors on logout
    }
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("campaignecho_active_brand_id");
    }
    await refreshBrands();
  };

  const activeBrand = brands.find((b) => b.id === activeBrandId) || brands[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
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
