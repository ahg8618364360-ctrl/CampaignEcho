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
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  Send,
  Layers,
  Info,
  Copy,
  Check,
  TrendingUp,
  RefreshCw,
  X,
  FileText,
  Video,
  Clock,
  Target,
  BarChart2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { apiFetch, API_BASE_URL } from "@/lib/api";

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

interface MemoryCitation {
  memory_id?: string;
  observation: string;
  category: string;
  provenance: string;
  is_synthetic: boolean;
  relevance_score?: number;
}

interface ReelConcept {
  concept_title: string;
  hook: string;
  visual_direction: string;
  script_or_caption: string;
  call_to_action: string;
  supporting_memory_id?: string;
  supporting_memory_quote?: string;
}

interface EpistemicTriad {
  observed_facts: string[];
  strategic_inferences: string[];
  actionable_recommendations: string[];
  unresolved_uncertainties: string[];
}

interface CampaignStrategyOutput {
  campaign_concept: string;
  main_objective: string;
  target_audience: string;
  campaign_positioning: string;
  creative_direction: string;
  reel_concepts: ReelConcept[];
  content_formats: string[];
  caption_directions: string[];
  suggested_hooks: string[];
  platform_specific_execution: string;
  offer_recommendations: string;
  call_to_action: string;
  kpi_recommendations: string[];
  execution_timeline: string[];
  potential_risks: string[];
  historical_rationale: string;
  memory_citations: MemoryCitation[];
  epistemic_triad: EpistemicTriad;
  hindsight_reflection_summary?: string;
  llm_provider: string;
  llm_model: string;
  fallback_used: boolean;
  generated_at: string;
}

interface Campaign {
  id: string;
  brand_id: string;
  name: string;
  brief: string;
  objective: string;
  platform: string;
  status: string;
  is_synthetic: boolean;
  llm_provider?: string;
  llm_model?: string;
  strategy_output?: CampaignStrategyOutput;
  created_at: string;
}

interface MemoryStatus {
  service_state: string;
  service_connected: boolean;
  bank_provisioned: boolean;
  version?: string;
  message?: string;
  memories_count?: number;
  verification_run_id?: string;
}

