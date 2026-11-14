"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";
import { useAuth } from "@/lib/auth-context";
import { ArrowRight, Compass, ShieldCheck } from "lucide-react";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  const isLanding = pathname === "/";
  const isAuthPage = pathname === "/login" || pathname === "/register";

  // Public Landing Page Shell
  if (isLanding) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-terracotta selection:text-white">
        {/* Public Editorial Header */}
        <header className="sticky top-0 z-50 bg-canvas/90 backdrop-blur-md border-b border-hairline px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 rounded-lg bg-surface border border-hairline flex items-center justify-center shrink-0 shadow-xs">
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
            <div>
              <span className="font-serif text-xl tracking-tight text-ink font-normal block leading-tight">
                CampaignEcho
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider text-ink-secondary">
                Marketing Intelligence
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links (Visible on desktop viewports) */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-ink-secondary">
            <a href="#how-it-works" className="hover:text-ink transition-colors">
              How It Works
            </a>
            <a href="#cognitive-loop" className="hover:text-ink transition-colors">
              Cognitive Loop
            </a>
            <a href="#architecture" className="hover:text-ink transition-colors">
              Memory Architecture
            </a>
            <a href="#evaluator-guide" className="hover:text-ink transition-colors">
              Evaluation Guide
            </a>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-2.5 shrink-0">
            {user ? (
              <Link
                href="/workspace"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-forest text-white text-xs font-medium hover:bg-forest/90 transition-colors shadow-xs"
              >
                <span>Workspace Desk</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login?next=/workspace"
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink hover:text-ink-secondary transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-terracotta text-white text-xs font-medium hover:bg-terracotta/90 transition-colors shadow-xs"
                >
                  <span>Create Workspace</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>
        </header>

        {/* Landing Body */}
        <main className="flex-1">{children}</main>

        {/* Editorial Footer */}
        <footer className="border-t border-hairline bg-surface py-12 px-4 sm:px-8 text-xs text-ink-secondary">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="font-serif text-lg text-ink font-normal">CampaignEcho</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border font-mono">
                  Vectorize Hindsight Cloud
                </span>
              </div>
              <p className="text-xs text-ink-secondary max-w-md leading-relaxed font-sans">
                Venture-grade AI marketing intelligence with persistent brand memory. Every campaign teaches the next.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-xs">
              <Link href="/workspace" className="hover:text-ink transition-colors">
                Workspace Desk
              </Link>
              <Link href="/campaign-studio" className="hover:text-ink transition-colors">
                Campaign Studio
              </Link>
              <Link href="/memory-evolution" className="hover:text-ink transition-colors">
                Memory Evolution
              </Link>
              <Link href="/settings" className="hover:text-ink transition-colors">
                System Diagnostics
              </Link>
            </div>
          </div>
          <div className="max-w-6xl mx-auto mt-8 pt-6 border-t border-hairline/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-ink-secondary font-mono">
            <span>&copy; {new Date().getFullYear()} CampaignEcho. Real Hindsight Integration · Zero Hallucinated Causality.</span>
            <span>Austin, Texas &amp; Distributed</span>
          </div>
        </footer>
      </div>
    );
  }

  // Public Auth Pages Shell (/login, /register)
  if (isAuthPage) {
    return (
      <div className="min-h-screen flex flex-col bg-canvas text-ink font-sans selection:bg-terracotta selection:text-white">
        <header className="px-6 py-4 border-b border-hairline bg-surface/80 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-surface border border-hairline flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 36 36" fill="none">
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
              </svg>
            </div>
            <span className="font-serif text-lg tracking-tight text-ink font-normal">
              CampaignEcho
            </span>
          </Link>
          <div className="text-xs text-ink-secondary">
            {pathname === "/login" ? (
              <span className="flex items-center gap-1.5">
                New user?{" "}
                <Link href="/register" className="text-terracotta font-medium hover:underline">
                  Create account
                </Link>
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                Already registered?{" "}
                <Link href="/login" className="text-terracotta font-medium hover:underline">
                  Sign in
                </Link>
              </span>
            )}
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4">{children}</main>

        <footer className="py-4 text-center text-xs text-ink-secondary border-t border-hairline">
          <span>CampaignEcho &middot; Dedicated 1:1 Vectorize Hindsight Banks</span>
        </footer>
      </div>
    );
  }

  // Authenticated Workspace Shell
  return (
    <div className="bg-canvas text-ink font-sans min-h-screen flex flex-col md:flex-row antialiased selection:bg-terracotta selection:text-white overflow-x-hidden">
      {/* Responsive Workspace Sidebar */}
      <Sidebar />

      {/* Main Content Pane */}
      <div className="md:pl-64 flex-1 flex flex-col min-h-screen w-full min-w-0">
        {/* Top Bar for Desktop */}
        <WorkspaceHeader />

        {/* Page View Body */}
        <main className="flex-1 p-4 sm:p-5 md:p-6 overflow-y-auto w-full min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
