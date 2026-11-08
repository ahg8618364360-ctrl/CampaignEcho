import React from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal } from "lucide-react";
import { WorkspaceSwitcher } from "@/components/WorkspaceSwitcher";

interface WorkspaceHeaderProps {
  currentSection?: string;
}

export function WorkspaceHeader({ currentSection = "The Campaign Desk" }: WorkspaceHeaderProps) {
  return (
    <header className="hidden md:flex h-14 border-b border-hairline bg-surface/80 backdrop-blur-md px-4 sm:px-6 items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-xs text-ink-secondary truncate">
        <span>Workspace</span>
        <ChevronRight className="w-3 h-3 text-ink-secondary/60 shrink-0" />
        <span className="text-ink font-medium truncate">{currentSection}</span>
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0">
        <WorkspaceSwitcher />
        <div className="h-4 w-px bg-hairline" />
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Diagnostics &amp; Status</span>
        </Link>
      </div>
    </header>
  );
}

