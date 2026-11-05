import type { Metadata } from "next";
import { Instrument_Serif, DM_Sans } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { WorkspaceHeader } from "@/components/WorkspaceHeader";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${instrumentSerif.variable} ${dmSans.variable}`}>
      <body className="bg-canvas text-ink font-sans min-h-screen flex flex-col md:flex-row antialiased selection:bg-terracotta selection:text-white">
        {/* Responsive Workspace Sidebar */}
        <Sidebar />

        {/* Main Content Pane */}
        <div className="md:pl-64 flex-1 flex flex-col min-h-screen w-full">
          {/* Top Bar for Desktop */}
          <WorkspaceHeader />

          {/* Page View Body */}
          <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
