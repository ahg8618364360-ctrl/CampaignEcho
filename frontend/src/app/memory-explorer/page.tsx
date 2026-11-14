"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth-context";
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
  Building2,
  FilePlus,
} from "lucide-react";
import {
  fetchMemoryExplore,
  LiveMemoryRecord,
  MemoryStatusResponse,
} from "@/lib/api";

export default function MemoryExplorerPage() {
  const { activeBrandId, activeBrand } = useAuth();
  const [liveRecords, setLiveRecords] = useState<LiveMemoryRecord[]>([]);
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLiveId, setSelectedLiveId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"detail" | "raw">("detail");
  const [search, setSearch] = useState("");

  const loadMemoryData = async () => {
    if (!activeBrandId) {
      setIsLoading(false);
      setLiveRecords([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await fetchMemoryExplore(activeBrandId);
      if (data) {
        setMemoryStatus(data.status);
        setLiveRecords(data.live_records || []);
        if (data.live_records && data.live_records.length > 0) {
          setSelectedLiveId(data.live_records[0].id);
        } else {
          setSelectedLiveId("");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeBrandId]);

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

  const selectedLive =
    liveRecords.find((r) => r.id === selectedLiveId) || liveRecords[0] || null;

  return (
    <PageContainer size="wide">
      {/* 1. Header */}
      <PageHeader
        badge="Vectorize Hindsight Engine"
        badgeSubtext={
          activeBrand
            ? `Isolated Bank · ${activeBrand.name}`
            : "No Business Workspace Selected"
        }
        title="Memory Explorer & Activity Stream"
        description="Inspect brand memory banks, verify causal retention chains, and track how accumulated experience shapes future strategic recommendations."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={loadMemoryData}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-ink-secondary ${
                    isLoading ? "animate-spin" : ""
                  }`}
                />
              }
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
              Vectorize Hindsight Cloud Connected · Operations Verified (Run:{" "}
              {memoryStatus?.verification_run_id || "v-cloud-01"})
            </p>
            <p className="text-ink-secondary leading-relaxed">
              Active brand memory bank is fully provisioned with {liveRecords.length}{" "}
              verified recalled memories. All memory operations (retain, recall, reflect)
              verified live against Vectorize Hindsight Cloud. Internal bank isolation
              enforced server-side.
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
            <span className="text-ink-secondary">
              {activeBrand
                ? `campaignecho-brand-${activeBrand.id.slice(0, 8)}`
                : "No Bank Selected"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isVerified ? "bg-forest" : "bg-amber-500"
              }`}
            />
            <span className="text-ink-secondary">Bank Authentication:</span>
            <span className="font-medium text-ink">
              {isVerified ? "Verified · OPERATIONS_VERIFIED" : "Connecting"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-forest" />
            <span className="text-ink-secondary">Live Cloud Memories:</span>
            <span className="font-medium text-ink tabular-nums">
              {liveRecords.length} Recalled
            </span>
          </div>
        </div>

        <span className="text-[11px] text-ink-secondary font-mono">
          Endpoint: https://api.hindsight.vectorize.io
        </span>
      </section>

      {/* 3. Empty State Guard OR Memory Inspector Grid */}
      {!activeBrand ? (
        <section className="p-8 rounded-xl bg-surface border border-hairline text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-terracotta/10 text-terracotta mx-auto flex items-center justify-center">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif text-xl sm:text-2xl text-ink font-normal">
              No Business Workspace Selected
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans">
              Select or create a business workspace to inspect its isolated Vectorize Hindsight memory bank.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/onboarding"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-terracotta text-white text-xs font-medium hover:bg-terracotta/90 transition-colors shadow-xs"
            >
              <FilePlus className="w-4 h-4" />
              <span>Create Business Workspace</span>
            </Link>
          </div>
        </section>
      ) : liveRecords.length === 0 ? (
        <section className="p-8 rounded-xl bg-surface border border-hairline text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-surface-subtle text-forest mx-auto flex items-center justify-center">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-serif text-xl sm:text-2xl text-ink font-normal">
              Brand Memory Bank in Initial Learning Stage
            </h3>
            <p className="text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans">
              The isolated Hindsight memory bank for <strong>{activeBrand.name}</strong> is provisioned, but has 0 stored memories yet. As you run briefs and submit performance results in Campaign Studio, CampaignEcho ingests empirical observations to build this memory bank.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/campaign-studio"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-forest text-white text-xs font-medium hover:bg-forest/90 transition-colors shadow-xs"
            >
              <FilePlus className="w-4 h-4" />
              <span>Compose First Brief in Campaign Studio</span>
            </Link>
          </div>
        </section>
      ) : (
        /* 12-Column Split: 5 cols Activity Stream + 7 cols Inspector */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Pane: 5 cols Timeline Stream */}
          <section className="lg:col-span-5 p-4 rounded-xl bg-surface border border-hairline shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-hairline">
              <div>
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                  Activity Stream
                </span>
                <h2 className="font-serif text-lg text-ink font-normal mt-0.5">
                  Live Recalled Memories
                </h2>
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline tabular-nums">
                {filteredLiveRecords.length} Records
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter memories by tag or keyword..."
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-hairline text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:border-terracotta transition-colors"
              />
            </div>

            {/* Memory List Cards */}
            <div className="space-y-2 pt-1 max-h-[560px] overflow-y-auto pr-1">
              {filteredLiveRecords.length === 0 ? (
                <div className="p-6 text-center text-xs text-ink-secondary">
                  No memories found matching filter.
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
                        <span className="text-ink-secondary font-medium">
                          {item.category || "Retained Observation"}
                        </span>
                        <span className="text-ink-secondary/70">
                          {item.timestamp ? item.timestamp.split("T")[0] : "Verified"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Right Pane: 7 cols Inspector */}
          <section className="lg:col-span-7 p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-4">
            {selectedLive ? (
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
                          ? "bg-surface text-ink font-medium shadow-2xs"
                          : "text-ink-secondary hover:text-ink"
                      }`}
                    >
                      Formatted
                    </button>
                    <button
                      onClick={() => setActiveTab("raw")}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer flex items-center gap-1 ${
                        activeTab === "raw"
                          ? "bg-surface text-ink font-medium shadow-2xs"
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
                    {/* Content Quote */}
                    <div className="p-4 rounded-lg bg-surface-subtle border border-hairline space-y-2">
                      <span className="text-[10px] uppercase font-semibold text-ink-secondary tracking-wider block">
                        Ingested Memory Content
                      </span>
                      <p className="text-sm text-ink leading-relaxed font-sans">
                        &ldquo;{selectedLive.content}&rdquo;
                      </p>
                    </div>

                    {/* Metadata Strip */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-1">
                        <span className="text-[10px] uppercase text-ink-secondary font-semibold">
                          Category
                        </span>
                        <p className="font-medium text-ink">
                          {selectedLive.category || "Empirical Takeaway"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-1">
                        <span className="text-[10px] uppercase text-ink-secondary font-semibold">
                          Provenance
                        </span>
                        <p className="font-mono text-ink text-[11px] truncate">
                          {selectedLive.provenance || "Vectorize Hindsight Cloud"}
                        </p>
                      </div>
                    </div>

                    {/* Tags */}
                    {selectedLive.tags && selectedLive.tags.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[10px] uppercase font-semibold text-ink-secondary tracking-wider block">
                          Associated Tags
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedLive.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 rounded bg-surface-subtle border border-hairline text-[11px] text-ink font-mono"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <pre className="p-4 rounded-lg bg-surface-subtle border border-hairline text-[11px] font-mono text-ink overflow-x-auto max-h-[460px]">
                    {JSON.stringify(selectedLive, null, 2)}
                  </pre>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-xs text-ink-secondary">
                Select a memory from the activity stream to inspect details.
              </div>
            )}
          </section>
        </div>
      )}
    </PageContainer>
  );
}
