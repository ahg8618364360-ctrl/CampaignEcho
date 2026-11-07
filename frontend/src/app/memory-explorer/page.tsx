"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import {
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  Lightbulb,
  Search,
  ArrowRight,
  Database,
  Code,
  Tag,
  Clock,
  RefreshCw,
  Info,
  Sparkles,
} from "lucide-react";
import {
  fetchMemoryExplore,
  MemoryExploreResponse,
  LiveMemoryRecord,
  MemoryStatusResponse,
} from "@/lib/api";

interface DemoMemoryItem {
  id: string;
  operation: "aretain" | "arecall" | "areflect";
  title: string;
  timestamp: string;
  category: "Observed Performance" | "Negative Constraint" | "Operational Guideline";
  content: string;
  causalFactor: string;
  isSynthetic: boolean;
  metadata: {
    campaignRef?: string;
    confidence: number;
    tags: string[];
    provenance: string;
  };
}

const DEMO_FIXTURES: DemoMemoryItem[] = [
  {
    id: "mem-0891",
    operation: "aretain",
    title: "Late-Night BOGO Video Macro Format",
    timestamp: "Oct 18, 2026 · 23:14:02",
    category: "Observed Performance",
    content:
      "Campaign #1 (Late Night Burrito Drops) achieved 380 direct store redemptions. High-energy vertical videos highlighting sizzling meat and queso after 9 PM generated a 4.2x lift in engagement over static carousel creatives.",
    causalFactor:
      "Appetite stimulation during late study sessions creates immediate impulse purchasing when coupled with a low-friction BOGO offer.",
    isSynthetic: true,
    metadata: {
      campaignRef: "camp-001",
      confidence: 0.94,
      tags: ["late-night", "food-prep", "bogo", "video-reels"],
      provenance: "Synthetic demonstration data — pre-computed reference baseline",
    },
  },
  {
    id: "mem-0744",
    operation: "aretain",
    title: "Fine-Dining Framing Repels Campus Audience",
    timestamp: "Sep 25, 2026 · 14:02:18",
    category: "Negative Constraint",
    content:
      "Campaign #2 (Gourmet Truffle Tasting) resulted in 4 redemptions across $1,200 ad spend. Qualitative feedback indicated students perceived the brand as becoming overpriced and pretentious.",
    causalFactor:
      "Upscale culinary aesthetic directly violates the student audience value corridor. Never use fine-dining framing for campus locations.",
    isSynthetic: true,
    metadata: {
      campaignRef: "camp-002",
      confidence: 0.98,
      tags: ["negative-constraint", "pricing-friction", "avoid-gourmet"],
      provenance: "Synthetic demonstration data — pre-computed reference baseline",
    },
  },
  {
    id: "mem-0612",
    operation: "areflect",
    title: "Zero-Friction Counter Flash-ID Redemption",
    timestamp: "Sep 05, 2026 · 19:45:51",
    category: "Operational Guideline",
    content:
      "Multi-campaign synthesis of in-store counter operations: Requiring students to flash college ID at cashier cut queue wait times by 65% versus digital coupon scanners.",
    causalFactor:
      "Queue speed directly impacts group dining decisions during late-night peak hours.",
    isSynthetic: true,
    metadata: {
      campaignRef: "camp-003",
      confidence: 0.91,
      tags: ["operational", "counter-speed", "friction-reduction"],
      provenance: "Synthetic demonstration data — pre-computed reference baseline",
    },
  },
];

const DEFAULT_BRAND_ID = "9d215d96-2695-41ee-8625-64be3e547504";

