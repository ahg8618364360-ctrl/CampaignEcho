import React from "react";

interface PageHeaderProps {
  badge?: string;
  badgeSubtext?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}

export function PageHeader({
  badge,
  badgeSubtext,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hairline">
      <div className="space-y-2">
        {(badge || badgeSubtext) && (
          <div className="flex items-center gap-2">
            {badge && (
              <span className="text-[11px] font-sans font-semibold tracking-wider uppercase text-terracotta bg-terracotta-subtle px-2.5 py-0.5 rounded-full border border-terracotta-border">
                {badge}
              </span>
            )}
            {badgeSubtext && (
              <span className="text-xs text-ink-secondary font-sans">{badgeSubtext}</span>
            )}
          </div>
        )}
        <h1 className="font-serif text-[26px] sm:text-[28px] md:text-[32px] text-ink font-normal tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-sm text-ink-secondary font-sans max-w-xl leading-relaxed">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {actions}
        </div>
      )}
    </section>
  );
}

