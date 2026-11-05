import React from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function SectionHeading({
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h2 className="font-serif text-[22px] text-ink font-normal leading-snug">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-ink-secondary mt-0.5 font-sans">
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