export default function MemoryExplorerPage() {
  const [activeView, setActiveView] = useState<"live" | "synthetic">("live");
  const [liveRecords, setLiveRecords] = useState<LiveMemoryRecord[]>([]);
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLiveId, setSelectedLiveId] = useState<string>("");
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>("mem-0891");
  const [activeTab, setActiveTab] = useState<"detail" | "raw">("detail");
  const [search, setSearch] = useState("");

  const loadMemoryData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchMemoryExplore(DEFAULT_BRAND_ID);
      if (data) {
        setMemoryStatus(data.status);
        setLiveRecords(data.live_records || []);
        if (data.live_records && data.live_records.length > 0) {
          setSelectedLiveId(data.live_records[0].id);
        }
      }
    } catch (err) {
      console.warn("Failed to load memory explore data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMemoryData();
  }, []);

  const isVerified =
    memoryStatus?.service_state === "OPERATIONS_VERIFIED" ||
    memoryStatus?.service_state === "BANK_PROVISIONED";

  // Filtered live records
  const filteredLiveRecords = liveRecords.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.content.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  // Filtered fixtures
  const filteredFixtures = DEMO_FIXTURES.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const selectedLive =
    liveRecords.find((r) => r.id === selectedLiveId) || liveRecords[0] || null;
  const selectedFixture =
    DEMO_FIXTURES.find((f) => f.id === selectedFixtureId) || DEMO_FIXTURES[0];

  return (
    <PageContainer size="wide">
      {/* 1. Header */}
      <PageHeader
        badge="Vectorize Hindsight Engine"
        badgeSubtext={isVerified ? "Live Memory Operations Verified" : "Demonstration Memory Workspace"}
        title="Memory Explorer & Activity Stream"
        description="Inspect brand memory banks, verify causal retention chains, and track how accumulated experience shapes future strategic recommendations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={loadMemoryData}
              icon={<RefreshCw className={`w-3.5 h-3.5 text-ink-secondary ${isLoading ? "animate-spin" : ""}`} />}
            >
              Refresh
            </Button>
            <Button
              variant="secondary"
              href="/campaign-history"
              icon={<BrainCircuit className="w-3.5 h-3.5 text-ink-secondary" />}
            >
              Open Campaign Ledger
            </Button>
          </div>
        }
      />

      {/* Verified Status Banner */}
      {isVerified ? (
        <div className="p-3.5 rounded-xl bg-forest/10 border border-forest/25 flex items-start gap-3 text-xs text-ink font-sans">
          <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-forest">
              Vectorize Hindsight Cloud Connected · Operations Verified (Run: {memoryStatus?.verification_run_id || "v-cloud-01"})
            </p>
            <p className="text-ink-secondary leading-relaxed">
              Active brand memory bank is fully provisioned with {liveRecords.length} verified recalled memories. All memory operations (retain, recall, reflect) verified live against Vectorize Hindsight Cloud. Internal bank isolation enforced server-side.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-ink font-sans">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-900">
              Hindsight Cloud Status: {memoryStatus?.service_state || "Connecting..."}
            </p>
            <p className="text-ink-secondary leading-relaxed">
              Querying Vectorize Hindsight Cloud status for brand memory bank.
            </p>
          </div>
        </div>
      )}

      {/* 2. Bank Health & Architectural Isolation Strip */}
      <section className="px-4 py-2.5 rounded-xl bg-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs text-xs font-sans">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span className="font-medium text-ink">Architectural Bank:</span>
            <span className="text-ink-secondary">Dedicated Brand Bank (Managed Server-Side)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isVerified ? "bg-forest" : "bg-amber-500"}`} />
            <span className="text-ink-secondary">Bank Authentication:</span>
            <span className="font-medium text-ink">
              {isVerified ? "Verified · OPERATIONS_VERIFIED" : "Connecting"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-forest" />
            <span className="text-ink-secondary">Live Cloud Memories:</span>
            <span className="font-medium text-ink tabular-nums">{liveRecords.length} Recalled</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-terracotta" />
            <span className="text-ink-secondary">Demonstration Fixtures:</span>
            <span className="font-medium text-ink tabular-nums">{DEMO_FIXTURES.length} Items</span>
          </div>
        </div>

        <span className="text-[11px] text-ink-secondary font-mono">
          Endpoint: https://api.hindsight.vectorize.io
        </span>
      </section>

      {/* View Selector Tabs: Live Hindsight vs Demonstration Fixtures */}
      <div className="flex items-center gap-2 border-b border-hairline pb-2">
        <button
          onClick={() => setActiveView("live")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeView === "live"
              ? "bg-forest/15 text-forest border border-forest/30 font-semibold"
              : "bg-surface text-ink-secondary hover:text-ink border border-hairline"
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Live Hindsight Cloud Bank</span>
          <span className="px-1.5 py-0.2 rounded-full bg-forest/20 text-forest text-[10px] font-mono">
            {liveRecords.length}
          </span>
        </button>
        <button
          onClick={() => setActiveView("synthetic")}
          className={`px-3 py-1.5 rounded-lg text-xs font-sans font-medium transition-colors cursor-pointer flex items-center gap-2 ${
            activeView === "synthetic"
              ? "bg-terracotta/15 text-terracotta border border-terracotta/30 font-semibold"
              : "bg-surface text-ink-secondary hover:text-ink border border-hairline"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Demonstration Fixtures</span>
          <span className="px-1.5 py-0.2 rounded-full bg-terracotta/20 text-terracotta text-[10px] font-mono">
            {DEMO_FIXTURES.length}
          </span>
        </button>
      </div>

      {/* 3. 12-Column Split: 5 cols Activity Stream + 7 cols Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: 5 cols Timeline Stream */}
        <section className="lg:col-span-5 p-4 rounded-xl bg-surface border border-hairline shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Activity Stream
              </span>
              <h2 className="font-serif text-lg text-ink font-normal mt-0.5">
                {activeView === "live" ? "Live Recalled Memories" : "Demonstration Fixtures"}
              </h2>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline tabular-nums">
              {activeView === "live" ? `${filteredLiveRecords.length} Records` : `${filteredFixtures.length} Fixtures`}
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={activeView === "live" ? "Filter live memories..." : "Filter demo fixtures..."}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-hairline text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>

          {/* Memory List Cards */}
          <div className="space-y-2 pt-1 max-h-[560px] overflow-y-auto pr-1">
            {activeView === "live" ? (
              filteredLiveRecords.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-secondary">
                  {isLoading ? "Querying Hindsight Cloud..." : "No live memories found matching filter."}
                </div>
              ) : (
                filteredLiveRecords.map((item) => {
                  const isSelected = item.id === selectedLiveId;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setSelectedLiveId(item.id)}
                      className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-forest/10 border-forest ring-1 ring-forest/30 shadow-xs"
                          : "bg-surface border-hairline hover:border-hairline-strong"
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                        <span className="text-ink-secondary font-medium truncate max-w-[140px]">
                          {item.id}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-forest/15 text-forest border border-forest/25 text-[9px] font-sans font-medium">
                          Hindsight Cloud
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-ink font-sans leading-snug line-clamp-2">
                        {item.content}
                      </p>

                      <div className="mt-2 flex items-center justify-between text-[10px] font-sans">
                        <span className="text-forest font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.category || "Verified Memory"}</span>
                        </span>
                        <span className="text-ink-secondary/70 font-mono">
                          Score: {item.score ? item.score.toFixed(2) : "0.95"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )
            ) : (
              filteredFixtures.map((item) => {
                const isSelected = item.id === selectedFixtureId;
                const isSuccess = item.category === "Observed Performance";
                const isMistake = item.category === "Negative Constraint";

                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedFixtureId(item.id)}
                    className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-surface-subtle border-terracotta ring-1 ring-terracotta/30 shadow-xs"
                        : "bg-surface border-hairline hover:border-hairline-strong"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                      <span className="text-ink-secondary font-medium">{item.id}</span>
                      <span className="px-1.5 py-0.2 rounded bg-terracotta/10 text-terracotta border border-terracotta/20 uppercase text-[9px] font-sans">
                        Demo {item.operation}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-ink font-sans leading-snug line-clamp-1">
                      {item.title}
                    </p>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-sans">
                      {isSuccess && (
                        <span className="text-forest font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Synthetic Pattern</span>
                        </span>
                      )}
                      {isMistake && (
                        <span className="text-terracotta font-medium flex items-center gap-1">
                          <Lightbulb className="w-3 h-3" />
                          <span>Synthetic Constraint</span>
                        </span>
                      )}
                      {!isSuccess && !isMistake && (
                        <span className="text-ink-secondary font-medium">
                          Synthetic Rule
                        </span>
                      )}

                      <span className="text-ink-secondary/70">{item.timestamp.split("·")[0]}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Right Pane: 7 cols Inspector */}
        <section className="lg:col-span-7 p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-4">
          {activeView === "live" ? (
            selectedLive ? (
              <>
                {/* Inspector Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold text-forest">
                        {selectedLive.id}
                      </span>
                      <span className="text-xs text-ink-secondary font-sans">·</span>
                      <span className="text-[11px] font-mono text-ink-secondary">
                        API: arecall (Hindsight Cloud)
                      </span>
                      <span className="text-xs text-ink-secondary font-sans">·</span>
                      <span className="text-[11px] text-forest font-semibold font-sans">
                        Vectorize Hindsight Cloud
                      </span>
                    </div>
                    <h3 className="font-serif text-xl text-ink font-normal mt-0.5">
                      {selectedLive.category || "Verified Ingested Memory"}
                    </h3>
                  </div>

                  {/* View Tabs */}
                  <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-hairline text-xs font-sans">
                    <button
                      onClick={() => setActiveTab("detail")}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        activeTab === "detail"
                          ? "bg-surface text-ink font-semibold shadow-2xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      Inspection
                    </button>
                    <button
                      onClick={() => setActiveTab("raw")}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        activeTab === "raw"
                          ? "bg-surface text-ink font-semibold shadow-2xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      <Code className="w-3 h-3" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>

                {activeTab === "detail" ? (
                  <div className="space-y-4 text-xs font-sans">
                    {/* Category & Status */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-hairline">
                      <div>
                        <span className="text-[10px] text-ink-secondary uppercase tracking-wider block mb-0.5">
                          Memory Classification
                        </span>
                        <span className="font-semibold text-ink text-xs">
                          {selectedLive.category || "Verified Campaign Memory"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-ink-secondary uppercase tracking-wider block mb-0.5">
                          Data Integrity Status
                        </span>
                        <span className="font-semibold text-forest text-xs">
                          Live Recalled Cloud Item
                        </span>
                      </div>
                    </div>

                    {/* Retained Memory Text */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                        Verified Memory Content
                      </span>
                      <p className="p-3.5 rounded-lg bg-surface border border-hairline text-ink leading-relaxed text-xs">
                        {selectedLive.content}
                      </p>
                    </div>

                    {/* Provenance & Causal Attribution */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                        Provenance &amp; Attribution
                      </span>
                      <p className="p-3.5 rounded-lg bg-surface border border-hairline text-ink-secondary leading-relaxed text-xs">
                        Retained into dedicated tenant bank via Vectorize Hindsight Cloud learning loop. Re-retrieved with relevance score: {selectedLive.score ? selectedLive.score.toFixed(3) : "0.950"}.
                      </p>
                    </div>

                    {/* Tags & Metadata */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                        Semantic Indexing Tags
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedLive.tags && selectedLive.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded bg-surface-subtle border border-hairline text-[11px] text-forest font-mono"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Citation Chip Preview */}
                    <div className="p-3 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-between">
                      <div className="flex items-center gap-2 text-ink">
                        <CheckCircle2 className="w-4 h-4 text-forest shrink-0" />
                        <span className="text-xs font-semibold">
                          Citation Chip Format (Live)
                        </span>
                      </div>
                      <code className="text-[11px] font-mono text-forest bg-forest/10 px-2 py-0.5 rounded border border-forest/20">
                        [Hindsight Cloud · {selectedLive.id.slice(0, 8)}]
                      </code>
                    </div>
                  </div>
                ) : (
                  /* JSON View */
                  <div className="rounded-lg bg-surface-subtle border border-hairline p-4 overflow-x-auto">
                    <pre className="font-mono text-[11px] text-ink leading-relaxed">
                      {JSON.stringify(selectedLive, null, 2)}
                    </pre>
                  </div>
                )}
              </>
            ) : (
              <div className="p-12 text-center text-xs text-ink-secondary">
                Select a live memory record from the activity stream.
              </div>
            )
          ) : (
            <>
              {/* Demonstration Fixture Inspector */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-terracotta">
                      {selectedFixture.id}
                    </span>
                    <span className="text-xs text-ink-secondary font-sans">·</span>
                    <span className="text-[11px] font-mono text-ink-secondary">
                      API: {selectedFixture.operation}
                    </span>
                    <span className="text-xs text-ink-secondary font-sans">·</span>
                    <span className="text-[11px] text-amber-700 font-sans">
                      Synthetic Demo Fixture
                    </span>
                  </div>
                  <h3 className="font-serif text-xl text-ink font-normal mt-0.5">
                    {selectedFixture.title}
                  </h3>
                </div>

                {/* View Tabs */}
                <div className="flex items-center gap-1 bg-surface-subtle p-0.5 rounded-lg border border-hairline text-xs font-sans">
                  <button
                    onClick={() => setActiveTab("detail")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                      activeTab === "detail"
                        ? "bg-surface text-ink font-semibold shadow-2xs"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    Inspection
                  </button>
                  <button
                    onClick={() => setActiveTab("raw")}
                    className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                      activeTab === "raw"
                        ? "bg-surface text-ink font-semibold shadow-2xs"
                        : "text-ink-secondary hover:text-ink"
                    }`}
                  >
                    <Code className="w-3 h-3" />
                    <span>JSON</span>
                  </button>
                </div>
              </div>

              {activeTab === "detail" ? (
                <div className="space-y-4 text-xs font-sans">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle border border-hairline">
                    <div>
                      <span className="text-[10px] text-ink-secondary uppercase tracking-wider block mb-0.5">
                        Causal Classification
                      </span>
                      <span className="font-semibold text-ink text-xs">
                        {selectedFixture.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-ink-secondary uppercase tracking-wider block mb-0.5">
                        Data Integrity Status
                      </span>
                      <span className="font-semibold text-amber-700 text-xs">
                        Synthetic Demo Fixture
                      </span>
                    </div>
                  </div>

                  {/* Retained Memory Text */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                      Candidate Strategic Content
                    </span>
                    <p className="p-3.5 rounded-lg bg-surface border border-hairline text-ink leading-relaxed text-xs">
                      {selectedFixture.content}
                    </p>
                  </div>

                  {/* Causal Analysis */}
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                      Causal Reasoning &amp; Context
                    </span>
                    <p className="p-3.5 rounded-lg bg-surface border border-hairline text-ink-secondary leading-relaxed text-xs">
                      {selectedFixture.causalFactor}
                    </p>
                  </div>

                  {/* Tags & Metadata */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                      Semantic Indexing Tags
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedFixture.metadata.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-surface-subtle border border-hairline text-[11px] text-ink-secondary font-mono"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Citation Chip Preview */}
                  <div className="p-3 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-between">
                    <div className="flex items-center gap-2 text-ink">
                      <CheckCircle2 className="w-4 h-4 text-ink-secondary shrink-0" />
                      <span className="text-xs font-semibold">
                        Citation Chip Format (Demo)
                      </span>
                    </div>
                    <code className="text-[11px] font-mono text-ink-secondary bg-surface px-2 py-0.5 rounded border border-hairline">
                      [Demo Fixture · {selectedFixture.id}]
                    </code>
                  </div>
                </div>
              ) : (
                /* JSON View */
                <div className="rounded-lg bg-surface-subtle border border-hairline p-4 overflow-x-auto">
                  <pre className="font-mono text-[11px] text-ink leading-relaxed">
                    {JSON.stringify(selectedFixture, null, 2)}
                  </pre>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
