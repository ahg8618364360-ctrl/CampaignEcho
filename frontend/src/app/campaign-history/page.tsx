"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import {
  Plus,
  ArrowRight,
  CheckCircle2,
  Lightbulb,
  Search,
  Filter,
  BrainCircuit,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
} from "lucide-react";

interface CampaignRecord {
  id: string;
  name: string;
  date: string;
  platform: string;
  objective: string;
  impressions: string;
  conversions: string;
  outcomeType: "success" | "mistake" | "operational";
  outcomeLabel: string;
  mainLesson: string;
  memoryProvenance: string;
}

const HISTORICAL_RECORDS: CampaignRecord[] = [
  {
    id: "camp-001",
    name: "Late Night Burrito Drops",
    date: "Oct 12 – Oct 18, 2026",
    platform: "Instagram Reels",
    objective: "Foot Traffic / Late-Night Sales",
    impressions: "42,800",
    conversions: "380 redemptions",
    outcomeType: "success",
    outcomeLabel: "Proven Success",
    mainLesson: "BOGO promotions after 9 PM combined with macro food prep clips delivered 4.2x engagement over static carousels.",
    memoryProvenance: "Vectorize Hindsight #mem-0891 (aretain)",
  },
  {
    id: "camp-002",
    name: "Gourmet Truffle Tasting",
    date: "Sep 20 – Sep 25, 2026",
    platform: "Instagram & TikTok",
    objective: "Premium Menu Awareness",
    impressions: "18,400",
    conversions: "4 redemptions",
    outcomeType: "mistake",
    outcomeLabel: "Documented Mistake",
    mainLesson: "Upscale aesthetic created cognitive friction with budget-conscious student demographic; perceived as unaffordable.",
    memoryProvenance: "Vectorize Hindsight #mem-0744 (Negative Constraint)",
  },
  {
    id: "camp-003",
    name: "Flash Student ID Redemption",
    date: "Aug 28 – Sep 04, 2026",
    platform: "Campus Flyering & IG Stories",
    objective: "Back-to-School Activation",
    impressions: "12,600",
    conversions: "512 redemptions",
    outcomeType: "operational",
    outcomeLabel: "Operational Guideline",
    mainLesson: "Showing college ID directly to the cashier reduced counter wait times by 65% compared to QR code redemption apps.",
    memoryProvenance: "Vectorize Hindsight #mem-0612 (areflect)",
  },
];

