"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import {
  GitCompare,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Target,
  Copy,
  Check,
  RefreshCw,
  X,
  FileText,
  Video,
  Clock,
  Layers,
  Info,
  Scale,
  Sparkles,
  ArrowRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import {
  apiFetch,
  executeComparison,
  fetchComparisons,
  CampaignComparisonResponse,
  CampaignComparisonRequest,
  MemoryCitation,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

interface Brand {
  id: string;
  name: string;
  industry: string;
  target_audience: string;
  market_region: string;
  brand_voice: string;
  restrictions?: string;
  key_offers?: string;
  is_synthetic: boolean;
}

export default function MemoryEvolutionPage() {
  const { activeBrandId, brands: authBrands } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [loadingBrands, setLoadingBrands] = useState<boolean>(true);

  // Form State
  const [campaignTitle, setCampaignTitle] = useState<string>("Q4 Growth Activation");
  const [objective, setObjective] = useState<string>("Customer Acquisition & Foot Traffic");
  const [platform, setPlatform] = useState<string>("Instagram Reels");
  const [targetAudience, setTargetAudience] = useState<string>("");
  const [offerOrPromotion, setOfferOrPromotion] = useState<string>("");
  const [constraints, setConstraints] = useState<string>("");
  const [budget, setBudget] = useState<string>("1500");
  const [primaryKpi, setPrimaryKpi] = useState<string>("Offer Redemptions");
  const [showFormDetails, setShowFormDetails] = useState<boolean>(true);

  // Execution & Comparison State
  const [isComparing, setIsComparing] = useState<boolean>(false);
  const [comparison, setComparison] = useState<CampaignComparisonResponse | null>(null);
  const [comparisonHistory, setComparisonHistory] = useState<CampaignComparisonResponse[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Citation Modal State
  const [selectedCitation, setSelectedCitation] = useState<MemoryCitation | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Load Brands on mount and keep synced with auth/active brand
  useEffect(() => {
    async function loadBrands() {
      try {
        setLoadingBrands(true);
        const res = await apiFetch("/brands");
        if (res.ok) {
          const data: Brand[] = await res.json();
          setBrands(data);
          if (data.length > 0) {
            const preferred =
              (activeBrandId && data.find((b) => b.id === activeBrandId)) ||
              data.find((b) => !b.is_synthetic) ||
              data[0];
            setSelectedBrandId(preferred.id);
          }
        }
      } catch (err: any) {
        setError("Failed to connect to CampaignEcho backend.");
      } finally {
        setLoadingBrands(false);
      }
    }
    loadBrands();
  }, [authBrands, activeBrandId]);

  // Load existing comparison history when brand changes
  useEffect(() => {
    if (!selectedBrandId) return;
    async function loadHistory() {
      try {
        const history = await fetchComparisons(selectedBrandId);
        setComparisonHistory(history);
        setComparison(history.length > 0 ? history[0] : null);
      } catch {
        // Silent failure for history
      }
    }
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId]);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];

  useEffect(() => {
    if (selectedBrand) {
      if (selectedBrand.target_audience && !targetAudience) {
        setTargetAudience(selectedBrand.target_audience);
      }
      if (selectedBrand.restrictions && !constraints) {
        setConstraints(selectedBrand.restrictions);
      }
    }
  }, [selectedBrand, targetAudience, constraints]);

  function fillFromBrandProfile() {
    if (!selectedBrand) return;
    setCampaignTitle(`${selectedBrand.name} Growth Campaign`);
    setObjective(`Acquire customers in ${selectedBrand.market_region || "target market"}`);
    setTargetAudience(selectedBrand.target_audience || "Primary target demographic");
    setConstraints(selectedBrand.restrictions || "Maintain authentic brand voice; zero generic fluff");
    if (selectedBrand.key_offers) {
      setOfferOrPromotion(selectedBrand.key_offers);
    }
  }

  async function handleRunComparison() {
    if (!selectedBrandId) {
      setError("Please select a brand.");
      return;
    }

    try {
      setIsComparing(true);
      setError(null);

      const payload: CampaignComparisonRequest = {
        brand_id: selectedBrandId,
        name: campaignTitle,
        objective,
        platform,
        target_audience: targetAudience,
        budget: budget ? parseFloat(budget) : undefined,
        offer_or_promotion: offerOrPromotion,
        constraints,
        primary_kpi: primaryKpi,
        preferred_provider: "zai",
      };

      const result = await executeComparison(payload);
      setComparison(result);
      setComparisonHistory((prev) => [result, ...prev]);
    } catch (err: any) {
      setError(err.message || "Comparison execution failed.");
    } finally {
      setIsComparing(false);
    }
  }

  function copyToClipboard(text: string, type: string) {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  }

  return (
    <PageContainer>
      {/* Editorial Header */}
      <PageHeader
        title="Memory Evolution"
        description="Controlled A/B comparison proving how persistent Vectorize Hindsight memory changes an AI marketing strategy when brief, model, and parameters are kept strictly identical."
        badge="Signature Feature"
        badgeSubtext="Controlled A/B Audit"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={fillFromBrandProfile}
              icon={<Layers className="w-3.5 h-3.5 text-forest" />}
            >
              Fill from Brand Profile
            </Button>
            <Button
              variant="primary"
              onClick={handleRunComparison}
              disabled={isComparing || loadingBrands}
              icon={isComparing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <GitCompare className="w-3.5 h-3.5" />}
            >
              {isComparing ? "Running Comparison..." : "Compare Strategies"}
            </Button>
          </div>
        }
      />

      {/* Main Workspace Layout */}
      <div className="space-y-6">
        {/* Brand & Brief Configuration Bar */}
        <div className="p-4 rounded-xl bg-surface border border-hairline shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hairline">
            <div className="flex items-center gap-3">
              <label htmlFor="brand-select" className="text-xs font-semibold text-ink uppercase tracking-wider">Brand:</label>
              <select
                id="brand-select"
                aria-label="Select Brand"
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-subtle border border-hairline text-xs font-medium text-ink focus:outline-none focus:border-terracotta cursor-pointer"
              >
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.industry})
                  </option>
                ))}
              </select>

              {selectedBrand && (
                <span className="text-[11px] text-ink-secondary hidden md:inline">
                  Memory Bank: <span className="font-mono text-forest font-medium">Isolated Server-Side</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-ink-secondary">
              <span className="inline-flex items-center gap-1 font-mono text-[11px] bg-surface-subtle px-2 py-1 rounded border border-hairline">
                <span className="w-2 h-2 rounded-full bg-forest" />
                Model: Z.ai GLM-4.5-Flash (Temp: 0.7)
              </span>
              <button
                type="button"
                onClick={() => setShowFormDetails(!showFormDetails)}
                className="text-terracotta hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
              >
                {showFormDetails ? "Hide Brief Settings" : "Edit Brief Settings"}
                {showFormDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Collapsible Brief Form */}
          {showFormDetails && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans pt-1">
              <div className="space-y-1">
                <label htmlFor="campaign-name-input" className="font-medium text-ink block">Campaign Name</label>
                <input
                  id="campaign-name-input"
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-hairline text-ink focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="primary-objective-input" className="font-medium text-ink block">Primary Objective</label>
                <input
                  id="primary-objective-input"
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-hairline text-ink focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="platform-select" className="font-medium text-ink block">Platform</label>
                <select
                  id="platform-select"
                  aria-label="Platform"
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-hairline text-ink focus:outline-none focus:border-terracotta transition-colors cursor-pointer"
                >
                  <option value="Instagram Reels">Instagram Reels (Short-Form Video)</option>
                  <option value="TikTok">TikTok</option>
                  <option value="YouTube Shorts">YouTube Shorts</option>
                </select>
              </div>

              <div className="space-y-1">
                <label htmlFor="target-audience-input" className="font-medium text-ink block">Target Audience</label>
                <input
                  id="target-audience-input"
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-hairline text-ink focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="offer-promotion-input" className="font-medium text-ink block">Offer or Promotion</label>
                <input
                  id="offer-promotion-input"
                  type="text"
                  value={offerOrPromotion}
                  onChange={(e) => setOfferOrPromotion(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-hairline text-ink focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="restrictions-input" className="font-medium text-ink block">Explicit Restrictions</label>
                <input
                  id="restrictions-input"
                  type="text"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface-subtle border border-hairline text-ink focus:outline-none focus:border-terracotta transition-colors"
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-700 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Loading Spinner during Comparison Generation */}
        {isComparing && (
          <div className="p-12 rounded-xl bg-surface border border-hairline shadow-xs text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-terracotta/10 text-terracotta animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-ink font-normal">Executing Controlled Memory Evolution</h3>
              <p className="text-xs text-ink-secondary mt-1 max-w-md mx-auto">
                Running Mode A (Zero Memory Baseline) and Mode B (Vectorize Hindsight arecall &amp; areflect) through Z.ai GLM-4.5-Flash with identical generation parameters...
              </p>
            </div>
          </div>
        )}

        {/* Side-by-Side Dual Comparison Output */}
        {comparison && !isComparing && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* ========================================================
                  COLUMN 1: MODE A (WITHOUT HISTORICAL MEMORY - BASELINE)
                 ======================================================== */}
              <div className="rounded-xl bg-surface border border-hairline shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  {/* Column Header */}
                  <div className="p-4 bg-surface-subtle border-b border-hairline space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-ink/10 text-ink">
                        Mode A · Stateless Baseline
                      </span>
                      <span className="text-[11px] font-mono text-ink-secondary">
                        0 Memory Citations
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-ink font-normal">
                        {comparison.baseline_strategy.campaign_concept}
                      </h3>
                      <p className="text-xs text-ink-secondary mt-0.5">
                        {comparison.baseline_strategy.campaign_positioning}
                      </p>
                    </div>

                    <div className="pt-2 text-[10px] text-ink-secondary font-mono flex items-center gap-3">
                      <span>Provider: {comparison.provider}</span>
                      <span>Model: {comparison.model}</span>
                      <span className="text-amber-700">Memory: None (Zero Context)</span>
                    </div>
                  </div>

                  {/* Mode A Content */}
                  <div className="p-5 space-y-5">
                    {/* Creative Direction */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">
                        Creative Direction
                      </span>
                      <p className="text-xs text-ink-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-hairline">
                        {comparison.baseline_strategy.creative_direction}
                      </p>
                    </div>

                    {/* Reel Concepts */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">
                        Short-Form Video Concepts ({comparison.baseline_strategy.reel_concepts.length})
                      </span>
                      <div className="space-y-2.5">
                        {comparison.baseline_strategy.reel_concepts.map((reel, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-surface-subtle border border-hairline text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-ink">{reel.concept_title}</span>
                              <span className="text-[10px] text-ink-secondary font-mono">No Citations</span>
                            </div>
                            <p className="text-ink font-medium text-[11px]">&ldquo;{reel.hook}&rdquo;</p>
                            <p className="text-[11px] text-ink-secondary">{reel.visual_direction}</p>
                            <div className="text-[10px] text-ink-secondary font-mono pt-1">
                              CTA: {reel.call_to_action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offer & Strategy Mechanics */}
                    <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Proposed Offer</span>
                        <p className="text-ink-secondary mt-0.5">{comparison.baseline_strategy.offer_recommendations}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Call to Action</span>
                        <p className="text-ink-secondary mt-0.5">{comparison.baseline_strategy.call_to_action}</p>
                      </div>
                    </div>

                    {/* Mode A Epistemic Triad */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">
                        Epistemic Triad (Stateless)
                      </span>
                      <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-2 text-[11px]">
                        <div>
                          <span className="font-semibold text-ink block text-[10px] uppercase text-ink-secondary">Observed Facts:</span>
                          <span className="text-amber-800 italic">None recorded. Model has no access to historical campaign bank.</span>
                        </div>
                        <div>
                          <span className="font-semibold text-ink block text-[10px] uppercase text-ink-secondary">Actionable Recommendations:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-ink-secondary">
                            {comparison.baseline_strategy.epistemic_triad.actionable_recommendations.slice(0, 2).map((rec, i) => (
                              <li key={i}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Rationale */}
                <div className="p-3 bg-surface-subtle border-t border-hairline text-[11px] text-ink-secondary italic">
                  &ldquo;{comparison.baseline_strategy.historical_rationale}&rdquo;
                </div>
              </div>

              {/* ========================================================
                  COLUMN 2: MODE B (WITH HINDSIGHT MEMORY - POWERED)
                 ======================================================== */}
              <div className="rounded-xl bg-surface border-2 border-forest/30 shadow-xs overflow-hidden flex flex-col justify-between">
                <div>
                  {/* Column Header */}
                  <div className="p-4 bg-forest/5 border-b border-forest/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-forest/15 text-forest border border-forest/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Mode B · Vectorize Hindsight Powered
                      </span>
                      <span className="text-[11px] font-mono text-forest font-semibold">
                        {comparison.comparison_summary.mode_b_citations_count} Verified Citations
                      </span>
                    </div>
                    <div>
                      <h3 className="font-serif text-lg text-ink font-normal">
                        {comparison.memory_strategy.campaign_concept}
                      </h3>
                      <p className="text-xs text-ink-secondary mt-0.5">
                        {comparison.memory_strategy.campaign_positioning}
                      </p>
                    </div>

                    <div className="pt-2 text-[10px] text-ink-secondary font-mono flex items-center gap-3">
                      <span>Provider: {comparison.provider}</span>
                      <span>Model: {comparison.model}</span>
                      <span className="text-forest font-semibold">Memory: {comparison.comparison_summary.retrieved_memories_count} Bank Records Recalled</span>
                    </div>
                  </div>

                  {/* Mode B Content */}
                  <div className="p-5 space-y-5">
                    {/* Hindsight Reflection Quote */}
                    {comparison.memory_strategy.hindsight_reflection_summary && (
                      <div className="p-3 rounded-lg bg-forest/5 border border-forest/20 space-y-1">
                        <span className="text-[10px] font-bold text-forest uppercase tracking-wider flex items-center gap-1">
                          <BrainCircuit className="w-3 h-3" />
                          Hindsight Reflection Synthesis
                        </span>
                        <p className="text-xs text-ink leading-relaxed italic">
                          &ldquo;{comparison.memory_strategy.hindsight_reflection_summary.slice(0, 180)}...&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Creative Direction */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">
                        Creative Direction
                      </span>
                      <p className="text-xs text-ink-secondary leading-relaxed bg-surface-subtle p-3 rounded-lg border border-hairline">
                        {comparison.memory_strategy.creative_direction}
                      </p>
                    </div>

                    {/* Reel Concepts with Verified Citation Chips */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">
                        Short-Form Video Concepts ({comparison.memory_strategy.reel_concepts.length})
                      </span>
                      <div className="space-y-2.5">
                        {comparison.memory_strategy.reel_concepts.map((reel, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-surface-subtle border border-hairline text-xs space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-ink">{reel.concept_title}</span>
                              {reel.supporting_memory_id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const match = comparison.memory_strategy.memory_citations.find(
                                      (c) => c.memory_id === reel.supporting_memory_id
                                    );
                                    if (match) setSelectedCitation(match);
                                  }}
                                  className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-forest/10 text-forest border border-forest/20 hover:bg-forest/20 cursor-pointer"
                                >
                                  <ShieldCheck className="w-3 h-3" />
                                  {reel.supporting_memory_id.slice(0, 14)}
                                </button>
                              )}
                            </div>
                            <p className="text-ink font-medium text-[11px]">&ldquo;{reel.hook}&rdquo;</p>
                            <p className="text-[11px] text-ink-secondary">{reel.visual_direction}</p>
                            <div className="text-[10px] text-ink-secondary font-mono pt-1">
                              CTA: {reel.call_to_action}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Offer & Strategy Mechanics */}
                    <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-2 text-xs">
                      <div>
                        <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Grounded Offer</span>
                        <p className="text-ink-secondary mt-0.5">{comparison.memory_strategy.offer_recommendations}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">Call to Action</span>
                        <p className="text-ink-secondary mt-0.5">{comparison.memory_strategy.call_to_action}</p>
                      </div>
                    </div>

                    {/* Mode B Epistemic Triad with Citation Chips */}
                    <div className="space-y-2">
                      <span className="text-[10px] font-bold text-forest uppercase tracking-wider block">
                        Epistemic Triad (Grounded Reality)
                      </span>
                      <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-2 text-[11px]">
                        <div>
                          <span className="font-semibold text-forest block text-[10px] uppercase">Observed Facts (from Memory Bank):</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-ink">
                            {comparison.memory_strategy.epistemic_triad.observed_facts.map((fact, i) => (
                              <li key={i}>{fact}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="font-semibold text-ink-secondary block text-[10px] uppercase">Declared Uncertainties:</span>
                          <ul className="list-disc pl-4 space-y-0.5 text-ink-secondary">
                            {comparison.memory_strategy.epistemic_triad.unresolved_uncertainties.slice(0, 2).map((unc, i) => (
                              <li key={i}>{unc}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Rationale */}
                <div className="p-3 bg-forest/5 border-t border-forest/20 text-[11px] text-ink italic">
                  &ldquo;{comparison.memory_strategy.historical_rationale}&rdquo;
                </div>
              </div>
            </div>

            {/* ========================================================
                VERIFIABLE DIFFERENCE LEDGER (NO FAKE PERCENTAGE SCORES)
               ======================================================== */}
            <div className="p-6 rounded-xl bg-surface border border-hairline shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-hairline">
                <div>
                  <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-ink-secondary block">
                    Audit &amp; Evaluation Ledger
                  </span>
                  <h3 className="font-serif text-xl text-ink font-normal mt-0.5">
                    Verifiable Strategy Differences
                  </h3>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-terracotta/10 text-terracotta border border-terracotta/20">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  No Fabricated AI Confidence Scores
                </div>
              </div>

              {/* Differences Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-sans border-collapse">
                  <thead>
                    <tr className="border-b border-hairline text-ink-secondary text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-semibold">Evaluation Dimension</th>
                      <th className="py-2.5 px-3 font-semibold">Mode A (Stateless Baseline)</th>
                      <th className="py-2.5 px-3 font-semibold">Mode B (Vectorize Hindsight)</th>
                      <th className="py-2.5 px-3 font-semibold">Verifiable Empirical Difference</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline">
                    {comparison.comparison_summary.dimension_checks.map((check, idx) => (
                      <tr key={idx} className="hover:bg-surface-subtle/50 transition-colors">
                        <td className="py-3 px-3 font-medium text-ink flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-forest shrink-0" />
                          <span>{check.label}</span>
                        </td>
                        <td className="py-3 px-3 text-ink-secondary">
                          <span className="px-2 py-0.5 rounded bg-surface-subtle border border-hairline text-[11px]">
                            {check.mode_a_result}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-forest font-medium">
                          <span className="px-2 py-0.5 rounded bg-forest/10 border border-forest/20 text-[11px]">
                            {check.mode_b_result}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-ink text-[11px] leading-relaxed">
                          {check.detail}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Concrete Historical Deductions Avoided */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="p-3.5 rounded-lg bg-surface-subtle border border-hairline space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-terracotta" />
                    Documented Past Pitfalls Avoided in Mode B
                  </span>
                  <ul className="space-y-1 text-ink-secondary text-[11px]">
                    {comparison.comparison_summary.avoided_past_mistakes.map((mistake, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-terracotta font-bold">•</span>
                        <span>{mistake}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-3.5 rounded-lg bg-surface-subtle border border-hairline space-y-1.5 text-xs">
                  <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-forest" />
                    Key Strategic Divergences
                  </span>
                  <ul className="space-y-1 text-ink-secondary text-[11px]">
                    {comparison.comparison_summary.strategic_differences.map((diff, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-forest font-bold">•</span>
                        <span>{diff}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Fairness Disclosure Box */}
              <div className="p-4 rounded-lg bg-surface-subtle border border-hairline text-xs text-ink-secondary leading-relaxed">
                <span className="font-semibold text-ink block text-[11px] uppercase tracking-wider mb-1">
                  Scientific Fairness &amp; Nondeterminism Disclosure
                </span>
                <p>{comparison.comparison_summary.fairness_disclosure}</p>
              </div>
            </div>
          </div>
        )}

        {/* Empty State before any comparison is run */}
        {!comparison && !isComparing && (
          <div className="p-16 rounded-xl bg-surface border border-hairline shadow-xs text-center space-y-4">
            <div className="inline-flex p-3 rounded-full bg-forest/10 text-forest">
              <Scale className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="font-serif text-xl text-ink font-normal">
                Ready for Controlled Memory Evolution
              </h3>
              <p className="text-xs text-ink-secondary leading-relaxed">
                Click &ldquo;Compare Strategies&rdquo; above to run the same campaign brief through Z.ai GLM-4.5-Flash with and without historical Vectorize Hindsight memory.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleRunComparison}
              icon={<GitCompare className="w-4 h-4" />}
            >
              Run First Comparison
            </Button>
          </div>
        )}
      </div>

      {/* Memory Citation Modal Drawer */}
      {selectedCitation && (
        <div className="fixed inset-0 bg-ink/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md rounded-xl bg-surface border border-hairline shadow-lg p-5 space-y-4 font-sans text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-hairline">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest" />
                <span className="font-semibold text-ink uppercase tracking-wider text-[11px]">
                  Verified Memory Citation
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCitation(null)}
                className="p-1 rounded text-ink-secondary hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-ink-secondary">Memory Record ID:</span>
                <span className="text-forest font-semibold">{selectedCitation.memory_id}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-ink-secondary">Provenance:</span>
                <span className="text-ink">{selectedCitation.provenance}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-ink-secondary">Classification:</span>
                <span className="text-ink">{selectedCitation.category}</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-1">
              <span className="text-[10px] font-bold text-ink uppercase tracking-wider block">
                Recorded Institutional Observation
              </span>
              <p className="text-ink font-medium leading-relaxed italic">
                &ldquo;{selectedCitation.observation}&rdquo;
              </p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-ink-secondary font-mono">
                Memory Bank: Isolated Server-Side
              </span>
              <Button
                variant="secondary"
                onClick={() => setSelectedCitation(null)}
              >
                Close Inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
