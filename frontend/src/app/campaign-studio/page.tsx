"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import {
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Send,
  Layers,
  Info,
} from "lucide-react";

export default function CampaignStudioPage() {
  const [campaignTitle, setCampaignTitle] = useState("Finals Week Midnight Burrito Run");
  const [objective, setObjective] = useState("foot-traffic");
  const [platform, setPlatform] = useState("reels");
  const [promoAngle, setPromoAngle] = useState(
    "Late-night flash discount for students studying for exams. High-energy vertical video showcasing sizzling carnitas and melted queso after 10 PM."
  );

  return (
    <PageContainer size="wide">
      {/* 1. Header */}
      <PageHeader
        badge="Campaign Strategy & Briefs"
        badgeSubtext="Active Brand: The Taco Syndicate"
        title="Campaign Studio"
        description="Formulate empirical marketing strategies grounded in accumulated brand memory, past campaign performance, and causal marketing constraints."
        actions={
          <Button
            variant="secondary"
            href="/campaign-history"
            icon={<BrainCircuit className="w-3.5 h-3.5 text-ink-secondary" />}
          >
            Review Historical Precedents
          </Button>
        }
      />

      {/* 2. 12-Column Grid: 7-col Brief Composer + 5-col Memory Grounding */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: 7-Column Campaign Brief Composer */}
        <section className="lg:col-span-7 p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-hairline">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Brief Composer
              </span>
              <h2 className="font-serif text-xl text-ink font-normal mt-0.5">
                New Strategy Specification
              </h2>
            </div>
            <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline">
              M3 Inference Ready
            </span>
          </div>

          <div className="space-y-3.5 text-xs font-sans">
            {/* Campaign Name */}
            <div className="space-y-1">
              <label className="font-medium text-ink block">Campaign Name</label>
              <input
                type="text"
                value={campaignTitle}
                onChange={(e) => setCampaignTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                placeholder="e.g. Finals Week Midnight Burrito Run"
              />
            </div>

            {/* Objective & Channel Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-ink block">Primary Objective</label>
                <select
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors cursor-pointer"
                >
                  <option value="foot-traffic">Late-Night Foot Traffic / Sales</option>
                  <option value="awareness">Campus Menu Item Awareness</option>
                  <option value="loyalty">Student Loyalty Activation</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-ink block">Target Platform</label>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors cursor-pointer"
                >
                  <option value="reels">Instagram Reels (Short Video)</option>
                  <option value="tiktok">TikTok (Organic & Paid)</option>
                  <option value="campus">Campus Flyering & Stories</option>
                </select>
              </div>
            </div>

            {/* Promotional Angle Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-medium text-ink block">Promotional Angle & Concept</label>
                <span className="text-[11px] text-ink-secondary">Grounds against memory</span>
              </div>
              <textarea
                rows={3}
                value={promoAngle}
                onChange={(e) => setPromoAngle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors leading-relaxed"
                placeholder="Describe the campaign hook, timing, and intended user action..."
              />
            </div>

            {/* Constraints Checklist */}
            <div className="p-3 rounded-lg bg-surface-subtle border border-hairline/80 space-y-2">
              <p className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                Automated Grounding Checks
              </p>
              <div className="space-y-1.5 text-[11px] text-ink-secondary">
                <div className="flex items-center gap-1.5 text-forest">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Aligned with Austin West Campus student corridor (18–24)</span>
                </div>
                <div className="flex items-center gap-1.5 text-forest">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>Enforces verified BOGO food-prep visual format</span>
                </div>
                <div className="flex items-center gap-1.5 text-terracotta">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Filter applied: Zero upscale gourmet or fine-dining vocabulary</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
              <div className="text-[11px] text-ink-secondary flex items-center gap-1.5">
                <BrainCircuit className="w-3.5 h-3.5 text-terracotta" />
                <span>Hindsight Recall &amp; Groq Llama 3.3 Engine</span>
              </div>
              <Button
                variant="primary"
                onClick={() => {}}
                icon={<Send className="w-3.5 h-3.5" />}
              >
                Generate Memory-Grounded Strategy
              </Button>
            </div>
          </div>
        </section>

        {/* Right Pane: 5-Column Memory Context & Guardrails */}
        <section className="lg:col-span-5 p-5 rounded-xl bg-surface-subtle border border-hairline shadow-xs space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Memory Grounding Desk
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border">
                Bank Scoped
              </span>
            </div>
            <h3 className="font-serif text-lg text-ink font-normal mt-0.5">
              Active Brand Memories
            </h3>
            <p className="text-xs text-ink-secondary font-sans mt-1">
              Historical lessons automatically recalled from the brand's Vectorize Hindsight bank to constrain strategy generation.
            </p>
          </div>

          {/* Precedents Stack */}
          <div className="space-y-2.5 text-xs font-sans">
            <div className="p-3 rounded-lg bg-surface border border-hairline space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-forest uppercase tracking-wider">
                  Verified Precedent
                </span>
                <span className="text-[11px] text-ink-secondary tabular-nums">4.2x Engagement</span>
              </div>
              <p className="font-medium text-ink text-xs">Late-Night BOGO Video</p>
              <p className="text-[11px] text-ink-secondary leading-normal">
                Macro clips of food prep after 9 PM drastically outperform static graphics.
              </p>
              <div className="pt-1 text-[10px] font-mono text-ink-secondary/80 flex items-center gap-1">
                <BrainCircuit className="w-3 h-3 text-forest" />
                <span>#mem-0891 (aretain)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-hairline space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-terracotta uppercase tracking-wider">
                  Hard Negative Constraint
                </span>
                <span className="text-[11px] text-ink-secondary">Proven Failure</span>
              </div>
              <p className="font-medium text-ink text-xs">No Fine-Dining / Gourmet Tone</p>
              <p className="text-[11px] text-ink-secondary leading-normal">
                Truffle campaign produced near-zero student conversions. Keep copy authentic and witty.
              </p>
              <div className="pt-1 text-[10px] font-mono text-ink-secondary/80 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-terracotta" />
                <span>#mem-0744 (Negative Constraint)</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface border border-hairline space-y-1 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-ink-secondary uppercase tracking-wider">
                  Operational Rule
                </span>
                <span className="text-[11px] text-ink-secondary">-65% Friction</span>
              </div>
              <p className="font-medium text-ink text-xs">Direct Flash ID In-Store</p>
              <p className="text-[11px] text-ink-secondary leading-normal">
                Avoid multi-step app QR codes; instruct customers to simply flash student ID.
              </p>
              <div className="pt-1 text-[10px] font-mono text-ink-secondary/80 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-ink-secondary" />
                <span>#mem-0612 (areflect)</span>
              </div>
            </div>
          </div>

          {/* Tenant Isolation Guarantee */}
          <div className="pt-3 border-t border-hairline/80 flex items-center justify-between text-xs text-ink-secondary font-sans">
            <span className="flex items-center gap-1.5 text-forest font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict 1:1 Isolation</span>
            </span>
            <Link
              href="/memory-explorer"
              className="text-terracotta hover:underline text-[11px] font-medium"
            >
              Inspect Bank Ledger
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
