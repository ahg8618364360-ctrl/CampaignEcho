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
    <PageContainer>
      {/* 1. Editorial Workspace Header */}
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

      {/* 2. Workspace Readiness Strip (Compact Horizontal Summary) */}
      <section className="p-4 rounded-xl bg-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
          <span className="font-medium text-ink flex items-center gap-1.5 font-sans">
            <Compass className="w-4 h-4 text-terracotta" />
            <span>Workspace Readiness</span>
          </span>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendAlive ? "bg-forest" : "bg-alert"
              }`}
            />
            <span className="text-ink-secondary">FastAPI Backend:</span>
            <span className="font-medium text-ink tabular-nums">
              {loading ? "Checking..." : isBackendAlive ? `Live (${health?.latencyMs}ms)` : "Offline"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isDbConnected ? "bg-forest" : "bg-alert"
              }`}
            />
            <span className="text-ink-secondary">SQLite Store:</span>
            <span className="font-medium text-ink">
              {loading ? "Checking..." : isDbConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="flex items-center gap-2 text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-hairline" />
            <span>Memory Engine:</span>
            <span className="text-ink-secondary">Initialization Queued</span>
          </div>

          <div className="flex items-center gap-2 text-ink-secondary">
            <span className="w-2 h-2 rounded-full bg-hairline" />
            <span>LLM Synthesis:</span>
            <span className="text-ink-secondary">Engine Dependent</span>
          </div>
        </div>

        <button
          onClick={refreshHealth}
          disabled={loading}
          className="self-end md:self-auto text-xs text-ink-secondary hover:text-ink flex items-center gap-1 px-2.5 py-1 rounded border border-hairline/60 bg-surface-subtle transition-colors disabled:opacity-50"
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
              <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-secondary">
                Brand Intelligence Profile
              </span>
              <h2 className="font-serif text-2xl text-ink font-normal mt-1">
                The Taco Syndicate
              </h2>
            </div>
            <Link
              href="/brands"
              className="text-xs text-terracotta hover:underline flex items-center gap-1 font-medium font-sans"
            >
              <span>Edit Brand Voice</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <p className="text-sm text-ink-secondary leading-relaxed font-sans">
            Authentic Mexican street tacos, late-night burritos, and Mexican sodas targeted at undergraduate and graduate students near campus. Focuses on high-energy, relatable food utility.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-hairline/60 text-xs">
            <div>
              <p className="text-ink-secondary font-medium mb-1 font-sans">Target Audience</p>
              <p className="text-ink font-medium leading-normal font-sans">
                University students (18–24), value-conscious, active after 9 PM.
              </p>
            </div>
            <div>
              <p className="text-ink-secondary font-medium mb-1 font-sans">Brand Voice</p>
              <p className="text-ink font-medium leading-normal font-sans">
                Energetic, authentic, witty, zero corporate pretension.
              </p>
            </div>
            <div>
              <p className="text-ink-secondary font-medium mb-1 font-sans">Operational Market</p>
              <p className="text-ink font-medium leading-normal font-sans">
                Austin, TX (West Campus Corridor)
              </p>
            </div>
            <div>
              <p className="text-ink-secondary font-medium mb-1 font-sans">Negative Constraint</p>
              <p className="text-ink font-medium leading-normal font-sans">
                No fine-dining aesthetics; no alcohol promos in student campaigns.
              </p>
            </div>
          </div>
        </div>

        {/* Learning Posture & Memory Isolation Summary */}
        <div className="p-6 rounded-xl bg-surface-subtle border border-hairline flex flex-col justify-between shadow-xs">
          <div className="space-y-3">
            <span className="text-[11px] font-sans font-semibold uppercase tracking-wider text-ink-secondary">
              Memory Posture
            </span>
            <h3 className="font-serif text-xl text-ink font-normal">
              Brand Isolation Guarantee
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Memories are locked into a dedicated memory bank strictly scoped to this brand. Insights from other restaurants or agency clients never cross tenant boundaries.
            </p>
          </div>

          <div className="pt-4 border-t border-hairline/80 space-y-2">
            <div className="flex items-center gap-2 text-xs text-forest font-medium font-sans">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>1:1 Bank Mapping Verified</span>
            </div>
            <p className="text-[11px] text-ink-secondary font-sans">
              Internal Bank: <span className="font-mono text-ink">campaignecho-brand-b0f7</span>
            </p>
          </div>
        </div>
      </section>

      {/* 4. Campaign Learning Ledger (The Editorial Activity Stream) */}
      <section className="space-y-4">
        <SectionHeading
          title="Campaign Learning Ledger"
          description="Accumulated observations, performance takeaways, and client feedback retained in Hindsight."
          action={
            <Link
              href="/campaign-history"
              className="text-xs text-terracotta hover:underline flex items-center gap-1 font-medium font-sans"
            >
              <span>View All Campaigns</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        />

        {/* Synthetic Demo Historical Lessons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border font-sans">
                Proven Success
              </span>
              <span className="text-xs text-ink-secondary font-sans">Campaign #1</span>
            </div>
            <h3 className="text-sm font-semibold text-ink font-sans">
              Late Night Burrito Drops
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Flash BOGO promotions after 9 PM drove 380 redemptions. Visual macro clips of food preparation outperformed graphic carousels by 4.2x engagement.
            </p>
            <div className="pt-2 border-t border-hairline/60 flex items-center gap-1.5 text-[11px] text-forest font-medium font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Retained in Memory</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-terracotta-subtle text-terracotta border border-terracotta-border font-sans">
                Documented Mistake
              </span>
              <span className="text-xs text-ink-secondary font-sans">Campaign #2</span>
            </div>
            <h3 className="text-sm font-semibold text-ink font-sans">
              Gourmet Truffle Tasting
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              High budget ad spend produced near-zero student conversions. Audience feedback noted upscale gourmet framing felt pretentious and unaffordable.
            </p>
            <div className="pt-2 border-t border-hairline/60 flex items-center gap-1.5 text-[11px] text-terracotta font-medium font-sans">
              <Lightbulb className="w-3.5 h-3.5" />
              <span>Negative Pattern Avoidance</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline font-sans">
                Operational Takeaway
              </span>
              <span className="text-xs text-ink-secondary font-sans">Post-Mortem Note</span>
            </div>
            <h3 className="text-sm font-semibold text-ink font-sans">
              Flash Student ID Redemption
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              In-store cashiers reported that simple flash-ID offers reduced counter friction by 65% compared to multi-step mobile app discount codes.
            </p>
            <div className="pt-2 border-t border-hairline/60 flex items-center gap-1.5 text-[11px] text-ink-secondary font-medium font-sans">
              <CheckCircle2 className="w-3.5 h-3.5 text-forest" />
              <span>Operational Guideline Retained</span>
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
