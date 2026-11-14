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

  const visibleBrands = brands.filter((b) => !b.is_synthetic || b.id === activeBrandId);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface border border-hairline hover:border-hairline-strong transition-colors text-left text-xs font-medium text-ink focus:outline-none focus:ring-1 focus:ring-terracotta/40"
        title="Switch Business Workspace"
      >
        <Building2 className="w-3.5 h-3.5 text-terracotta shrink-0" />
        <div className="flex flex-col max-w-[140px] truncate">
          <span className="truncate leading-tight font-semibold">
            {activeBrand ? activeBrand.name : "Select Workspace"}
          </span>
          <span className="text-[10px] text-ink-secondary leading-tight truncate">
            {activeBrand?.is_synthetic ? "Synthetic Benchmark" : activeBrand?.industry || "Workspace"}
          </span>
        </div>
        {activeBrand?.is_synthetic && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-amber-500/10 text-amber-600 border border-amber-500/20">
            DEMO
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-ink-secondary ml-0.5 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface border border-hairline shadow-lg py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-2 border-b border-hairline/60">
            <div className="text-[10px] font-mono uppercase tracking-wider text-ink-secondary">
              Active Workspaces
            </div>
          </div>

          <div className="max-h-56 overflow-y-auto py-1">
            {visibleBrands.length === 0 ? (
              <div className="px-3 py-3 text-center text-xs text-ink-secondary font-sans">
                <span>No businesses created yet.</span>
              </div>
            ) : (
              visibleBrands.map((brand) => {
                const isSelected = brand.id === activeBrandId;
                return (
                  <button
                    key={brand.id}
                    onClick={() => {
                      setActiveBrandId(brand.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors hover:bg-surface-subtle ${
                      isSelected ? "bg-surface-subtle text-ink font-semibold" : "text-ink-secondary"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Building2 className="w-3.5 h-3.5 shrink-0 text-terracotta" />
                      <div className="flex flex-col text-left truncate">
                        <span className="truncate">{brand.name}</span>
                        <span className="text-[10px] text-ink-secondary truncate">
                          {brand.industry}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      {brand.is_synthetic ? (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          BENCHMARK
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-forest-subtle text-forest border border-forest-border">
                          OWNED
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 text-terracotta" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          <div className="p-1.5 border-t border-hairline/60 space-y-1">
            <Link
              href="/onboarding"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-terracotta hover:bg-terracotta-subtle transition-colors font-medium"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Business Workspace</span>
            </Link>

            <div className="pt-1.5 mt-1 border-t border-hairline/40">
              {user ? (
                <div className="px-2.5 py-1.5 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-ink">
                    <UserIcon className="w-3.5 h-3.5 text-ink-secondary" />
                    <div className="flex flex-col truncate">
                      <span className="font-medium truncate">{user.full_name}</span>
                      <span className="text-[10px] text-ink-secondary truncate">{user.email}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center gap-2 w-full px-2 py-1 rounded text-xs text-alert hover:bg-alert-subtle transition-colors"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-2 w-full px-2.5 py-1.5 rounded-lg text-xs text-ink hover:bg-surface-subtle transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5 text-ink-secondary" />
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
