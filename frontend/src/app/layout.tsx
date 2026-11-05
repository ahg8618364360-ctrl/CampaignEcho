import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
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
  SlidersHorizontal,
} from "lucide-react";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: "CampaignEcho — Marketing Intelligence Workspace",
  description:
    "Every campaign teaches the next. Persistent, brand-specific AI marketing intelligence powered by Vectorize Hindsight.",
};

const navigation = [
  { name: "Overview", href: "/", icon: LayoutDashboard },
  { name: "Brands", href: "/brands", icon: Layers },
  { name: "Campaign Studio", href: "/campaign-studio", icon: Sparkles },
  { name: "Campaign History", href: "/campaign-history", icon: History },
  { name: "Memory Explorer", href: "/memory-explorer", icon: BrainCircuit },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="bg-canvas text-ink font-sans min-h-screen flex antialiased selection:bg-terracotta selection:text-white">
        {/* Workspace Sidebar */}
        <aside className="w-64 border-r border-hairline bg-surface flex flex-col justify-between p-4 shrink-0 fixed inset-y-0 left-0 z-30">
          <div>
            {/* Brand Emblem & Wordmark */}
            <div className="flex items-center gap-3 px-2 py-2 mb-6">
              <div className="w-9 h-9 rounded-lg bg-surface border border-hairline flex items-center justify-center shrink-0 shadow-sm shadow-black/5">
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
                <h1 className="font-serif text-xl tracking-tight text-ink font-normal">
                  CampaignEcho
                </h1>
                <p className="text-[11px] text-muted font-sans mt-0.5">Marketing Intelligence</p>
              </div>
            </div>

            {/* Active Brand Context Desk */}
            <div className="px-1 mb-6">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-muted block mb-1.5 px-1">
                Active Brand
              </span>
              <div className="w-full bg-surface-subtle border border-hairline hover:border-hairline-strong transition-colors rounded-lg p-2.5 flex items-center justify-between shadow-xs">
                <div className="truncate">
                  <p className="text-xs font-semibold text-ink truncate">The Taco Syndicate</p>
                  <p className="text-[11px] text-muted truncate">Fast-Casual Dining</p>
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
                const isOverview = item.href === "/";
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    prefetch={false}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                      isOverview
                        ? "bg-terracotta-subtle text-terracotta font-semibold"
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
            <p className="text-[10px] text-muted mt-1 font-sans">Vectorize Hindsight Engine</p>
          </div>
        </aside>

        {/* Main Content Pane */}
        <div className="pl-64 flex-1 flex flex-col min-h-screen">
          {/* Top Bar */}
          <header className="h-14 border-b border-hairline bg-surface/80 backdrop-blur-md px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
            <div className="flex items-center gap-2 text-xs text-muted">
              <span>Workspace</span>
              <ChevronRight className="w-3 h-3 text-muted/60" />
              <span className="text-ink font-medium">The Campaign Desk</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                href="/settings"
                className="flex items-center gap-1.5 text-xs text-muted hover:text-ink transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Diagnostics &amp; Status</span>
              </Link>
              <div className="h-4 w-px bg-hairline" />
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-forest"></span>
                <span className="text-xs text-muted font-medium">Local Session</span>
              </div>
            </div>
          </header>

          {/* Page View Body */}
          <main className="flex-1 p-8 overflow-y-auto">{children}</main>
        </div>
      </body>
    </html>
  );
}
