"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  ChevronDown,
  Check,
  Plus,
  Sparkles,
  User as UserIcon,
  LogOut,
  LogIn,
  Shield,
} from "lucide-react";

export function WorkspaceSwitcher() {
  const { user, brands, activeBrand, activeBrandId, setActiveBrandId, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface border border-border hover:border-border-hover transition-colors text-left text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
        title="Switch Business Workspace"
      >
        <Building2 className="w-3.5 h-3.5 text-primary shrink-0" />
        <div className="flex flex-col max-w-[140px] truncate">
          <span className="truncate leading-tight font-semibold">
            {activeBrand ? activeBrand.name : "Select Workspace"}
          </span>
          <span className="text-[10px] text-muted-foreground leading-tight truncate">
            {activeBrand?.is_synthetic ? "Synthetic Benchmark" : activeBrand?.industry || "Workspace"}
          </span>
        </div>
        {activeBrand?.is_synthetic && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            DEMO
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-0.5 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-card border border-border shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-border/60">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Active Workspaces
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {brands.map((brand) => {
              const isSelected = brand.id === activeBrandId;
              return (
                <button
                  key={brand.id}
                  onClick={() => {
                    setActiveBrandId(brand.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-surface ${
                    isSelected ? "bg-surface/80 text-foreground font-semibold" : "text-muted-foreground"
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="w-3.5 h-3.5 shrink-0 text-primary" />
                    <div className="flex flex-col text-left truncate">
                      <span className="truncate">{brand.name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">
                        {brand.industry}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {brand.is_synthetic ? (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        DEMO
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        OWNED
                      </span>
                    )}
                    {isSelected && <Check className="w-3.5 h-3.5 text-primary" />}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="p-1.5 border-t border-border/60 space-y-1">
            <Link
              href="/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Business Workspace</span>
            </Link>

            <div className="pt-1.5 mt-1 border-t border-border/40">
              {user ? (
                <div className="px-2.5 py-1.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-foreground">
                    <UserIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <div className="flex flex-col truncate">
                      <span className="font-medium truncate">{user.full_name}</span>
                      <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1 rounded text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-foreground hover:bg-surface transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-muted-foreground" />
                  <span>Sign In / Register</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
