"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import {
  Layers,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  BrainCircuit,
  Search,
  Building2,
  Lock,
  Info,
} from "lucide-react";

interface BrandItem {
  id: string;
  name: string;
  category: string;
  status: "active" | "demo";
  market: string;
  bankId: string;
  audience: string;
  voice: string;
  negativeConstraints: string[];
}

const BRANDS: BrandItem[] = [
  {
    id: "9d215d96-2695-41ee-8625-64be3e547504",
    name: "The Taco Syndicate",
    category: "Fast-Casual Restaurant",
    status: "demo",
    market: "Austin, TX (West Campus Corridor)",
    bankId: "campaignecho-brand-b0f7",
    audience: "University students (18–24), value-conscious, nocturnal study schedules.",
    voice: "High-energy, witty, culturally authentic street food utility. Zero corporate fluff.",
    negativeConstraints: [
      "No fine-dining or luxury gourmet aesthetics (e.g. truffle oil, white-tablecloth tropes).",
      "No alcohol promotions targeting undergraduate campus accounts.",
      "Never present speculative AI estimates as verified historical campaign metrics.",
    ],
  },
];

export default function BrandsPage() {
  const [selectedBrandId, setSelectedBrandId] = useState(BRANDS[0].id);
  const [search, setSearch] = useState("");

  const selectedBrand = BRANDS.find((b) => b.id === selectedBrandId) || BRANDS[0];

  return (
    <PageContainer size="wide">
      {/* 1. Header */}
      <PageHeader
        badge="Multi-Brand Workspaces"
        badgeSubtext="Demonstration Profile"
        title="Brand Management & Tenant Boundaries"
        description="Configure brand identity guidelines, voice parameters, and review architectural 1:1 Hindsight memory bank isolation across client accounts."
        actions={
          <Button
            variant="primary"
            href="/campaign-studio"
            icon={<Plus className="w-3.5 h-3.5" />}
          >
            Launch Campaign Studio
          </Button>
        }
      />

      {/* 2. 12-Column Grid: 4 cols Directory + 8 cols Profile Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Pane: 4 cols Brand Directory */}
        <section className="lg:col-span-4 p-4 rounded-xl bg-surface border border-hairline shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Brand Directory
              </span>
              <h2 className="font-serif text-lg text-ink font-normal mt-0.5">
                Workspaces
              </h2>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline font-sans">
              1 Demo Profile
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-secondary absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter brand accounts..."
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-subtle border border-hairline text-xs text-ink placeholder:text-ink-secondary/60 focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>

          {/* Brand Cards List */}
          <div className="space-y-2 pt-1">
            {BRANDS.map((brand) => {
              const isSelected = brand.id === selectedBrandId;
              return (
                <button
                  key={brand.id}
                  onClick={() => setSelectedBrandId(brand.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface-subtle border-terracotta ring-1 ring-terracotta/30 shadow-xs"
                      : "bg-surface border-hairline hover:border-hairline-strong"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-ink font-sans">
                      {brand.name}
                    </p>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-surface-subtle text-ink-secondary border border-hairline">
                      Synthetic Fixture
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-sans">
                    {brand.category}
                  </p>
                  <div className="mt-2 pt-2 border-t border-hairline/60 flex items-center justify-between text-[10px] text-ink-secondary font-sans">
                    <span>{brand.market.split("(")[0]}</span>
                    <span className="text-ink-secondary">Bank Scoped</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-hairline/80">
            <button
              disabled
              className="w-full py-2 px-3 rounded-lg border border-dashed border-hairline text-ink-secondary text-xs font-medium flex items-center justify-center gap-1.5 opacity-60 cursor-not-allowed"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Workspace (Enterprise)</span>
            </button>
          </div>
        </section>

        {/* Right Pane: 8 cols Brand Intelligence & Isolation Profile */}
        <section className="lg:col-span-8 p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-5">
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Brand Intelligence Profile
              </span>
              <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
                {selectedBrand.name}
              </h2>
              <p className="text-xs text-ink-secondary font-sans mt-1">
                Operational Market: <strong className="text-ink font-medium">{selectedBrand.market}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                variant="secondary"
                href="/memory-explorer"
                icon={<BrainCircuit className="w-3.5 h-3.5 text-ink-secondary" />}
              >
                Inspect Fixtures
              </Button>
            </div>
          </div>

          {/* Voice & Audience Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
            <div className="p-3.5 rounded-lg bg-surface-subtle border border-hairline space-y-1.5">
              <span className="text-[10px] font-semibold text-ink uppercase tracking-wider block">
                Target Demographic Corridor
              </span>
              <p className="text-ink leading-relaxed">
                {selectedBrand.audience}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-subtle border border-hairline space-y-1.5">
              <span className="text-[10px] font-semibold text-ink uppercase tracking-wider block">
                Brand Voice Guidelines
              </span>
              <p className="text-ink leading-relaxed">
                {selectedBrand.voice}
              </p>
            </div>
          </div>

          {/* Negative Constraints Ledger */}
          <div className="space-y-2 text-xs font-sans">
            <div className="flex items-center gap-1.5 text-ink font-semibold">
              <AlertTriangle className="w-4 h-4 text-terracotta shrink-0" />
              <span className="uppercase text-[11px] tracking-wider">
                Negative Operational Constraints
              </span>
            </div>
            <div className="space-y-1.5">
              {selectedBrand.negativeConstraints.map((constraint, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-lg bg-terracotta-subtle/50 border border-terracotta-border/40 text-ink leading-relaxed flex items-start gap-2"
                >
                  <span className="text-terracotta font-bold text-xs mt-0.5">·</span>
                  <span>{constraint}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strict Tenant Isolation Guarantee Strip */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-hairline space-y-2 text-xs font-sans">
            <div className="flex items-center gap-2 text-forest font-semibold">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>Live Hindsight Brand Isolation Verified</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              Live Hindsight brand isolation verified. Separate 1:1 cloud memory banks enforced with zero cross-brand memory leakage (Verified Nov 7, 2026).
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-ink-secondary">
              <span>Architectural Bank Scheme:</span>
              <span className="text-forest font-mono text-[10px] bg-forest/10 px-2 py-0.5 rounded border border-forest/20 font-semibold">{selectedBrand.bankId}</span>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
