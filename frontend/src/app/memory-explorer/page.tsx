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
  Lightbulb,
  Search,
  Filter,
  ArrowRight,
  Database,
  Code,
  Tag,
  Clock,
  ExternalLink,
  Info,
} from "lucide-react";

interface MemoryItem {
  id: string;
  operation: "aretain" | "arecall" | "areflect";
  title: string;
  timestamp: string;
  category: "Observed Performance" | "Negative Constraint" | "Operational Guideline";
  content: string;
  causalFactor: string;
  bankId: string;
  isSynthetic: boolean;
  metadata: {
    campaignRef?: string;
    confidence: number;
    tags: string[];
    provenance: string;
  };
}

const MEMORY_ITEMS: MemoryItem[] = [
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
    bankId: "campaignecho-brand-b0f7",
    isSynthetic: true,
    metadata: {
      campaignRef: "camp-001",
      confidence: 0.94,
      tags: ["late-night", "food-prep", "bogo", "video-reels"],
      provenance: "Synthetic demonstration data — not yet verified as retained in Hindsight",
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
    bankId: "campaignecho-brand-b0f7",
    isSynthetic: true,
    metadata: {
      campaignRef: "camp-002",
      confidence: 0.98,
      tags: ["negative-constraint", "pricing-friction", "avoid-gourmet"],
      provenance: "Synthetic demonstration data — not yet verified as retained in Hindsight",
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
    bankId: "campaignecho-brand-b0f7",
    isSynthetic: true,
    metadata: {
      campaignRef: "camp-003",
      confidence: 0.91,
      tags: ["operational", "counter-speed", "friction-reduction"],
      provenance: "Synthetic demonstration data — not yet verified as retained in Hindsight",
    },
  },
];

export default function MemoryExplorerPage() {
  const [selectedId, setSelectedId] = useState<string>("mem-0891");
  const [activeTab, setActiveTab] = useState<"detail" | "raw">("detail");
  const [search, setSearch] = useState("");

  const selectedMemory = MEMORY_ITEMS.find((m) => m.id === selectedId) || MEMORY_ITEMS[0];

  const filteredItems = MEMORY_ITEMS.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.id.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  return (
    <PageContainer size="wide">
      {/* 1. Header */}
      <PageHeader
        badge="Vectorize Hindsight Engine"
        badgeSubtext="Demonstration Memory Workspace"
        title="Memory Explorer & Activity Stream"
        description="Inspect brand memory banks, verify causal retention chains, and track how accumulated experience shapes future strategic recommendations."
        actions={
          <Button
            variant="secondary"
            href="/campaign-history"
            icon={<BrainCircuit className="w-3.5 h-3.5 text-ink-secondary" />}
          >
            Open Campaign Ledger
          </Button>
        }
      />

      {/* Truthful Status & Synthetic Fixture Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-ink font-sans">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-semibold text-amber-900">
            Synthetic Demonstration Data — Live Memory Operations Pending Authentication
          </p>
          <p className="text-ink-secondary leading-relaxed">
            The items displayed in this workspace are synthetic demo fixtures representing The Taco Syndicate. Vectorize Hindsight Cloud is reachable, but live bank provisioning and retain operations require configuring <code className="font-mono bg-surface px-1 py-0.5 rounded text-ink">HINDSIGHT_API_KEY</code> in <code className="font-mono bg-surface px-1 py-0.5 rounded text-ink">.env</code>.
          </p>
        </div>
      </div>

      {/* 2. Bank Health & Architectural Isolation Strip */}
      <section className="px-4 py-2.5 rounded-xl bg-surface border border-hairline flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs text-xs font-sans">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-forest" />
            <span className="font-medium text-ink">Architectural Bank:</span>
            <span className="font-mono text-ink-secondary">campaignecho-brand-b0f7</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-ink-secondary">Bank Authentication:</span>
            <span className="font-medium text-ink">API Key Required</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-terracotta" />
            <span className="text-ink-secondary">Sample Fixtures:</span>
            <span className="font-medium text-ink tabular-nums">3 Demo Items</span>
          </div>
        </div>

        <span className="text-[11px] text-ink-secondary font-mono">
          Endpoint: https://api.hindsight.vectorize.io
        </span>
      </section>

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
                Demonstration Fixtures
              </h2>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline tabular-nums">
              {filteredItems.length} Fixtures
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter memory stream..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-hairline text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>

          {/* Memory List Cards */}
          <div className="space-y-2 pt-1">
            {filteredItems.map((item) => {
              const isSelected = item.id === selectedId;
              const isSuccess = item.category === "Observed Performance";
              const isMistake = item.category === "Negative Constraint";

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface-subtle border-terracotta ring-1 ring-terracotta/30 shadow-xs"
                      : "bg-surface border-hairline hover:border-hairline-strong"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono mb-1">
                    <span className="text-ink-secondary font-medium">{item.id}</span>
                    <span className="px-1.5 py-0.2 rounded bg-surface border border-hairline uppercase text-[9px] font-sans">
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
            })}
          </div>
        </section>

        {/* Right Pane: 7 cols Inspector */}
        <section className="lg:col-span-7 p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-4">
          {/* Inspector Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-terracotta">
                  {selectedMemory.id}
                </span>
                <span className="text-xs text-ink-secondary font-sans">·</span>
                <span className="text-[11px] font-mono text-ink-secondary">
                  API: {selectedMemory.operation}
                </span>
                <span className="text-xs text-ink-secondary font-sans">·</span>
                <span className="text-[11px] text-amber-700 font-sans">
                  Synthetic Demo Fixture
                </span>
              </div>
              <h3 className="font-serif text-xl text-ink font-normal mt-0.5">
                {selectedMemory.title}
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
                    {selectedMemory.category}
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
                  {selectedMemory.content}
                </p>
              </div>

              {/* Causal Analysis */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                  Causal Reasoning &amp; Context
                </span>
                <p className="p-3.5 rounded-lg bg-surface border border-hairline text-ink-secondary leading-relaxed text-xs">
                  {selectedMemory.causalFactor}
                </p>
              </div>

              {/* Tags & Metadata */}
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-semibold text-ink uppercase tracking-wider block">
                  Semantic Indexing Tags
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedMemory.metadata.tags.map((tag) => (
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
                  [Demo Fixture · {selectedMemory.id}]
                </code>
              </div>
            </div>
          ) : (
            /* JSON View */
            <div className="rounded-lg bg-surface-subtle border border-hairline p-4 overflow-x-auto">
              <pre className="font-mono text-[11px] text-ink leading-relaxed">
                {JSON.stringify(selectedMemory, null, 2)}
              </pre>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
