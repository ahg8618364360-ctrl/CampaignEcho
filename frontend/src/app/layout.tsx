import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import {
  Layers,
  LayoutDashboard,
  Sparkles,
  History,
  BrainCircuit,
  Settings,
  ChevronRight,
  Database,
  Server,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  title: "CampaignEcho — Memory-Powered AI Marketing Intelligence",
  description: "Every campaign teaches the next. Persistent, brand-specific AI marketing strategy powered by Vectorize Hindsight.",
};

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Brands", href: "/brands", icon: Layers, badge: "M4" },
  { name: "Campaign Studio", href: "/campaign-studio", icon: Sparkles, badge: "M4" },
  { name: "Campaign History", href: "/campaign-history", icon: History, badge: "M4" },
  { name: "Memory Explorer", href: "/memory-explorer", icon: BrainCircuit, badge: "M4" },
  { name: "Settings", href: "/settings", icon: Settings, badge: "M4" },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-canvas text-slate-200 font-sans min-h-screen flex antialiased selection:bg-brand selection:text-white">
        {/* Sidebar */}
        <aside className="w-64 border-r border-hairline bg-surface/70 backdrop-blur-xl flex flex-col justify-between p-4 shrink-0 fixed inset-y-0 left-0 z-30">
          <div>
            {/* Logo / Brand Header */}
            <div className="flex items-center gap-3 px-2 py-3 border-b border-hairline/60 mb-5">
              <div className="w-8 h-8 rounded-lg bg-brand/20 border border-brand/40 flex items-center justify-center text-brand font-bold text-sm">
                CE
              </div>
              <div>
                <h1 className="font-semibold text-sm tracking-tight text-slate-100 flex items-center gap-1.5">
                  CampaignEcho
                </h1>
                <p className="text-[11px] text-slate-500 font-mono">v0.1.0 · M1 Foundation</p>
              </div>
            </div>

            {/* Active Workspace / Brand Selector */}
            <div className="px-2 mb-6">
              <label className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block mb-1.5">
                Active Brand Context
              </label>
              <div className="w-full bg-surface-raised border border-hairline hover:border-hairline-strong transition-colors rounded-lg p-2.5 flex items-center justify-between cursor-pointer">
                <div className="truncate">
                  <p className="text-xs font-medium text-slate-200 truncate">The Taco Syndicate</p>
                  <p className="text-[10px] text-slate-500 font-mono">Fast-Casual Dining</p>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                  Demo
                </span>
              </div>
            </div>

            {/* Navigation Links */}
            <nav className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isOverview = item.href === "/";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isOverview
                        ? "bg-brand/15 text-brand border border-brand/30 font-semibold"
                        : "text-slate-400 hover:text-slate-200 hover:bg-surface-hover"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-slate-800 text-slate-500">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Infrastructure Health Footer */}
          <div className="p-3 rounded-lg bg-surface-raised/80 border border-hairline text-[11px] font-mono text-slate-400 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Server className="w-3 h-3 text-brand" /> API Port
              </span>
              <span className="text-slate-300">8000</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Database className="w-3 h-3 text-emerald-400" /> Database
              </span>
              <span className="text-slate-300">SQLite</span>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="pl-64 flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="h-14 border-b border-hairline bg-surface/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>CampaignEcho</span>
              <ChevronRight className="w-3 h-3 text-slate-600" />
              <span className="text-slate-200">System Foundation & Diagnostics</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-hairline text-[11px] font-mono text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Localhost Environment</span>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}

