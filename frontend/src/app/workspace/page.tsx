"use client";

import { useEffect, useState } from "react";
import {
  checkReadiness,
  fetchMemoryStatus,
  apiFetch,
  type HealthReadyResponse,
  type MemoryStatusResponse,
} from "@/lib/api";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth-context";
import {
  Plus,
  BrainCircuit,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Compass,
  AlertCircle,
  Building2,
  FilePlus,
  History,
  Info,
} from "lucide-react";

interface CampaignItem {
  id: string;
  name: string;
  status: string;
  platform: string;
  objective: string;
  created_at: string;
  is_synthetic: boolean;
  metrics?: {
    impressions?: number;
    conversions?: number;
    offer_redemptions?: number;
  };
  feedback?: Array<{
    lessons_learned?: string;
  }>;
  strategy_output?: {
    historical_rationale?: string;
  };
}

export default function WorkspacePage() {
  const { user, activeBrand, activeBrandId, brands } = useAuth();
  const [health, setHealth] = useState<HealthReadyResponse | null>(null);
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatusResponse | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = async () => {
    setLoading(true);
    try {
      const healthPromise = checkReadiness();
      const memPromise = activeBrandId
        ? fetchMemoryStatus(activeBrandId)
        : Promise.resolve(null);
      const campPromise = apiFetch("/campaigns", {
        cache: "no-store",
      })
        .then((r) => (r.ok ? r.json() : []))
        .catch(() => []);

      const [hData, mData, cData] = await Promise.all([
        healthPromise,
        memPromise,
        campPromise,
      ]);
      setHealth(hData);
      setMemoryStatus(mData);
      // Filter for active brand if present
      const brandCampaigns = activeBrandId
        ? cData.filter((c: any) => c.brand_id === activeBrandId)
        : cData;
      setCampaigns(brandCampaigns);
    } catch (err) {
      console.warn("Workspace data fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrandId]);

  const isBackendAlive = health?.status === "ready" || health?.status === "unready";
  const isDbConnected = health?.database === "connected";
  const serviceState = memoryStatus?.service_state || "NOT_CONFIGURED";
  const isHindsightAuth =
    serviceState === "OPERATIONS_VERIFIED" || serviceState === "BANK_PROVISIONED";

  return (
    <PageContainer size="wide">
      {/* 1. Compact Editorial Workspace Header */}
      <PageHeader
        badge={
          activeBrand
            ? `Workspace Desk · ${activeBrand.name}`
            : "Workspace Desk · No Business Selected"
        }
        badgeSubtext={
          activeBrand
            ? activeBrand.is_synthetic
              ? "Synthetic Benchmark Workspace"
              : "Private Brand Workspace"
            : user
            ? `Signed in as ${user.email}`
            : "Guest Mode"
        }
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
              Inspect Memory Bank
            </Button>
          </>
        }
      />

      {/* 2. Workspace Readiness Strip */}
      <section className="px-3.5 py-2 rounded-xl bg-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-2.5 shadow-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs">
          <span className="font-medium text-ink flex items-center gap-1.5 font-sans">
            <Compass className="w-3.5 h-3.5 text-terracotta" />
            <span>Workspace Readiness</span>
          </span>

          {/* FastAPI Backend */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendAlive ? "bg-forest" : "bg-alert"
              }`}
            />
            <span className="text-ink-secondary">FastAPI:</span>
            <span className="font-medium text-ink tabular-nums">
              {loading
                ? "Checking..."
                : isBackendAlive
                ? `Live (${health?.latencyMs}ms)`
                : "Offline"}
            </span>
          </div>

          {/* Database */}
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

          {/* Truthful Hindsight State */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isHindsightAuth
                  ? "bg-forest"
                  : serviceState === "AUTH_REQUIRED"
                  ? "bg-amber-500"
                  : "bg-hairline"
              }`}
            />
            <span className="text-ink-secondary">Hindsight Bank:</span>
            <span className="font-medium text-ink">
              {loading
                ? "Probing..."
                : !activeBrandId
                ? "Select a Brand"
                : serviceState === "OPERATIONS_VERIFIED"
                ? "Verified & Isolated"
                : serviceState === "BANK_PROVISIONED"
                ? "Provisioned"
                : serviceState === "AUTH_REQUIRED"
                ? "Auth Required"
                : serviceState === "ENDPOINT_UNREACHABLE"
                ? "Unreachable"
                : "Initial Stage"}
            </span>
          </div>

          {/* LLM Engine */}
          <div className="flex items-center gap-1.5 text-forest">
            <span className="w-2 h-2 rounded-full bg-forest" />
            <span className="text-ink-secondary">LLM Synthesis:</span>
            <span className="font-medium text-ink">Active (Z.ai GLM-4.5-Flash)</span>
          </div>
        </div>

        <button
          onClick={refreshAll}
          disabled={loading}
          className="self-end md:self-auto text-xs text-ink-secondary hover:text-ink flex items-center gap-1 px-2.5 py-1 rounded border border-hairline/60 bg-surface-subtle transition-colors disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          <span>Verify</span>
        </button>
      </section>

      {/* 3. Empty Brand Guard OR Active Brand Intelligence Profile */}
      {!activeBrand ? (
        <section className="p-8 rounded-xl bg-surface border border-hairline text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal">
              No Business Workspace Active
            </h2>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans">
              Create your business workspace to configure brand identity and connect a dedicated 1:1 Vectorize Hindsight cognitive memory bank.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta text-white text-xs font-medium hover:bg-terracotta/90 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Business Workspace</span>
            </Link>
          </div>
        </section>
      ) : (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Brand Intelligence Profile (8-col) */}
          <div className="lg:col-span-8 p-4 sm:p-4.5 rounded-xl bg-surface border border-hairline flex flex-col justify-between shadow-xs space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                    Brand Intelligence Profile
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl text-ink font-normal mt-0.5">
                    {activeBrand.name}
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
                {activeBrand.description || "No description provided."}
              </p>
            </div>

            {/* 4-Stat Corridor Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2 pt-2 border-t border-hairline/60 text-xs">
              <div className="p-2 rounded-lg bg-surface-subtle border border-hairline/60">
                <p className="text-[10px] text-ink-secondary font-medium font-sans mb-0.5">
                  Target Audience
                </p>
                <p className="text-[11px] text-ink font-medium leading-snug font-sans">
                  {activeBrand.target_audience || "Not configured"}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-surface-subtle border border-hairline/60">
                <p className="text-[10px] text-ink-secondary font-medium font-sans mb-0.5">
                  Brand Voice
                </p>
                <p className="text-[11px] text-ink font-medium leading-snug font-sans">
                  {activeBrand.brand_voice || "Not configured"}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-surface-subtle border border-hairline/60">
                <p className="text-[10px] text-ink-secondary font-medium font-sans mb-0.5">
                  Market Region
                </p>
                <p className="text-[11px] text-ink font-medium leading-snug font-sans">
                  {activeBrand.market_region || "Not configured"}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-surface-subtle border border-hairline/60">
                <p className="text-[10px] text-ink-secondary font-medium font-sans mb-0.5">
                  Negative Constraints
                </p>
                <p className="text-[11px] text-ink font-medium leading-snug font-sans truncate">
                  {activeBrand.restrictions || "None specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Learning Posture & Memory Isolation Summary (4-col) */}
          <div className="lg:col-span-4 p-4 sm:p-4.5 rounded-xl bg-surface-subtle border border-hairline flex flex-col justify-between shadow-xs space-y-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                  Memory Bank Status
                </span>
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface text-ink-secondary border border-hairline font-mono">
                  1:1 Isolation
                </span>
              </div>
              <h3 className="font-serif text-lg sm:text-xl text-ink font-normal">
                Dedicated Tenant Bank
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Memories are isolated per-brand in Vectorize Hindsight Cloud (<code className="font-mono text-[10px] text-ink">campaignecho-brand-{activeBrand.id.slice(0, 8)}</code>). Cross-brand leakage is strictly blocked.
              </p>
            </div>

            <div className="pt-2 border-t border-hairline/80 space-y-2 text-xs font-sans">
              <div className="flex items-center gap-2 text-forest font-medium">
                <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
                <span>
                  {activeBrand.is_synthetic
                    ? "Synthetic Reference Bank"
                    : "Live Isolated Bank Active"}
                </span>
              </div>
              <div className="p-2 rounded bg-surface border border-hairline text-[11px] text-ink-secondary flex items-center justify-between font-sans">
                <span>Total Stored Memories:</span>
                <span className="font-medium text-ink font-mono">
                  {memoryStatus?.memories_count ?? 0} items
                </span>
              </div>
              <Link
                href="/memory-explorer"
                className="text-xs text-ink hover:text-terracotta flex items-center justify-between font-medium font-sans pt-0.5 transition-colors"
              >
                <span>Inspect Stored Memory Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 4. Campaign Learning Ledger */}
      <section className="space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-xl sm:text-[22px] text-ink font-normal leading-snug">
              Campaign Learning Ledger
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5 font-sans">
              Historical campaigns and retained empirical learnings for this workspace.
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

        {campaigns.length === 0 ? (
          <div className="p-6 rounded-xl bg-surface border border-hairline text-center space-y-2.5 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-surface-subtle text-ink-secondary mx-auto flex items-center justify-center">
              <History className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink font-sans">
              No Campaign Records Yet
            </h3>
            <p className="text-xs text-ink-secondary max-w-md mx-auto leading-relaxed font-sans">
              Launch a brief in Campaign Studio to generate your first strategy. When you submit real campaign results, CampaignEcho retains takeaways to build your brand&apos;s memory bank.
            </p>
            <div className="pt-2">
              <Link
                href="/campaign-studio"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs font-medium text-ink hover:text-terracotta transition-colors shadow-xs"
              >
                <FilePlus className="w-3.5 h-3.5" />
                <span>Compose First Brief in Campaign Studio</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {campaigns.slice(0, 3).map((camp, idx) => {
              const lesson =
                camp.feedback && camp.feedback.length > 0
                  ? camp.feedback[0].lessons_learned
                  : camp.strategy_output?.historical_rationale ||
                    "Campaign strategy generated with Hindsight memory grounding.";
              const impressionsVal = camp.metrics?.impressions
                ? `${camp.metrics.impressions.toLocaleString()} views`
                : "Active Run";
              const redemptionsVal = camp.metrics?.offer_redemptions
                ? `${camp.metrics.offer_redemptions.toLocaleString()} redemptions`
                : camp.metrics?.conversions
                ? `${camp.metrics.conversions} conv.`
                : "In Progress";

              return (
                <div
                  key={camp.id}
                  className="p-4 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-surface-subtle text-forest border border-forest-border font-sans">
                        {camp.status === "COMPLETED" ? "Retained Memory" : "Active Strategy"}
                      </span>
                      <span className="text-[11px] text-ink-secondary font-sans tabular-nums">
                        #{idx + 1}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-ink font-sans truncate">
                      {camp.name}
                    </h3>
                    <p className="text-xs text-ink-secondary leading-relaxed font-sans line-clamp-3">
                      {lesson}
                    </p>
                  </div>
                  <div className="pt-2.5 border-t border-hairline/60 flex items-center justify-between text-[11px] font-sans">
                    <span className="text-ink-secondary">{camp.platform}</span>
                    <span className="text-ink font-medium tabular-nums">{impressionsVal}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Backend Disconnected Alert */}
      {!loading && !isBackendAlive && (
        <div className="p-4 rounded-xl bg-surface border border-alert text-ink space-y-1">
          <div className="flex items-center gap-2 text-alert font-semibold text-sm font-sans">
            <AlertCircle className="w-4 h-4" />
            <span>FastAPI Backend Service Offline</span>
          </div>
          <p className="text-xs text-ink-secondary font-sans">
            The frontend is operational, but cannot reach the local backend on port 8000. Start the server with:{" "}
            <code className="font-mono bg-surface-subtle px-1 py-0.5 rounded text-ink">
              uvicorn backend.app.main:app --port 8000
            </code>
          </p>
        </div>
      )}
    </PageContainer>
  );
}
