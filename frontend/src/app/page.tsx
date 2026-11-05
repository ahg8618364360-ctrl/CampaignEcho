"use client";

import { useEffect, useState } from "react";
import { checkReadiness, type HealthReadyResponse } from "@/lib/api";
import Link from "next/link";
import {
  Sparkles,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Compass,
  AlertCircle,
  Lightbulb,
} from "lucide-react";

export default function OverviewPage() {
  const [health, setHealth] = useState<HealthReadyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshHealth = async () => {
    setLoading(true);
    const data = await checkReadiness();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  const isBackendAlive = health?.status === "ready" || health?.status === "unready";
  const isDbConnected = health?.database === "connected";

  return (
    <div className="max-w-5xl mx-auto space-y-10">
      {/* 1. Editorial Workspace Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-hairline">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-terracotta bg-terracotta-subtle px-2.5 py-0.5 rounded-full border border-terracotta-border">
              Brand Desk · The Taco Syndicate
            </span>
            <span className="text-xs text-muted">Synthetic Demo Fixture</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-ink tracking-tight font-normal">
            Your marketing workspace
          </h1>
          <p className="text-sm text-muted max-w-xl leading-relaxed">
            Every campaign teaches the next. CampaignEcho remembers historical results, audience reactions, and brand constraints to formulate sharper strategies.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/campaign-studio"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-terracotta hover:bg-terracotta-hover text-white text-xs font-medium shadow-xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Campaign Brief</span>
          </Link>
          <Link
            href="/memory-explorer"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-surface border border-hairline hover:border-hairline-strong text-xs font-medium text-ink transition-colors shadow-xs"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-muted" />
            <span>Inspect Memories</span>
          </Link>
        </div>
      </section>

      {/* 2. Workspace Readiness Strip (Compact Horizontal Summary) */}
      <section className="p-4 rounded-xl bg-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <span className="font-medium text-ink flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-terracotta" />
            <span>Workspace Readiness</span>
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendAlive ? "bg-forest" : "bg-alert"
              }`}
            />
            <span className="text-muted">FastAPI Backend:</span>
            <span className="font-medium text-ink">
              {loading ? "Checking..." : isBackendAlive ? `Live (${health?.latencyMs}ms)` : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isDbConnected ? "bg-forest" : "bg-alert"
              }`}
            />
            <span className="text-muted">SQLite Store:</span>
            <span className="font-medium text-ink">
              {loading ? "Checking..." : isDbConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-muted">
            <span className="w-2 h-2 rounded-full bg-hairline" />
            <span>Memory Engine:</span>
            <span className="text-muted">Scheduled for M2</span>
          </div>

          <div className="flex items-center gap-2 text-muted">
            <span className="w-2 h-2 rounded-full bg-hairline" />
            <span>LLM Inference:</span>
            <span className="text-muted">Scheduled for M3</span>
          </div>
        </div>

        <button
          onClick={refreshHealth}
          disabled={loading}
          className="self-end md:self-auto text-xs text-muted hover:text-ink flex items-center gap-1 px-2.5 py-1 rounded border border-hairline/60 bg-surface-subtle transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>Verify</span>
        </button>
      </section>

      {/* 3. Brand Intelligence Profile Card */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-xl bg-surface border border-hairline space-y-5 shadow-xs">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                Brand Intelligence Profile
              </span>
              <h2 className="font-serif text-2xl text-ink mt-1">The Taco Syndicate</h2>
            </div>
            <Link
              href="/brands"
              className="text-xs text-terracotta hover:underline flex items-center gap-1 font-medium"
            >
              <span>Edit Brand Voice</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-sm text-ink/80 leading-relaxed">
            Authentic Mexican street tacos, late-night burritos, and Mexican sodas targeted at undergraduate and graduate students near campus. Focuses on high-energy, relatable food utility.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-hairline/60 text-xs">
            <div>
              <p className="text-muted font-medium mb-1">Target Audience</p>
              <p className="text-ink font-medium leading-normal">
                University students (18–24), value-conscious, active after 9 PM.
              </p>
            </div>
            <div>
              <p className="text-muted font-medium mb-1">Brand Voice</p>
              <p className="text-ink font-medium leading-normal">
                Energetic, authentic, witty, zero corporate pretension.
              </p>
            </div>
            <div>
              <p className="text-muted font-medium mb-1">Operational Market</p>
              <p className="text-ink font-medium leading-normal">Austin, TX (West Campus Corridor)</p>
            </div>
            <div>
              <p className="text-muted font-medium mb-1">Negative Constraint</p>
              <p className="text-ink font-medium leading-normal">
                No fine-dining aesthetics; no alcohol promos in student campaigns.
              </p>
            </div>
          </div>
        </div>

        {/* Learning Posture & Memory Isolation Summary */}
        <div className="p-6 rounded-xl bg-surface-subtle border border-hairline flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
              Memory Posture
            </span>
            <h3 className="font-serif text-xl text-ink font-normal">Brand Isolation Guarantee</h3>
            <p className="text-xs text-muted leading-relaxed">
              Memories are locked into a dedicated memory bank strictly scoped to this brand. Insights from other restaurants or agency clients never cross tenant boundaries.
            </p>
          </div>

          <div className="pt-4 border-t border-hairline/80 space-y-2">
            <div className="flex items-center gap-2 text-xs text-forest font-medium">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>1:1 Bank Mapping Verified</span>
            </div>
            <p className="text-[11px] text-muted">
              Internal ID: <span className="font-mono text-ink">campaignecho-brand-b0f7</span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Campaign Learning Ledger (The Editorial Activity Stream) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl text-ink">Campaign Learning Ledger</h2>
            <p className="text-xs text-muted mt-0.5">
              Accumulated observations, performance takeaways, and client feedback retained in Hindsight.
            </p>
          </div>
          <Link
            href="/campaign-history"
            className="text-xs text-terracotta hover:underline flex items-center gap-1 font-medium"
          >
            <span>View All Campaigns</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Synthetic Demo Historical Lessons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border">
                Proven Success
              </span>
              <span className="text-xs text-muted">Campaign #1</span>
            </div>
            <h3 className="text-sm font-semibold text-ink">Late Night Burrito Drops</h3>
            <p className="text-xs text-muted leading-relaxed">
              Flash BOGO promotions after 9 PM drove 380 redemptions. Visual macro clips of food preparation outperformed graphic carousels by 4.2x engagement.
            </p>
            <div className="pt-2 border-t border-hairline/60 flex items-center gap-1.5 text-[11px] text-forest font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Retained in Memory</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-terracotta-subtle text-terracotta border border-terracotta-border">
                Documented Mistake
              </span>
              <span className="text-xs text-muted">Campaign #2</span>
            </div>
            <h3 className="text-sm font-semibold text-ink">Gourmet Truffle Tasting</h3>
            <p className="text-xs text-muted leading-relaxed">
              High budget ad spend produced near-zero student conversions. Audience feedback noted upscale gourmet framing felt pretentious and unaffordable.
            </p>
            <div className="pt-2 border-t border-hairline/60 flex items-center gap-1.5 text-[11px] text-terracotta font-medium">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Negative Pattern Avoidance</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-subtle text-muted border border-hairline">
                Operational Takeaway
              </span>
              <span className="text-xs text-muted">Post-Mortem Note</span>
            </div>
            <h3 className="text-sm font-semibold text-ink">Flash Student ID Redemption</h3>
            <p className="text-xs text-muted leading-relaxed">
              In-store cashiers reported that simple flash-ID offers reduced counter friction by 65% compared to multi-step mobile app discount codes.
            </p>
            <div className="pt-2 border-t border-hairline/60 flex items-center gap-1.5 text-[11px] text-muted font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              <span>Operational Guideline Retained</span>
            </div>
          </div>
        </div>
      </section>

      {/* Backend Disconnected Alert (Only rendered if service is unreachable) */}
      {!loading && !isBackendAlive && (
        <div className="p-4 rounded-xl bg-surface border border-alert text-ink space-y-1">
          <div className="flex items-center gap-2 text-alert font-semibold text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>FastAPI Backend Service Offline</span>
          </div>
          <p className="text-xs text-muted">
            The frontend is operational, but cannot reach the local backend on port 8000. Start the server with: <code className="font-mono bg-surface-subtle px-1 py-0.5 rounded text-ink">uvicorn backend.app.main:app --port 8000</code>
          </p>
        </div>
      )}
    </div>
  );
}
