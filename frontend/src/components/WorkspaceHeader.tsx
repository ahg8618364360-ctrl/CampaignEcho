import React from "react";
import Link from "next/link";
import { ChevronRight, SlidersHorizontal } from "lucide-react";

interface WorkspaceHeaderProps {
  currentSection?: string;
}

export function WorkspaceHeader({ currentSection = "The Campaign Desk" }: WorkspaceHeaderProps) {
  return (
    <header className="hidden md:flex h-14 border-b border-hairline bg-surface/80 backdrop-blur-md px-8 items-center justify-between shrink-0 sticky top-0 z-20">
      <div className="flex items-center gap-2 text-xs text-ink-secondary">
        <span>Workspace</span>
        <ChevronRight className="w-3 h-3 text-ink-secondary/60" />
        <span className="text-ink font-medium">{currentSection}</span>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/settings"
          className="flex items-center gap-1.5 text-xs text-ink-secondary hover:text-ink transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Diagnostics &amp; Status</span>
        </Link>
        <div className="h-4 w-px bg-hairline" />
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-forest" />
          <span className="text-xs text-ink-secondary font-medium">Local Session</span>
        </div>
      </div>
    </header>
  );
}
