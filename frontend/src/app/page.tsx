"use client";

import { useEffect, useState } from "react";
import { checkReadiness, type HealthReadyResponse } from "@/lib/api";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import {
  Plus,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Compass,
  AlertCircle,
  Lightbulb,
  ExternalLink,
  Layers,
  Sparkle,
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
    <PageContainer size="wide">
      {/* 1. Compact Editorial Workspace Header */}
      <PageHeader
        badge="Brand Desk · The Taco Syndicate"
        badgeSubtext="Synthetic Demo Fixture"
        title="Your marketing workspace"
        description="Every campaign teaches the next. CampaignEcho remembers historical results, audience reactions, and brand constraints to formulate sharper strategies."
        actions={
          <>
            <Button
              variant="primary"
              href="/campaign-studio"
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              New Campaign Brief
            </Button>
            <Button
              variant="secondary"
              href="/memory-explorer"
              icon={<BrainCircuit className="w-3.5 h-3.5 text-ink-secondary" />}
            >
              Inspect Memories
            </Button>
          </>
        }
      />

      {/* 2. Workspace Readiness Strip (Compact Horizontal Summary ~40px) */}
      <section className="px-4 py-2.5 rounded-xl bg-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="font-medium text-ink flex items-center gap-1.5 font-sans">
            <Compass className="w-3.5 h-3.5 text-terracotta" />
            <span>Workspace Readiness</span>
          </span>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendAlive ? "bg-forest" : "bg-alert"
              }`}
            />
            <span className="text-ink-secondary">FastAPI:</span>
            <span className="font-medium text-ink tabular-nums">
              {loading ? "Checking..." : isBackendAlive ? `Live (${health?.latencyMs}ms)` : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isDbConnected ? "bg-forest" : "bg-alert"
              }`}
            />
            <span className="text-ink-secondary">Database:</span>
            <span className="font-medium text-ink">
              {loading ? "Checking..." : isDbConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-forest" />
            <span>Hindsight Engine:</span>
            <span className="font-medium text-ink">Ready (v1.2.0)</span>
          </div>

          <div className="flex items-center gap-1.5 text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-hairline" />
            <span>LLM Synthesis:</span>
            <span className="text-ink-secondary">Groq M3 Target</span>
          </div>
        </div>

        <button
          onClick={refreshHealth}
          disabled={loading}
          className="self-end md:self-auto text-xs text-ink-secondary hover:text-ink flex items-center gap-1 px-2.5 py-1 rounded border border-hairline/60 bg-surface-subtle transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>Verify</span>
        </button>
      </section>

      {/* 3. 12-Column Grid: Brand Intelligence Profile (8-col) + Memory Posture (4-col) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Brand Intelligence Profile (8-col) */}
        <div className="lg:col-span-8 p-5 rounded-xl bg-surface border border-hairline flex flex-col justify-between shadow-xs space-y-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                  Brand Intelligence Profile
                </span>
                <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal mt-0.5">
                  The Taco Syndicate
                </h2>
              </div>
              <Link
                href="/brands"
                className="text-xs text-terracotta hover:underline flex items-center gap-1 font-medium font-sans shrink-0 pt-1"
              >
                <span>Edit Brand Voice</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans max-w-2xl">
              Authentic Mexican street tacos, late-night burritos, and Mexican sodas targeted at undergraduate and graduate students near campus. Focuses on high-energy, relatable food utility.
            </p>
          </div>

          {/* 4-Stat Corridor Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-hairline/60 text-xs">
            <div className="p-2.5 rounded-lg bg-surface-subtle border border-hairline/60">
              <p className="text-[11px] text-ink-secondary font-medium font-sans mb-0.5">Target Audience</p>
              <p className="text-xs text-ink font-medium leading-snug font-sans">
                University students (18–24), value-conscious, active after 9 PM.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-subtle border border-hairline/60">
              <p className="text-[11px] text-ink-secondary font-medium font-sans mb-0.5">Brand Voice</p>
              <p className="text-xs text-ink font-medium leading-snug font-sans">
                Energetic, authentic, witty, zero corporate pretension.
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-subtle border border-hairline/60">
              <p className="text-[11px] text-ink-secondary font-medium font-sans mb-0.5">Operational Market</p>
              <p className="text-xs text-ink font-medium leading-snug font-sans">
                Austin, TX (West Campus Corridor)
              </p>
            </div>
            <div className="p-2.5 rounded-lg bg-surface-subtle border border-hairline/60">
              <p className="text-[11px] text-ink-secondary font-medium font-sans mb-0.5">Negative Constraint</p>
              <p className="text-xs text-ink font-medium leading-snug font-sans">
                No fine-dining aesthetics; no alcohol promos in campus campaigns.
              </p>
            </div>
          </div>
        </div>

        {/* Learning Posture & Memory Isolation Summary (4-col) */}
        <div className="lg:col-span-4 p-5 rounded-xl bg-surface-subtle border border-hairline flex flex-col justify-between shadow-xs space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Memory Posture
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border">
                Isolated 1:1
              </span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl text-ink font-normal">
              Brand Isolation Guarantee
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Memories are locked into a dedicated memory bank strictly scoped to this brand. Insights from other restaurants or agency clients never cross tenant boundaries.
            </p>
          </div>

          <div className="pt-3 border-t border-hairline/80 space-y-2.5">
            <div className="flex items-center gap-2 text-xs text-forest font-medium font-sans">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Dedicated Bank Mapping Active</span>
            </div>
            <div className="p-2 rounded bg-surface border border-hairline text-[11px] text-ink-secondary flex items-center justify-between font-sans">
              <span>Hindsight Tenant:</span>
              <span className="font-medium text-ink">Strict Server Isolation</span>
            </div>
            <Link
              href="/memory-explorer"
              className="text-xs text-ink hover:text-terracotta flex items-center justify-between font-medium font-sans pt-1 transition-colors"
            >
              <span>Explore Memory Graph</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Campaign Learning Ledger (Information-Dense Structured Table / Cards) */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-[22px] text-ink font-normal leading-snug">
              Campaign Learning Ledger
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5 font-sans">
              Accumulated observations, performance takeaways, and client feedback retained in Hindsight memory.
            </p>
          </div>
          <Link
            href="/campaign-history"
            className="text-xs text-terracotta hover:underline flex items-center gap-1 font-medium font-sans self-start sm:self-auto"
          >
            <span>Open Full History Ledger</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Dense 3-Card Grid with Provenance Tags */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1 */}
          <div className="p-4 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border font-sans">
                  Proven Success
                </span>
                <span className="text-[11px] text-ink-secondary font-sans tabular-nums">Campaign #1</span>
              </div>
              <h3 className="text-sm font-semibold text-ink font-sans">
                Late Night Burrito Drops
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Flash BOGO promotions after 9 PM drove 380 redemptions. Visual macro clips of food preparation outperformed graphic carousels by 4.2x engagement.
              </p>
            </div>
            <div className="pt-2.5 border-t border-hairline/60 flex items-center justify-between text-[11px] font-sans">
              <span className="flex items-center gap-1 text-forest font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Retained in Memory</span>
              </span>
              <span className="text-ink-secondary tabular-nums">380 Redemptions</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="p-4 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-terracotta-subtle text-terracotta border border-terracotta-border font-sans">
                  Documented Mistake
                </span>
                <span className="text-[11px] text-ink-secondary font-sans tabular-nums">Campaign #2</span>
              </div>
              <h3 className="text-sm font-semibold text-ink font-sans">
                Gourmet Truffle Tasting
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                High budget ad spend produced near-zero student conversions. Audience feedback noted upscale gourmet framing felt pretentious and unaffordable.
              </p>
            </div>
            <div className="pt-2.5 border-t border-hairline/60 flex items-center justify-between text-[11px] font-sans">
              <span className="flex items-center gap-1 text-terracotta font-medium">
                <Lightbulb className="w-3.5 h-3.5" />
                <span>Negative Constraint</span>
              </span>
              <span className="text-ink-secondary">Avoid Upscale</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="p-4 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline font-sans">
                  Operational Takeaway
                </span>
                <span className="text-[11px] text-ink-secondary font-sans tabular-nums">Post-Mortem</span>
              </div>
              <h3 className="text-sm font-semibold text-ink font-sans">
                Flash Student ID Redemption
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                In-store cashiers reported that simple flash-ID offers reduced counter friction by 65% compared to multi-step mobile app discount codes.
              </p>
            </div>
            <div className="pt-2.5 border-t border-hairline/60 flex items-center justify-between text-[11px] font-sans">
              <span className="flex items-center gap-1 text-forest font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Operational Guideline</span>
              </span>
              <span className="text-ink-secondary">-65% Counter Friction</span>
            </div>
          </div>
        </div>
      </section>

      {/* Backend Disconnected Alert (Only rendered if service is unreachable) */}
      {!loading && !isBackendAlive && (
        <div className="p-4 rounded-xl bg-surface border border-alert text-ink space-y-1">
          <div className="flex items-center gap-2 text-alert font-semibold text-sm font-sans">
            <AlertCircle className="w-4 h-4" />
            <span>FastAPI Backend Service Offline</span>
          </div>
          <p className="text-xs text-ink-secondary font-sans">
            The frontend is operational, but cannot reach the local backend on port 8000. Start the server with: <code className="font-mono bg-surface-subtle px-1 py-0.5 rounded text-ink">uvicorn backend.app.main:app --port 8000</code>
          </p>
        </div>
      )}
    </PageContainer>
  );
}
