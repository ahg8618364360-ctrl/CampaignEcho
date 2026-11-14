import React from "react";
import { Button } from "./Button";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

interface FeatureCapability {
  title: string;
  description: string;
}

interface FeatureStateProps {
  category: string;
  title: string;
  headline: string;
  description: string;
  statusBadge: string;
  capabilities: FeatureCapability[];
  primaryActionText?: string;
  primaryActionHref?: string;
}

export function FeatureState({
  category,
  title,
  headline,
  description,
  statusBadge,
  capabilities,
  primaryActionText = "Return to Overview",
  primaryActionHref = "/workspace",
}: FeatureStateProps) {
  return (
    <div className="space-y-6">
      {/* Editorial Workspace Card */}
      <div className="p-8 rounded-xl bg-surface border border-hairline shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-hairline">
          <div>
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-secondary">
              {category}
            </span>
            <h2 className="font-serif text-2xl md:text-3xl text-ink font-normal mt-1">
              {headline}
            </h2>
          </div>
          <span className="self-start sm:self-auto text-xs font-medium px-3 py-1 rounded-full bg-surface-subtle text-ink-secondary border border-hairline shrink-0">
            {statusBadge}
          </span>
        </div>

        <p className="text-sm text-ink-secondary leading-relaxed max-w-2xl font-sans">
          {description}
        </p>

        {/* Feature Capabilities Preview */}
        <div className="pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-ink mb-4 font-sans">
            Workspace Capabilities Under Preparation
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {capabilities.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-lg bg-surface-subtle border border-hairline space-y-2"
              >
                <div className="flex items-center gap-2 text-forest">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="text-xs font-semibold text-ink font-sans">
                    {item.title}
                  </span>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Corridor */}
        <div className="pt-6 border-t border-hairline flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-forest shrink-0" />
            <span>Active Brand Context: <strong className="text-ink font-medium">Isolated Brand Memory</strong></span>
          </div>

          <Button
            variant="secondary"
            href={primaryActionHref}
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
          >
            {primaryActionText}
          </Button>
        </div>
      </div>
    </div>
  );
}