export default function CampaignHistoryPage() {
  const [filter, setFilter] = useState<"all" | "success" | "mistake" | "operational">("all");
  const [search, setSearch] = useState("");

  const filteredRecords = HISTORICAL_RECORDS.filter((rec) => {
    if (filter !== "all" && rec.outcomeType !== filter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        rec.name.toLowerCase().includes(q) ||
        rec.platform.toLowerCase().includes(q) ||
        rec.mainLesson.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <PageContainer size="wide">
      {/* 1. Header with Actions */}
      <PageHeader
        badge="Empirical Observation Ledger"
        badgeSubtext="3 Recorded Historical Experiences"
        title="Campaign History & Observations"
        description="Structured repository of past marketing executions, empirical performance observations, and causal insights retained in brand memory."
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
              Inspect Memory Graph
            </Button>
          </>
        }
      />

      {/* 2. Top Summary Metric Cards (Attio / Basepoint style) */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-hairline flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-sans font-medium text-ink-secondary uppercase tracking-wider">
              Total Observations
            </p>
            <p className="font-serif text-2xl text-ink font-normal mt-0.5 tabular-nums">
              3 Campaigns
            </p>
          </div>
          <span className="p-2 rounded-lg bg-surface-subtle border border-hairline text-ink">
            <FileSpreadsheet className="w-4 h-4" />
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-hairline flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-sans font-medium text-ink-secondary uppercase tracking-wider">
              High-Performing Angle
            </p>
            <p className="font-serif text-2xl text-forest font-normal mt-0.5 tabular-nums">
              Late-Night BOGO (4.2x)
            </p>
          </div>
          <span className="p-2 rounded-lg bg-forest-subtle border border-forest-border text-forest">
            <TrendingUp className="w-4 h-4" />
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-hairline flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-sans font-medium text-ink-secondary uppercase tracking-wider">
              Enforced Avoidance
            </p>
            <p className="font-serif text-2xl text-terracotta font-normal mt-0.5">
              Upscale Gourmet
            </p>
          </div>
          <span className="p-2 rounded-lg bg-terracotta-subtle border border-terracotta-border text-terracotta">
            <AlertTriangle className="w-4 h-4" />
          </span>
        </div>
      </section>

      {/* 3. Search & Filter Bar */}
      <section className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-ink-secondary absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns, platforms, or lessons..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:border-terracotta transition-colors"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "all"
                ? "bg-ink text-white font-semibold"
                : "bg-surface border border-hairline text-ink-secondary hover:text-ink"
            }`}
          >
            All (3)
          </button>
          <button
            onClick={() => setFilter("success")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "success"
                ? "bg-forest text-white font-semibold"
                : "bg-surface border border-hairline text-forest hover:bg-forest-subtle"
            }`}
          >
            Proven Success
          </button>
          <button
            onClick={() => setFilter("mistake")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "mistake"
                ? "bg-terracotta text-white font-semibold"
                : "bg-surface border border-hairline text-terracotta hover:bg-terracotta-subtle"
            }`}
          >
            Avoided Missteps
          </button>
          <button
            onClick={() => setFilter("operational")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "operational"
                ? "bg-ink-secondary text-white font-semibold"
                : "bg-surface border border-hairline text-ink-secondary hover:text-ink"
            }`}
          >
            Operational
          </button>
        </div>
      </section>

      {/* 4. Structured Empirical Ledger Table */}
      <section className="rounded-xl bg-surface border border-hairline shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-hairline bg-surface-subtle text-[11px] font-sans font-semibold text-ink-secondary uppercase tracking-wider">
                <th className="py-3 px-4">Campaign</th>
                <th className="py-3 px-4">Timeline</th>
                <th className="py-3 px-4">Platform</th>
                <th className="py-3 px-4">Performance</th>
                <th className="py-3 px-4">Outcome</th>
                <th className="py-3 px-4 min-w-[280px]">Primary Empirical Lesson</th>
                <th className="py-3 px-4">Memory Provenance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline text-xs font-sans">
              {filteredRecords.map((item) => {
                const isSuccess = item.outcomeType === "success";
                const isMistake = item.outcomeType === "mistake";

                return (
                  <tr
                    key={item.id}
                    className="hover:bg-surface-subtle/70 transition-colors"
                  >
                    {/* Campaign Name */}
                    <td className="py-3.5 px-4 font-medium text-ink">
                      <div>{item.name}</div>
                      <div className="text-[11px] text-ink-secondary font-normal font-sans">
                        {item.objective}
                      </div>
                    </td>

                    {/* Timeline */}
                    <td className="py-3.5 px-4 text-ink-secondary whitespace-nowrap">
                      {item.date}
                    </td>

                    {/* Platform */}
                    <td className="py-3.5 px-4 text-ink">
                      <span className="px-2 py-0.5 rounded bg-surface-subtle border border-hairline text-[11px]">
                        {item.platform}
                      </span>
                    </td>

                    {/* Performance */}
                    <td className="py-3.5 px-4 tabular-nums">
                      <div className="font-medium text-ink">{item.conversions}</div>
                      <div className="text-[11px] text-ink-secondary">
                        {item.impressions} impr.
                      </div>
                    </td>

                    {/* Outcome Tag */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {isSuccess && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-forest-subtle text-forest border border-forest-border">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.outcomeLabel}</span>
                        </span>
                      )}
                      {isMistake && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-terracotta-subtle text-terracotta border border-terracotta-border">
                          <Lightbulb className="w-3 h-3" />
                          <span>{item.outcomeLabel}</span>
                        </span>
                      )}
                      {!isSuccess && !isMistake && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline">
                          <span>{item.outcomeLabel}</span>
                        </span>
                      )}
                    </td>

                    {/* Main Lesson */}
                    <td className="py-3.5 px-4 text-ink-secondary leading-relaxed">
                      {item.mainLesson}
                    </td>

                    {/* Provenance */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <Link
                        href="/memory-explorer"
                        className="inline-flex items-center gap-1 text-[11px] text-ink-secondary hover:text-terracotta font-mono transition-colors"
                      >
                        <BrainCircuit className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[140px]">{item.memoryProvenance}</span>
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </PageContainer>
  );
}