export default function CampaignStudioPage() {
  const { brands: authBrands, activeBrandId, setActiveBrandId } = useAuth();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<string>("");
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatus | null>(null);
  const [memoryActivities, setMemoryActivities] = useState<any[]>([]);

  // Keep studio in sync with global workspace selector
  useEffect(() => {
    if (activeBrandId && activeBrandId !== selectedBrandId) {
      setSelectedBrandId(activeBrandId);
    }
  }, [activeBrandId, selectedBrandId]);

  // Composer Form Inputs
  const [campaignName, setCampaignName] = useState("Q4 Growth & Acquisition Campaign");
  const [objective, setObjective] = useState("Customer Acquisition & Conversions");
  const [platform, setPlatform] = useState("Instagram Reels");
  const [targetAudience, setTargetAudience] = useState("");
  const [geographicMarket, setGeographicMarket] = useState("");
  const [budget, setBudget] = useState("1500");
  const [primaryKpi, setPrimaryKpi] = useState("Offer Redemptions");
  const [offerOrPromotion, setOfferOrPromotion] = useState("");
  const [constraints, setConstraints] = useState("");
  const [durationDays, setDurationDays] = useState("14");
  const [preferredFormat, setPreferredFormat] = useState("9:16 Fast-Paced Reels");
  const [isSynthetic, setIsSynthetic] = useState(false);
  const [preferredProvider, setPreferredProvider] = useState<"zai">("zai");

  // State Management
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState("");
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedType, setCopiedType] = useState<string | null>(null);

  // Results Ingestion Drawer State
  const [showResultsDrawer, setShowResultsDrawer] = useState(false);
  const [isSubmittingResults, setIsSubmittingResults] = useState(false);
  const [closedLoopResult, setClosedLoopResult] = useState<any | null>(null);

  // Results Form Inputs
  const [reportingPeriod, setReportingPeriod] = useState("Campaign Run");
  const [impressions, setImpressions] = useState("35000");
  const [reach, setReach] = useState("24000");
  const [clicks, setClicks] = useState("1200");
  const [conversions, setConversions] = useState("320");
  const [redemptions, setRedemptions] = useState("280");
  const [spend, setSpend] = useState("1200");
  const [revenue, setRevenue] = useState("3800");
  const [observations, setObservations] = useState("");
  const [clientFeedback, setClientFeedback] = useState("");
  const [lessonsLearned, setLessonsLearned] = useState("");

  const API_BASE = API_BASE_URL;

  // Load brands on mount and when authBrands changes
  useEffect(() => {
    async function loadBrands() {
      try {
        const res = await fetch(`${API_BASE}/brands`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
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
      } catch (err) {
        console.warn("Failed to load brands from API:", err);
      }
    }
    loadBrands();
  }, [authBrands, activeBrandId, API_BASE]);

  // Load memory status and activity whenever selected brand changes
  useEffect(() => {
    if (!selectedBrandId) return;

    async function loadBrandMemory() {
      try {
        const [statusRes, activityRes] = await Promise.all([
          fetch(`${API_BASE}/brands/${selectedBrandId}/memory/status`, { credentials: "include" }),
          fetch(`${API_BASE}/brands/${selectedBrandId}/memory/activity?limit=5`, { credentials: "include" }),
        ]);

        if (statusRes.ok) {
          const statusData = await statusRes.json();
          setMemoryStatus(statusData);
        }
        if (activityRes.ok) {
          const actData = await activityRes.json();
          setMemoryActivities(actData.activities || []);
        }
      } catch (err) {
        console.warn("Failed to load brand memory info:", err);
      }
    }
    loadBrandMemory();
  }, [selectedBrandId, API_BASE]);

  const selectedBrand = brands.find((b) => b.id === selectedBrandId) || brands[0];

  useEffect(() => {
    if (selectedBrand) {
      if (selectedBrand.target_audience && !targetAudience) {
        setTargetAudience(selectedBrand.target_audience);
      }
      if (selectedBrand.market_region && !geographicMarket) {
        setGeographicMarket(selectedBrand.market_region);
      }
      if (selectedBrand.restrictions && !constraints) {
        setConstraints(selectedBrand.restrictions);
      }
      if (selectedBrand.key_offers && !offerOrPromotion) {
        setOfferOrPromotion(selectedBrand.key_offers);
      }
    }
  }, [selectedBrand, targetAudience, geographicMarket, constraints, offerOrPromotion]);

  // Handle Campaign Generation
  const handleGenerate = async () => {
    if (!selectedBrandId) return;
    setIsGenerating(true);
    setErrorMsg(null);
    setGenerationStep("Querying Vectorize Hindsight memory bank...");

    try {
      setTimeout(() => setGenerationStep("Reflecting on historical causal patterns..."), 2000);
      setTimeout(() => setGenerationStep("Synthesizing grounded marketing strategy with LLM..."), 5000);

      const payload = {
        brand_id: selectedBrandId,
        name: campaignName,
        objective: objective,
        target_audience: targetAudience,
        platform: platform,
        content_language: "en",
        geographic_market: geographicMarket,
        budget: budget ? parseFloat(budget) : undefined,
        primary_kpi: primaryKpi,
        offer_or_promotion: offerOrPromotion,
        constraints: constraints,
        duration_days: durationDays ? parseInt(durationDays, 10) : undefined,
        preferred_format: preferredFormat,
        is_synthetic: isSynthetic,
      };

      const res = await fetch(
        `${API_BASE}/campaigns/generate?preferred_provider=${preferredProvider}`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned status ${res.status}`);
      }

      const campaignData: Campaign = await res.json();
      setActiveCampaign(campaignData);

      // Refresh memory activities
      const actRes = await fetch(`${API_BASE}/brands/${selectedBrandId}/memory/activity?limit=5`, {
        credentials: "include",
      });
      if (actRes.ok) {
        const actData = await actRes.json();
        setMemoryActivities(actData.activities || []);
      }
    } catch (err: any) {
      console.error("Generation error:", err);
      setErrorMsg(err.message || "Failed to generate campaign strategy.");
    } finally {
      setIsGenerating(false);
      setGenerationStep("");
    }
  };

  // Handle Result Submission to close learning loop
  const handleSubmitResults = async () => {
    if (!activeCampaign) return;
    setIsSubmittingResults(true);
    setErrorMsg(null);

    try {
      const payload = {
        reporting_period: reportingPeriod,
        impressions: impressions ? parseInt(impressions, 10) : undefined,
        reach: reach ? parseInt(reach, 10) : undefined,
        clicks: clicks ? parseInt(clicks, 10) : undefined,
        conversions: conversions ? parseInt(conversions, 10) : undefined,
        offer_redemptions: redemptions ? parseInt(redemptions, 10) : undefined,
        spend: spend ? parseFloat(spend) : undefined,
        revenue: revenue ? parseFloat(revenue) : undefined,
        observations: observations,
        client_feedback: clientFeedback,
        lessons_learned: lessonsLearned,
        is_synthetic: isSynthetic,
      };

      const res = await fetch(`${API_BASE}/campaigns/${activeCampaign.id}/results`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned status ${res.status}`);
      }

      const loopRes = await res.json();
      setClosedLoopResult(loopRes);
      setActiveCampaign((prev) => (prev ? { ...prev, status: "COMPLETED" } : null));

      // Refresh memory activity feed
      const actRes = await fetch(`${API_BASE}/brands/${selectedBrandId}/memory/activity?limit=5`, {
        credentials: "include",
      });
      if (actRes.ok) {
        const actData = await actRes.json();
        setMemoryActivities(actData.activities || []);
      }
    } catch (err: any) {
      console.error("Result submission error:", err);
      setErrorMsg(err.message || "Failed to submit campaign outcomes.");
    } finally {
      setIsSubmittingResults(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  const strategy = activeCampaign?.strategy_output;

  return (
    <PageContainer size="wide">
      {/* 1. Header */}
      <PageHeader
        badge="Continuous Marketing Intelligence"
        badgeSubtext={selectedBrand ? `Active Brand: ${selectedBrand.name}` : "No Brand Selected"}
        title="Campaign Studio"
        description="Formulate empirical marketing strategies grounded in accumulated brand memory, past campaign performance, and causal marketing constraints."
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              href="/campaign-history"
              icon={<BrainCircuit className="w-3.5 h-3.5 text-ink-secondary" />}
            >
              Review Campaign Ledger
            </Button>
            <Button
              variant="secondary"
              href="/memory-explorer"
              icon={<Layers className="w-3.5 h-3.5 text-ink-secondary" />}
            >
              Inspect Memory Bank
            </Button>
          </div>
        }
      />

      {errorMsg && (
        <div className="mb-5 p-3.5 rounded-lg bg-terracotta/10 border border-terracotta/30 flex items-start gap-2.5 text-xs text-terracotta">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold block">Execution Notice</span>
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-terracotta hover:opacity-80">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. 12-Column Grid: 7-col Main Pane (Composer or Strategy Workspace) + 5-col Memory Desk */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* ========================================================
            LEFT PANE (7 COLS): Brief Composer OR Strategy Workspace
           ======================================================== */}
        <section className="lg:col-span-7 space-y-4">
          {!activeCampaign ? (
            /* COMPOSER FORM */
            <div className="p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-hairline">
                <div>
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                    Brief Composer
                  </span>
                  <h2 className="font-serif text-xl text-ink font-normal mt-0.5">
                    New Strategy Specification
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-surface-subtle text-forest border border-forest/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-forest" />
                    Hindsight Cloud Verified
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 text-xs font-sans">
                {/* Brand Selector & Campaign Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-ink block">Target Brand Profile</label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.industry})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="studio-campaign-name" className="font-medium text-ink block">Campaign Name</label>
                    <input
                      id="studio-campaign-name"
                      type="text"
                      value={campaignName}
                      onChange={(e) => setCampaignName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="e.g. Product Launch & Acquisition Campaign"
                    />
                  </div>
                </div>

                {/* Objective & Channel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-medium text-ink block">Primary Objective</label>
                    <select
                      value={objective}
                      onChange={(e) => setObjective(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors cursor-pointer"
                    >
                      <option value="Late-Night Foot Traffic">Customer Acquisition &amp; Foot Traffic</option>
                      <option value="Campus Item Awareness">Product Line Awareness</option>
                      <option value="Student Loyalty Activation">Customer Loyalty Activation</option>
                      <option value="Digital Direct Orders">Digital Online Delivery Orders</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="font-medium text-ink block">Target Platform</label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors cursor-pointer"
                    >
                      <option value="Instagram Reels">Instagram Reels (Short-Form Video)</option>
                      <option value="TikTok">TikTok (Organic &amp; Spark Ads)</option>
                      <option value="YouTube Shorts">YouTube Shorts</option>
                      <option value="Multi-Channel">Multi-Channel Video</option>
                    </select>
                  </div>
                </div>

                {/* Target Audience & Market Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="studio-target-audience" className="font-medium text-ink block">Audience Segment</label>
                    <input
                      id="studio-target-audience"
                      type="text"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="e.g. Active lifestyle enthusiasts (25–40)"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="studio-geographic-market" className="font-medium text-ink block">Geographic Market</label>
                    <input
                      id="studio-geographic-market"
                      type="text"
                      value={geographicMarket}
                      onChange={(e) => setGeographicMarket(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                      placeholder="e.g. North America Metro Region"
                    />
                  </div>
                </div>

                {/* Offer & Constraints */}
                <div className="space-y-1">
                  <label className="font-medium text-ink block">Offer or Promotional Mechanic</label>
                  <input
                    type="text"
                    value={offerOrPromotion}
                    onChange={(e) => setOfferOrPromotion(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                    placeholder="e.g. Free consultation, introductory bundle, or 20% launch voucher"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="font-medium text-ink block">Brand Constraints &amp; Directives</label>
                    <span className="text-[11px] text-ink-secondary">Enforced during generation</span>
                  </div>
                  <textarea
                    rows={2}
                    value={constraints}
                    onChange={(e) => setConstraints(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors leading-relaxed"
                    placeholder="e.g. Keep tone authoritative, clear, and value-first. Avoid generic marketing superlatives."
                  />
                </div>

                {/* Budget, Primary KPI, Format, Provider */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                  <div className="space-y-1">
                    <label className="font-medium text-ink block">Budget ($)</label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-ink block">Primary KPI</label>
                    <input
                      type="text"
                      value={primaryKpi}
                      onChange={(e) => setPrimaryKpi(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-ink block">Format</label>
                    <input
                      type="text"
                      value={preferredFormat}
                      onChange={(e) => setPreferredFormat(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta transition-colors"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium text-ink block">LLM Engine</label>
                    <div className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink flex items-center justify-between">
                      <span className="font-medium">Z.ai — GLM-4.5-Flash</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-forest/10 text-forest border border-forest/20">
                        Active Provider
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grounding & Guardrail Summary */}
                <div className="p-3 rounded-lg bg-surface-subtle border border-hairline/80 space-y-2">
                  <p className="text-[11px] font-semibold text-ink uppercase tracking-wider">
                    Automated Epistemic Guardrails
                  </p>
                  <div className="space-y-1.5 text-[11px] text-ink-secondary">
                    <div className="flex items-center gap-1.5 text-forest">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Dedicated Brand Memory Bank (Managed Server-Side)</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-forest">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Vectorize Hindsight Recall + Reflect executed prior to generation</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-terracotta">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>Zero hallucinated causality: past performance is treated as historical evidence</span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-2 flex items-center justify-between gap-3 flex-wrap">
                  <div className="text-[11px] text-ink-secondary flex items-center gap-1.5">
                    <BrainCircuit className="w-3.5 h-3.5 text-terracotta" />
                    <span>Real Hindsight Memory Recall &amp; Dual LLM Ingestion</span>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    icon={isGenerating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  >
                    {isGenerating ? generationStep || "Synthesizing Strategy..." : "Generate Memory-Grounded Strategy"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* STRATEGY WORKSPACE DOCUMENT VIEW */
            <div className="space-y-4">
              {/* Workspace Top Toolbar */}
              <div className="p-4 rounded-xl bg-surface border border-hairline shadow-xs flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20 uppercase tracking-wider">
                    {activeCampaign.status}
                  </span>
                  <span className="text-xs font-medium text-ink">
                    Generated via {activeCampaign.llm_provider?.toUpperCase()} ({activeCampaign.llm_model})
                  </span>
                  {strategy?.fallback_used && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-terracotta/10 text-terracotta border border-terracotta/20">
                      Fallback Active
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => setActiveCampaign(null)}
                    icon={<RefreshCw className="w-3 h-3" />}
                  >
                    New Strategy Brief
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => setShowResultsDrawer(true)}
                    icon={<CheckCircle2 className="w-3 h-3" />}
                  >
                    Submit Results &amp; Close Loop
                  </Button>
                </div>
              </div>

              {/* Core Strategy Concept Header */}
              <div className="p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-terracotta block">
                      Campaign Concept
                    </span>
                    <h2 className="font-serif text-2xl text-ink font-normal mt-1 leading-snug">
                      {strategy?.campaign_concept}
                    </h2>
                  </div>
                </div>
                <p className="text-xs text-ink-secondary leading-relaxed">
                  <span className="font-semibold text-ink">Positioning: </span>
                  {strategy?.campaign_positioning}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface-subtle border border-hairline/80">
                    <span className="text-[10px] text-ink-secondary block font-medium">Objective</span>
                    <span className="font-medium text-ink">{strategy?.main_objective}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-subtle border border-hairline/80">
                    <span className="text-[10px] text-ink-secondary block font-medium">Platform Execution</span>
                    <span className="font-medium text-ink">{activeCampaign.platform}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-surface-subtle border border-hairline/80">
                    <span className="text-[10px] text-ink-secondary block font-medium">Target Audience</span>
                    <span className="font-medium text-ink">{strategy?.target_audience}</span>
                  </div>
                </div>
              </div>

              {/* Epistemic Triad: Facts, Inferences, Recommendations */}
              <div className="p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary">
                    Epistemic Triad · Proof-Grounded Synthesis
                  </span>
                  <span className="text-[10px] text-forest font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Strict Grounding Filter
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans">
                  {/* Column 1: Observed Facts */}
                  <div className="p-3 rounded-lg bg-forest/5 border border-forest/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-forest uppercase tracking-wider flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Observed Facts (Memory)
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-ink-secondary leading-relaxed">
                      {strategy?.epistemic_triad?.observed_facts?.map((f, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-forest">•</span>
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 2: Strategic Inferences */}
                  <div className="p-3 rounded-lg bg-terracotta/5 border border-terracotta/20 space-y-1.5">
                    <span className="text-[10px] font-bold text-terracotta uppercase tracking-wider flex items-center gap-1">
                      <Lightbulb className="w-3 h-3" />
                      Strategic Inferences
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-ink-secondary leading-relaxed">
                      {strategy?.epistemic_triad?.strategic_inferences?.map((inf, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-terracotta">•</span>
                          <span>{inf}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Column 3: Actionable Recommendations */}
                  <div className="p-3 rounded-lg bg-surface-subtle border border-hairline space-y-1.5">
                    <span className="text-[10px] font-bold text-ink uppercase tracking-wider flex items-center gap-1">
                      <Target className="w-3 h-3 text-terracotta" />
                      Proposed Execution
                    </span>
                    <ul className="space-y-1.5 text-[11px] text-ink-secondary leading-relaxed">
                      {strategy?.epistemic_triad?.actionable_recommendations?.map((rec, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-ink">•</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3 Short-Form Reel Concepts with Memory Citations */}
              <div className="p-5 rounded-xl bg-surface border border-hairline shadow-xs space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-hairline">
                  <div>
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                      Creative Execution
                    </span>
                    <h3 className="font-serif text-lg text-ink font-normal mt-0.5">
                      Short-Form Video &amp; Reel Concepts ({strategy?.reel_concepts?.length || 0})
                    </h3>
                  </div>
                  <Button
                    variant="quiet"
                    onClick={() => {
                      const scripts = strategy?.reel_concepts
                        ?.map((r, i) => `REEL ${i + 1}: ${r.concept_title}\nHOOK: ${r.hook}\nVISUAL: ${r.visual_direction}\nSCRIPT: ${r.script_or_caption}\nCTA: ${r.call_to_action}\n`)
                        .join("\n");
                      copyToClipboard(scripts || "", "scripts");
                    }}
                    icon={copiedType === "scripts" ? <Check className="w-3 h-3 text-forest" /> : <Copy className="w-3 h-3" />}
                  >
                    {copiedType === "scripts" ? "Copied Scripts!" : "Copy All Scripts"}
                  </Button>
                </div>

                <div className="space-y-3">
                  {strategy?.reel_concepts?.map((reel, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg bg-surface-subtle border border-hairline space-y-2 text-xs font-sans hover:border-terracotta/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-ink text-xs flex items-center gap-1.5">
                          <Video className="w-3.5 h-3.5 text-terracotta" />
                          Concept {idx + 1}: {reel.concept_title}
                        </span>
                        {reel.supporting_memory_id && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface border border-hairline text-forest flex items-center gap-1">
                            <BrainCircuit className="w-3 h-3 text-forest" />
                            Cite: {reel.supporting_memory_id.slice(0, 12)}...
                          </span>
                        )}
                      </div>

                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <span className="font-semibold text-terracotta">0–3s Hook: </span>
                          <span className="text-ink font-medium">&ldquo;{reel.hook}&rdquo;</span>
                        </div>
                        <div>
                          <span className="font-semibold text-ink-secondary">Visual Direction: </span>
                          <span className="text-ink-secondary">{reel.visual_direction}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-ink-secondary">Script / Copy: </span>
                          <span className="text-ink leading-relaxed">{reel.script_or_caption}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-forest">Call to Action: </span>
                          <span className="text-ink font-medium">{reel.call_to_action}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Supporting Memory Citations Strip */}
              {strategy?.memory_citations && strategy.memory_citations.length > 0 && (
                <div className="p-4 rounded-xl bg-surface border border-hairline shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary">
                      Originating Hindsight Citations ({strategy.memory_citations.length})
                    </span>
                    <span className="text-[10px] text-ink-secondary">Anti-Slop Audit Verified</span>
                  </div>
                  <div className="space-y-2">
                    {strategy.memory_citations.map((cite, i) => (
                      <div key={i} className="p-2.5 rounded bg-surface-subtle border border-hairline/80 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-forest uppercase">{cite.category}</span>
                          <span className="text-ink-secondary font-mono">ID: {cite.memory_id || "hindsight-bank"}</span>
                        </div>
                        <p className="text-ink font-medium leading-normal">&ldquo;{cite.observation}&rdquo;</p>
                        <span className="text-[10px] text-ink-secondary block font-mono">
                          Provenance: {cite.provenance} {cite.is_synthetic && "(Synthetic Fixture)"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ========================================================
            RIGHT PANE (5 COLS): Hindsight Memory Grounding Desk
           ======================================================== */}
        <section className="lg:col-span-5 p-5 rounded-xl bg-surface-subtle border border-hairline shadow-xs space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-sans font-semibold uppercase tracking-wider text-ink-secondary block">
                Memory Grounding Desk
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">
                {memoryStatus?.service_state || "OPERATIONS_VERIFIED"}
              </span>
            </div>
            <h3 className="font-serif text-lg text-ink font-normal mt-0.5">
              Live Brand Memory Bank
            </h3>
            <p className="text-xs text-ink-secondary font-sans mt-1">
              Dedicated brand memory bank: <span className="font-medium text-[11px] text-forest">Isolated Server-Side</span>
            </p>
          </div>

          {/* Engine Status Readiness Indicator */}
          <div className="p-3 rounded-lg bg-surface border border-hairline space-y-1.5 text-xs font-sans">
            <div className="flex items-center justify-between">
              <span className="font-medium text-ink">Vectorize Hindsight Engine</span>
              <span className="text-forest text-[11px] font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Connected v{memoryStatus?.version || "1.1.0"}
              </span>
            </div>
            <p className="text-[11px] text-ink-secondary">
              Bank provisioned and operational telemetry actively tracking Retain, Recall, and Reflect runs.
            </p>
          </div>

          {/* Closed Loop Success Alert if just closed */}
          {closedLoopResult && (
            <div className="p-3.5 rounded-lg bg-forest/10 border border-forest/30 space-y-2 text-xs font-sans">
              <div className="flex items-center gap-1.5 text-forest font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Learning Loop Successfully Closed!</span>
              </div>
              <p className="text-[11px] text-ink leading-relaxed">
                Outcome retained into Hindsight bank and verified retrievable via live Recall.
              </p>
              <div className="pt-1 text-[10px] font-mono text-ink-secondary space-y-0.5">
                <div>Bank: Dedicated Brand Bank (Managed Server-Side)</div>
                <div>Retain Op: {closedLoopResult.hindsight_retain_operation_id?.slice(0, 16)}...</div>
                <div>Verified Retrieval: PASSED</div>
              </div>
            </div>
          )}

          {/* Recent Memory Telemetry Stack */}
          <div className="space-y-2.5 text-xs font-sans">
            <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wider text-ink-secondary">
              <span>Recent Memory Activity</span>
              <Link href="/memory-explorer" className="text-terracotta hover:underline text-[11px] font-normal">
                View All Activity
              </Link>
            </div>

            {memoryActivities.length > 0 ? (
              memoryActivities.map((act) => (
                <div key={act.id} className="p-2.5 rounded-lg bg-surface border border-hairline space-y-1 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider ${
                        act.operation_type === "RETAIN"
                          ? "text-forest"
                          : act.operation_type === "RECALL"
                          ? "text-terracotta"
                          : "text-ink"
                      }`}
                    >
                      {act.operation_type}
                    </span>
                    <span className="text-[10px] text-ink-secondary font-mono">{act.latency_ms}ms</span>
                  </div>
                  <p className="text-[11px] text-ink truncate font-medium">
                    {act.context_tag || "Brand operation"}
                  </p>
                  <div className="text-[10px] text-ink-secondary flex items-center justify-between">
                    <span>Status: {act.status}</span>
                    <span className="font-mono text-[9px]">{new Date(act.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-surface border border-hairline text-[11px] text-ink-secondary text-center">
                No recent telemetry logged yet for this bank.
              </div>
            )}
          </div>

          {/* Tenant Isolation Architectural Guarantee */}
          <div className="pt-3 border-t border-hairline/80 flex items-center justify-between text-xs text-ink-secondary font-sans">
            <span className="flex items-center gap-1.5 text-forest font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Strict 1:1 Brand Isolation</span>
            </span>
            <span className="text-[11px] font-mono text-ink-secondary">Zero Tenant Leakage</span>
          </div>
        </section>
      </div>

      {/* ========================================================
          RESULTS INGESTION DRAWER / MODAL (CLOSING THE LOOP)
         ======================================================== */}
      {showResultsDrawer && activeCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface rounded-2xl border border-hairline shadow-2xl p-6 space-y-4 text-xs font-sans">
            <div className="flex items-center justify-between pb-3 border-b border-hairline">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest block">
                  Close Continuous Learning Loop
                </span>
                <h3 className="font-serif text-xl text-ink font-normal mt-0.5">
                  Record Campaign Performance: {activeCampaign.name}
                </h3>
              </div>
              <button
                onClick={() => setShowResultsDrawer(false)}
                className="p-1 rounded-md text-ink-secondary hover:text-ink hover:bg-surface-subtle"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-ink-secondary leading-relaxed">
              Submit post-campaign metrics and qualitative observations. This takeaway will be retained directly into
              the brand&apos;s Vectorize Hindsight memory bank to continuously refine future campaign briefs.
            </p>

            {/* Quantitative Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="font-medium text-ink block">Impressions</label>
                <input
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-ink block">Reach</label>
                <input
                  type="number"
                  value={reach}
                  onChange={(e) => setReach(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-ink block">Clicks</label>
                <input
                  type="number"
                  value={clicks}
                  onChange={(e) => setClicks(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-ink block">Conversions</label>
                <input
                  type="number"
                  value={conversions}
                  onChange={(e) => setConversions(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-ink block">Offer Redemptions</label>
                <input
                  type="number"
                  value={redemptions}
                  onChange={(e) => setRedemptions(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-ink block">Total Spend ($)</label>
                <input
                  type="number"
                  value={spend}
                  onChange={(e) => setSpend(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-ink block">Revenue ($)</label>
                <input
                  type="number"
                  value={revenue}
                  onChange={(e) => setRevenue(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
              <div className="space-y-1">
                <label className="font-medium text-ink block">Reporting Period</label>
                <input
                  type="text"
                  value={reportingPeriod}
                  onChange={(e) => setReportingPeriod(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>
            </div>

            {/* Qualitative Observations & Lessons Learned */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-medium text-ink block">Field Observations &amp; Customer Response</label>
                <input
                  type="text"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-ink block">Stakeholder / Cashier Feedback</label>
                <input
                  type="text"
                  value={clientFeedback}
                  onChange={(e) => setClientFeedback(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-ink block">
                    Core Lessons Learned <span className="text-terracotta">*</span>
                  </label>
                  <span className="text-[11px] text-forest font-medium">Retained to Hindsight Bank</span>
                </div>
                <textarea
                  rows={3}
                  value={lessonsLearned}
                  onChange={(e) => setLessonsLearned(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-hairline text-xs text-ink focus:outline-none focus:border-terracotta leading-relaxed"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-hairline flex items-center justify-between gap-3 flex-wrap">
              <span className="text-[11px] text-ink-secondary">
                Bank: <span className="font-medium text-forest">Dedicated Brand Bank (Managed Server-Side)</span>
              </span>
              <div className="flex items-center gap-2">
                <Button variant="secondary" onClick={() => setShowResultsDrawer(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitResults}
                  disabled={isSubmittingResults}
                  icon={isSubmittingResults ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                >
                  {isSubmittingResults ? "Retaining to Hindsight..." : "Retain & Verify Closed Loop"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
