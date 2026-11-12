"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { useAuth, BrandWorkspace } from "@/lib/auth-context";
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
  Tag,
  Target,
  Globe,
  Instagram,
} from "lucide-react";

const DEMO_FALLBACK: BrandWorkspace = {
  id: "9d215d96-2695-41ee-8625-64be3e547504",
  name: "The Taco Syndicate",
  industry: "Fast-Casual Restaurant",
  description: "Late-night urban street tacos with fiery salsa and loaded queso.",
  market_region: "Austin, TX (West Campus Corridor)",
  target_audience: "University students (18–24), value-conscious, nocturnal study schedules.",
  brand_voice: "High-energy, witty, culturally authentic street food utility. Zero corporate fluff.",
  is_synthetic: true,
  restrictions: "No fine-dining tropes. No alcohol promotions targeting undergraduate accounts. Never present speculative AI estimates as verified historical metrics.",
  products_or_services: "Late-night street tacos, loaded queso, grilled quesadillas",
  unique_selling_points: "Made-to-order midnight service, secret family salsa roja",
  price_range: "$3.50 - $9.00",
  key_offers: "Buy 2 Tacos Get Free Loaded Queso after 10 PM",
  competitors: "Torchy's Tacos, Velvet Taco",
};

export default function BrandsPage() {
  const { brands: authBrands, activeBrandId, setActiveBrandId, user } = useAuth();
  const [search, setSearch] = useState("");

  const brandList = useMemo(() => (authBrands.length > 0 ? authBrands : [DEMO_FALLBACK]), [authBrands]);
  const [selectedId, setSelectedId] = useState<string>(activeBrandId || brandList[0].id);

  useEffect(() => {
    if (activeBrandId && brandList.some((b) => b.id === activeBrandId)) {
      setSelectedId(activeBrandId);
    }
  }, [activeBrandId, brandList]);

  const filteredBrands = brandList.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.industry.toLowerCase().includes(search.toLowerCase()) ||
      b.market_region.toLowerCase().includes(search.toLowerCase())
  );

  const selectedBrand =
    brandList.find((b) => b.id === selectedId) || brandList[0];

  return (
    <PageContainer size="wide">
      {/* 1. Header */}
      <PageHeader
        badge="Multi-Brand Workspaces"
        badgeSubtext={selectedBrand.is_synthetic ? "Demonstration Benchmark" : "Authenticated Business"}
        title="Brand Management & Tenant Boundaries"
        description="Configure brand identity guidelines, voice parameters, and review architectural 1:1 Hindsight memory bank isolation across client accounts."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              href="/onboarding"
              icon={<Plus className="w-3.5 h-3.5 text-primary" />}
            >
              New Business Workspace
            </Button>
            <Button
              variant="primary"
              href="/campaign-studio"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Launch Studio
            </Button>
          </div>
        }
      />

      {/* 2. 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start mt-6">
        {/* Left Pane: 4 cols Brand Directory */}
        <section className="lg:col-span-4 p-4 rounded-xl bg-surface border border-hairline shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-hairline">
            <div>
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Brand Directory
              </span>
              <h2 className="font-serif text-lg text-ink font-normal mt-0.5">
                Workspaces ({brandList.length})
              </h2>
            </div>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-ink-secondary border border-hairline font-sans">
              {user ? user.full_name : "Demo Mode"}
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
          <div className="space-y-2 pt-1 max-h-[460px] overflow-y-auto">
            {filteredBrands.map((brand) => {
              const isSelected = brand.id === selectedBrand.id;
              return (
                <button
                  key={brand.id}
                  onClick={() => {
                    setSelectedId(brand.id);
                    setActiveBrandId(brand.id);
                  }}
                  className={`w-full text-left p-3 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-surface-subtle border-terracotta ring-1 ring-terracotta/30 shadow-xs"
                      : "bg-surface border-hairline hover:border-hairline-strong"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-semibold text-ink font-sans truncate">
                      {brand.name}
                    </p>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 rounded-full bg-surface-subtle text-ink-secondary border border-hairline shrink-0 ml-1">
                      {brand.is_synthetic ? "Synthetic Demo" : "Authentic Workspace"}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-secondary font-sans truncate">
                    {brand.industry}
                  </p>
                  <div className="mt-2 pt-2 border-t border-hairline/60 flex items-center justify-between text-[10px] text-ink-secondary font-sans">
                    <span className="truncate max-w-[140px]">{brand.market_region}</span>
                    <span className="text-forest font-mono text-[9px] shrink-0">1:1 Isolated</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-hairline/80">
            <Link
              href="/onboarding"
              className="w-full py-2 px-3 rounded-lg border border-dashed border-terracotta/40 hover:border-terracotta text-terracotta text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Create Business Workspace</span>
            </Link>
          </div>
        </section>

        {/* Right Pane: 8 cols Brand Intelligence & Isolation Profile */}
        <section className="lg:col-span-8 p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-5">
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-hairline">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                  Brand Intelligence Profile
                </span>
                {selectedBrand.is_synthetic ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-500 border border-amber-500/20 font-medium">
                    The Taco Syndicate (Benchmark)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 font-medium">
                    Private Business Profile
                  </span>
                )}
              </div>
              <h2 className="font-serif text-2xl text-ink font-normal mt-0.5">
                {selectedBrand.name}
              </h2>
              <p className="text-xs text-ink-secondary font-sans mt-1">
                Operational Market: <strong className="text-ink font-medium">{selectedBrand.market_region}</strong>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <Button
                variant="secondary"
                href="/memory-explorer"
                icon={<BrainCircuit className="w-3.5 h-3.5 text-ink-secondary" />}
              >
                Inspect Memory Bank
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
                {selectedBrand.target_audience}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-surface-subtle border border-hairline space-y-1.5">
              <span className="text-[10px] font-semibold text-ink uppercase tracking-wider block">
                Brand Voice Guidelines
              </span>
              <p className="text-ink leading-relaxed">
                {selectedBrand.brand_voice}
              </p>
            </div>
          </div>

          {/* Commercial Offerings & Positioning Grid */}
          {(selectedBrand.products_or_services || selectedBrand.unique_selling_points || selectedBrand.key_offers) && (
            <div className="p-4 rounded-lg bg-surface-subtle border border-hairline space-y-3 text-xs font-sans">
              <span className="text-[10px] font-semibold text-ink uppercase tracking-wider block">
                Commercial Profile &amp; Value Propositions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {selectedBrand.products_or_services && (
                  <div>
                    <span className="text-[10px] text-ink-secondary block font-mono uppercase">Products / Services</span>
                    <p className="text-ink font-medium mt-0.5">{selectedBrand.products_or_services}</p>
                  </div>
                )}
                {selectedBrand.unique_selling_points && (
                  <div>
                    <span className="text-[10px] text-ink-secondary block font-mono uppercase">Unique Value Hook</span>
                    <p className="text-ink font-medium mt-0.5">{selectedBrand.unique_selling_points}</p>
                  </div>
                )}
                {selectedBrand.price_range && (
                  <div>
                    <span className="text-[10px] text-ink-secondary block font-mono uppercase">Price Range</span>
                    <p className="text-ink font-medium mt-0.5">{selectedBrand.price_range}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operational Constraints */}
          {selectedBrand.restrictions && (
            <div className="space-y-2 text-xs font-sans">
              <div className="flex items-center gap-1.5 text-ink font-semibold">
                <AlertTriangle className="w-4 h-4 text-terracotta shrink-0" />
                <span className="uppercase text-[11px] tracking-wider">
                  Operational Constraints &amp; Guardrails
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-terracotta-subtle/50 border border-terracotta-border/40 text-ink leading-relaxed">
                {selectedBrand.restrictions}
              </div>
            </div>
          )}

          {/* Strict Tenant Isolation Guarantee Strip */}
          <div className="p-4 rounded-xl bg-surface-subtle border border-hairline space-y-2 text-xs font-sans">
            <div className="flex items-center gap-2 text-forest font-semibold">
              <ShieldCheck className="w-4 h-4 text-forest shrink-0" />
              <span>Live Hindsight Brand Isolation Verified</span>
            </div>
            <p className="text-ink-secondary leading-relaxed">
              Live Hindsight brand isolation verified. Dedicated 1:1 cloud memory banks enforced with zero cross-tenant memory leakage.
            </p>
            <div className="pt-1 flex items-center justify-between text-[11px] text-ink-secondary">
              <span>Architectural Bank Scheme:</span>
              <span className="text-forest font-mono text-[10px] bg-forest/10 px-2 py-0.5 rounded border border-forest/20 font-semibold">
                Dedicated 1:1 Server-Managed Bank
              </span>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
