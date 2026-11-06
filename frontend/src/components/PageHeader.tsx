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
    <section className="flex flex-col xl:flex-row xl:items-end justify-between gap-4 pb-4 border-b border-hairline">
      <div className="space-y-1.5 max-w-2xl min-w-0">
        {(badge || badgeSubtext) && (
          <div className="flex items-center gap-2 flex-wrap">
            {badge && (
              <span className="text-[11px] font-sans font-semibold tracking-wider uppercase text-terracotta bg-terracotta-subtle px-2.5 py-0.5 rounded-full border border-terracotta-border whitespace-nowrap">
                {badge}
              </span>
            )}
            {badgeSubtext && (
              <span className="text-xs text-ink-secondary font-sans whitespace-nowrap">{badgeSubtext}</span>
            )}
          </div>
        )}
        <h1 className="font-serif text-[24px] sm:text-[26px] md:text-[28px] text-ink font-normal tracking-tight leading-tight">
          {title}
        </h1>
        <p className="text-xs sm:text-sm text-ink-secondary font-sans leading-relaxed">
          {description}
        </p>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap self-start xl:self-end pt-1 xl:pt-0">
          {actions}
        </div>
      )}
    </section>
  );
}
