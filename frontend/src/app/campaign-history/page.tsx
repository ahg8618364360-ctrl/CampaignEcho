"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth-context";
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
  Info,
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
  isSynthetic: boolean;
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
    outcomeLabel: "Synthetic Observation",
    mainLesson: "BOGO promotions after 9 PM combined with macro food prep clips delivered 4.2x engagement over static carousels.",
    memoryProvenance: "Synthetic demonstration data — not yet verified as retained in Hindsight",
    isSynthetic: true,
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
    outcomeLabel: "Synthetic Negative Rule",
    mainLesson: "Upscale aesthetic created cognitive friction with budget-conscious student demographic; perceived as unaffordable.",
    memoryProvenance: "Synthetic demonstration data — not yet verified as retained in Hindsight",
    isSynthetic: true,
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
    outcomeLabel: "Synthetic Guideline",
    mainLesson: "Showing college ID directly to the cashier reduced counter wait times by 65% compared to QR code redemption apps.",
    memoryProvenance: "Synthetic demonstration data — not yet verified as retained in Hindsight",
    isSynthetic: true,
  },
];

export default function CampaignHistoryPage() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<"all" | "success" | "mistake" | "operational">("all");
  const [search, setSearch] = useState("");
  const [apiRecords, setApiRecords] = useState<CampaignRecord[]>([]);

  useEffect(() => {
    async function loadCampaigns() {
      try {
        const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";
        const res = await fetch(`${apiBase}/campaigns`, {
          credentials: "include",
          cache: "no-store",
        });
        if (res.ok) {
          const data = await res.json();
          const mapped: CampaignRecord[] = data.map((c: any) => {
            const impressionsVal = c.metrics?.impressions ? `${c.metrics.impressions.toLocaleString()} views` : "In Progress";
            const conversionsVal = c.metrics?.offer_redemptions ? `${c.metrics.offer_redemptions.toLocaleString()} redemptions` : (c.metrics?.conversions ? `${c.metrics.conversions} conversions` : "Active Execution");
            const lesson = c.feedback && c.feedback.length > 0 ? c.feedback[0].lessons_learned : (c.strategy_output?.historical_rationale || "Memory-informed campaign strategy actively running.");
            
            return {
              id: c.id,
              name: c.name,
              date: new Date(c.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              platform: c.platform,
              objective: c.objective,
              impressions: impressionsVal,
              conversions: conversionsVal,
              outcomeType: c.status === "COMPLETED" ? "success" : "operational",
              outcomeLabel: c.status === "COMPLETED" ? "Retained to Hindsight" : "Active Strategy",
              mainLesson: lesson,
              memoryProvenance: c.status === "COMPLETED" ? "Retained & verified in Vectorize Hindsight Cloud bank" : "Grounded via Vectorize Hindsight Cloud Recall",
              isSynthetic: c.is_synthetic,
            };
          });
          setApiRecords(mapped);
        }
      } catch (err) {
        console.warn("Failed to load campaigns from API:", err);
      }
    }
    loadCampaigns();
  }, [user?.id]);

  const allRecords = [...apiRecords, ...HISTORICAL_RECORDS];

  const filteredRecords = allRecords.filter((rec) => {
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
        badgeSubtext="Verified Campaigns & Baseline Fixtures"
        title="Campaign History & Observations"
        description="Structured repository of past marketing executions, observed performance metrics, and qualitative post-mortems for The Taco Syndicate demonstration profile."
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
              Inspect Memory Fixtures
            </Button>
          </>
        }
      />

      {/* Empirical Records Notice Strip */}
      <div className="p-3 rounded-lg bg-surface-subtle border border-hairline flex items-center gap-2 text-xs text-ink-secondary font-sans">
        <Info className="w-4 h-4 text-ink-secondary shrink-0" />
        <span>
          <strong className="text-ink font-medium">Empirical Ledger:</strong> Displaying {allRecords.length} records ({apiRecords.length} database persisted campaign{apiRecords.length === 1 ? "" : "s"} + {HISTORICAL_RECORDS.length} demonstration baseline fixtures).
        </span>
      </div>

      {/* 2. Top Summary Metric Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-hairline flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-sans font-medium text-ink-secondary uppercase tracking-wider">
              Total Recorded Campaigns
            </p>
            <p className="font-serif text-2xl text-ink font-normal mt-0.5 tabular-nums">
              {allRecords.length} Campaigns
            </p>
          </div>
          <span className="p-2 rounded-lg bg-surface-subtle border border-hairline text-ink">
            <FileSpreadsheet className="w-4 h-4" />
          </span>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-hairline flex items-center justify-between shadow-xs">
          <div>
            <p className="text-[11px] font-sans font-medium text-ink-secondary uppercase tracking-wider">
              Sample Top Angle
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
              Sample Avoidance
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
            placeholder="Search demo campaigns, platforms, or lessons..."
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
            All ({allRecords.length})
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
                <th className="py-3 px-4">Fixture Type</th>
                <th className="py-3 px-4 min-w-[280px]">Primary Empirical Lesson</th>
                <th className="py-3 px-4">Provenance Classification</th>
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
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-forest border border-forest-border">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.outcomeLabel}</span>
                        </span>
                      )}
                      {isMistake && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-terracotta border border-terracotta-border">
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
                      <span className="inline-flex items-center gap-1 text-[11px] text-ink-secondary/80 italic font-sans">
                        <span>{item.memoryProvenance}</span>
                      </span>
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
