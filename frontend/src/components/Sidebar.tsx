"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Layers,
  LayoutDashboard,
  FilePlus,
  History,
  BrainCircuit,
  Settings,
  GitCompare,
  Menu,
  X,
} from "lucide-react";

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Brands", href: "/brands", icon: Layers },
  { name: "Campaign Studio", href: "/campaign-studio", icon: FilePlus },
  { name: "Memory Evolution", href: "/memory-evolution", icon: GitCompare },
  { name: "Campaign History", href: "/campaign-history", icon: History },
  { name: "Memory Explorer", href: "/memory-explorer", icon: BrainCircuit },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Header with Drawer Toggle */}
      <div className="md:hidden flex items-center justify-between h-14 px-4 bg-surface border-b border-hairline sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-surface border border-hairline flex items-center justify-center shrink-0">
            <svg className="w-5 h-5" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="3" fill="#B85C38" />
              <path
                d="M18 10C22.4183 10 26 13.5817 26 18C26 22.4183 22.4183 26 18 26"
                stroke="#B85C38"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              <path
                d="M18 6C24.6274 6 30 11.3726 30 18C30 24.6274 24.6274 30 18 30"
                stroke="#39745D"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeDasharray="3 3"
              />
              <path
                d="M18 14C15.7909 14 14 15.7909 14 18C14 20.2091 15.7909 22 18 22"
                stroke="#202923"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-serif text-lg tracking-tight text-ink font-normal">
            CampaignEcho
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg text-ink hover:bg-surface-subtle border border-hairline"
          aria-label="Toggle navigation menu"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Backdrop for mobile drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-ink/30 backdrop-blur-xs z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Workspace Sidebar (Desktop: fixed; Mobile: sliding drawer) */}
      <aside
        className={`w-64 border-r border-hairline bg-surface flex flex-col justify-between p-4 shrink-0 fixed inset-y-0 left-0 z-50 transition-transform duration-200 ease-in-out md:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Emblem & Wordmark */}
          <div className="flex items-center justify-between px-2 py-2 mb-6">
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-surface border border-hairline flex items-center justify-center shrink-0 shadow-xs">
                <svg className="w-6 h-6" viewBox="0 0 36 36" fill="none">
                  <circle cx="18" cy="18" r="3" fill="#B85C38" />
                  <path
                    d="M18 10C22.4183 10 26 13.5817 26 18C26 22.4183 22.4183 26 18 26"
                    stroke="#B85C38"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                  <path
                    d="M18 6C24.6274 6 30 11.3726 30 18C30 24.6274 24.6274 30 18 30"
                    stroke="#39745D"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M18 14C15.7909 14 14 15.7909 14 18C14 20.2091 15.7909 22 18 22"
                    stroke="#202923"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="leading-none">
                <span className="font-serif text-xl tracking-tight text-ink font-normal block">
                  CampaignEcho
                </span>
                <p className="text-[11px] text-ink-secondary font-sans mt-0.5">
                  Marketing Intelligence
                </p>
              </div>
            </Link>

            {/* Close button inside mobile drawer */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="md:hidden p-1.5 rounded-lg text-ink-secondary hover:text-ink hover:bg-surface-subtle"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Brand Context Desk */}
          <div className="px-1 mb-6">
            <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block mb-1.5 px-1">
              Active Brand
            </span>
            <div className="w-full bg-surface-subtle border border-hairline hover:border-hairline-strong transition-colors rounded-lg p-2.5 flex items-center justify-between shadow-xs">
              <div className="truncate">
                <p className="text-xs font-semibold text-ink truncate">The Taco Syndicate</p>
                <p className="text-[11px] text-ink-secondary truncate">Fast-Casual Dining</p>
              </div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border shrink-0">
                Demo
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch={false}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-terracotta-subtle text-terracotta font-semibold border border-terracotta-border/50"
                      : "text-ink/80 hover:text-ink hover:bg-surface-hover"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer with Editorial Motto */}
        <div className="p-3 rounded-lg bg-surface-subtle border border-hairline text-center">
          <p className="font-serif italic text-xs text-ink/80">
            &ldquo;Every campaign teaches the next.&rdquo;
          </p>
          <p className="text-[10px] text-ink-secondary mt-1 font-sans">
            Vectorize Hindsight Engine
          </p>
        </div>
      </aside>
    </>
  );
}

