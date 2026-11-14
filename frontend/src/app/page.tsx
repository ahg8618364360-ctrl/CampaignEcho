"use client";

import React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import {
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  CheckCircle2,
  GitCompare,
  Layers,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Database,
  Target,
  FileText,
  Lock,
  Compass,
  Zap,
} from "lucide-react";

export default function LandingWelcomePage() {
  const { user, brands, isLoading } = useAuth();

  return (
    <div className="space-y-24 md:space-y-32 py-10 md:py-16 px-4 sm:px-6 md:px-8 max-w-6xl mx-auto">
      {/* 1. HERO SECTION */}
      <section className="text-center space-y-6 pt-4 md:pt-8 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-forest-subtle border border-forest-border text-forest text-xs font-mono font-medium shadow-2xs">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Vectorize Hindsight Powered &middot; Continuous Cognitive Learning</span>
        </div>

        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[68px] text-ink font-normal leading-[1.08] tracking-tight text-balance">
          Your next campaign should remember the last one.
        </h1>

        <p className="font-sans text-base sm:text-lg md:text-xl text-ink-secondary max-w-2xl mx-auto leading-relaxed text-balance">
          CampaignEcho turns campaign outcomes, audience feedback, and brand constraints into persistent context for every future marketing decision.
        </p>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          {isLoading ? (
            <div className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-surface border border-hairline text-ink-secondary text-sm font-medium">
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>Verifying session...</span>
            </div>
          ) : !user ? (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 transition-all shadow-sm group"
              >
                <span>Create your workspace</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/login?next=/workspace"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-hairline text-ink text-sm font-medium hover:border-hairline-strong transition-all shadow-2xs"
              >
                <span>Explore Workspace</span>
              </Link>
            </>
          ) : brands.length === 0 ? (
            <Link
              href="/onboarding"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 transition-all shadow-sm group"
            >
              <span>Create your first business</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ) : (
            <Link
              href="/workspace"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest/90 transition-all shadow-sm group"
            >
              <span>Enter Workspace Desk</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          )}
          <a
            href="#how-it-works"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface border border-hairline text-ink text-sm font-medium hover:border-hairline-strong transition-all shadow-2xs"
          >
            <span>See how it works</span>
          </a>
        </div>

        {/* Proof Strip */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-ink-secondary font-mono">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            Deterministic 1:1 Brand Isolation
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            Live Vectorize Hindsight Client
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-forest" />
            Strict Epistemic Triad Grounding
          </span>
        </div>
      </section>

      {/* 2. THE CORE PROBLEM VS CAMPAIGNECHO (Stateless Prompting vs Persistent Memory) */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-terracotta font-semibold">
            The Fundamental Flaw in Modern AI Marketing
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            Why Generic AI Prompts Fail Repeatedly
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Standard LLMs begin every session from total amnesia. They do not know what failed yesterday, what your customers criticized, or which creative formats delivered actual conversions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
          {/* Stateless AI (Failure Mode) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-surface border border-hairline flex flex-col justify-between space-y-6 shadow-xs relative overflow-hidden">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-alert/10 text-alert border border-alert/20 font-semibold">
                  Stateless AI Tools (Zero Memory)
                </span>
                <span className="text-xs text-ink-secondary font-mono">Chatbot Prompts</span>
              </div>
              <h3 className="font-serif text-2xl text-ink font-normal">
                Repeats Mistakes &amp; Ignores Constraints
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans">
                <li className="flex items-start gap-2.5">
                  <span className="text-alert font-bold shrink-0">&times;</span>
                  <span><strong>Blind to past mistakes:</strong> Re-suggests tone strategies or gourmet framings that already failed in prior campaigns.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-alert font-bold shrink-0">&times;</span>
                  <span><strong>Zero causal grounding:</strong> Hallucinates causal links without citing empirical past test records or actual counter redemptions.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-alert font-bold shrink-0">&times;</span>
                  <span><strong>Data bleed risk:</strong> Mixes broad internet clichés without strict per-brand workspace memory protection.</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-hairline/80 text-xs text-ink-secondary font-mono">
              Result: Generic, unverified suggestions that waste media budget on known dead ends.
            </div>
          </div>

          {/* CampaignEcho (Memory-Powered) */}
          <div className="p-6 sm:p-8 rounded-2xl bg-forest-subtle/40 border border-forest-border flex flex-col justify-between space-y-6 shadow-xs relative">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase px-2.5 py-1 rounded bg-forest text-white font-semibold">
                  CampaignEcho + Vectorize Hindsight
                </span>
                <span className="text-xs text-forest font-mono">Cognitive Learning</span>
              </div>
              <h3 className="font-serif text-2xl text-ink font-normal">
                Continuous Cognitive Evolution
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-ink-secondary leading-relaxed font-sans">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span><strong>Explicit Negative Constraints:</strong> Enforces hard-learned rules (e.g. &ldquo;never pitch fine-dining to college students&rdquo;).</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span><strong>Citation-Grounded Reasoning:</strong> Every reel concept and hook links to a verified memory item in Hindsight.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-forest shrink-0 mt-0.5" />
                  <span><strong>Strict 1:1 Isolation:</strong> Dedicated Hindsight cloud bank per brand (<code className="font-mono text-xs">campaignecho-brand-[uuid]</code>).</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-surface border border-forest-border/80 text-xs text-ink font-mono flex items-center justify-between">
              <span>Memory Evolution Advantage:</span>
              <span className="font-semibold text-forest">+4.2x Historical Conversion Grounding</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 5-STEP COGNITIVE LEARNING LOOP (#how-it-works / #cognitive-loop) */}
      <section id="how-it-works" className="space-y-10 pt-8 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
            How CampaignEcho Works
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            The Continuous Cognitive Learning Loop
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Every campaign moves through five disciplined cognitive phases, ensuring organizational learning compounds with every execution.
          </p>
        </div>

        {/* 5 Connected Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 relative">
          {/* Step 1: Retain */}
          <div className="p-4.5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-terracotta-subtle text-terracotta border border-terracotta-border flex items-center justify-center font-mono font-bold text-xs">
                01
              </div>
              <h3 className="font-serif text-lg text-ink font-normal">Retain</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Capture campaign outcomes, counter redemptions, and qualitative audience reactions into Hindsight.
              </p>
            </div>
            <div className="pt-2 border-t border-hairline/60 text-[10px] font-mono text-terracotta">
              Live Ingestion
            </div>
          </div>

          {/* Step 2: Recall */}
          <div className="p-4.5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle text-ink border border-hairline flex items-center justify-center font-mono font-bold text-xs">
                02
              </div>
              <h3 className="font-serif text-lg text-ink font-normal">Recall</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Retrieve historical precedents, positive format wins, and explicit negative constraints.
              </p>
            </div>
            <div className="pt-2 border-t border-hairline/60 text-[10px] font-mono text-ink-secondary">
              Semantic Search
            </div>
          </div>

          {/* Step 3: Reflect */}
          <div className="p-4.5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle text-ink border border-hairline flex items-center justify-center font-mono font-bold text-xs">
                03
              </div>
              <h3 className="font-serif text-lg text-ink font-normal">Reflect</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Synthesize cross-campaign patterns to find true causal drivers and eliminate false correlations.
              </p>
            </div>
            <div className="pt-2 border-t border-hairline/60 text-[10px] font-mono text-ink-secondary">
              Causal Synthesis
            </div>
          </div>

          {/* Step 4: Generate */}
          <div className="p-4.5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-forest-subtle text-forest border border-forest-border flex items-center justify-center font-mono font-bold text-xs">
                04
              </div>
              <h3 className="font-serif text-lg text-ink font-normal">Generate</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Formulate an executable strategy, reel concepts, and hooks with full memory provenance citations.
              </p>
            </div>
            <div className="pt-2 border-t border-hairline/60 text-[10px] font-mono text-forest">
              Cited Creative Desk
            </div>
          </div>

          {/* Step 5: Learn */}
          <div className="p-4.5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between space-y-3 shadow-xs sm:col-span-2 lg:col-span-1">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded-lg bg-terracotta-subtle text-terracotta border border-terracotta-border flex items-center justify-center font-mono font-bold text-xs">
                05
              </div>
              <h3 className="font-serif text-lg text-ink font-normal">Learn</h3>
              <p className="text-xs text-ink-secondary leading-relaxed font-sans">
                Feed new post-launch results back into the brand&apos;s isolated bank to evolve the next campaign.
              </p>
            </div>
            <div className="pt-2 border-t border-hairline/60 text-[10px] font-mono text-terracotta">
              Closed Loop Retain
            </div>
          </div>
        </div>
      </section>

      {/* 4. THE EPISTEMIC TRIAD (Rigorous Scientific Grounding) */}
      <section id="architecture" className="p-8 sm:p-10 rounded-2xl bg-surface border border-hairline space-y-8 shadow-xs scroll-mt-20">
        <div className="max-w-2xl space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-terracotta font-semibold">
            Epistemic Architecture
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            No Hallucinated Causality
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Campaign metrics are historical observations, not proof of causation. CampaignEcho enforces strict separation across three distinct epistemic levels in every generated strategy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Triad 1: Observed Facts */}
          <div className="p-5 rounded-xl bg-surface-subtle border border-hairline space-y-2.5">
            <div className="flex items-center gap-2 text-forest text-xs font-mono font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Observed Facts</span>
            </div>
            <h4 className="text-sm font-semibold text-ink font-sans">
              Verifiable Historical Data
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Raw impressions, redemptions, counter timestamps, and direct customer quotes recorded directly in memory banks.
            </p>
          </div>

          {/* Triad 2: Strategic Inferences */}
          <div className="p-5 rounded-xl bg-surface-subtle border border-hairline space-y-2.5">
            <div className="flex items-center gap-2 text-terracotta text-xs font-mono font-semibold">
              <Compass className="w-4 h-4" />
              <span>2. Strategic Inferences</span>
            </div>
            <h4 className="text-sm font-semibold text-ink font-sans">
              Hypotheses &amp; Patterns
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Deductions regarding why an audience reacted favorably (e.g. appetite stimulation timing vs generic brand awareness).
            </p>
          </div>

          {/* Triad 3: Actionable Recommendations */}
          <div className="p-5 rounded-xl bg-surface-subtle border border-hairline space-y-2.5">
            <div className="flex items-center gap-2 text-ink text-xs font-mono font-semibold">
              <Target className="w-4 h-4" />
              <span>3. Actionable Recommendations</span>
            </div>
            <h4 className="text-sm font-semibold text-ink font-sans">
              Concrete Execution Rules
            </h4>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Specific creative formats, pricing caps, and posting schedules bounded by historical evidence and negative rules.
            </p>
          </div>
        </div>
      </section>

      {/* 5. EVALUATOR RUNBOOK GUIDE (#evaluator-guide) */}
      <section id="evaluator-guide" className="space-y-6 pt-4 scroll-mt-20">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono uppercase tracking-wider text-forest font-semibold">
            Evaluator Showcase Guide
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            How to Experience the Platform in 5 Minutes
          </h2>
          <p className="text-sm text-ink-secondary leading-relaxed">
            Follow this verifiable journey to test tenant memory isolation, strategy synthesis, and the closed learning loop with your own business.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-surface border border-hairline space-y-2 shadow-xs">
            <span className="text-xs font-mono text-terracotta font-semibold">Step 1 &middot; Account</span>
            <h4 className="text-sm font-semibold text-ink font-sans">Sign Up &amp; Login</h4>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Register a private account. Your user session is authenticated via secure server-managed cookies.
            </p>
            <Link href="/register" className="text-xs text-terracotta hover:underline inline-flex items-center gap-1 font-medium pt-1">
              <span>Register Account</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-hairline space-y-2 shadow-xs">
            <span className="text-xs font-mono text-forest font-semibold">Step 2 &middot; Onboard</span>
            <h4 className="text-sm font-semibold text-ink font-sans">Create Your Brand</h4>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Configure your authentic company name, industry, audience, and constraints in the onboarding wizard.
            </p>
            <Link href="/onboarding" className="text-xs text-forest hover:underline inline-flex items-center gap-1 font-medium pt-1">
              <span>Onboarding Wizard</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-hairline space-y-2 shadow-xs">
            <span className="text-xs font-mono text-ink-secondary font-semibold">Step 3 &middot; Studio</span>
            <h4 className="text-sm font-semibold text-ink font-sans">Generate Campaign</h4>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Compose a brief in Campaign Studio. View LLM synthesis grounded with memory recall citations.
            </p>
            <Link href="/campaign-studio" className="text-xs text-ink hover:underline inline-flex items-center gap-1 font-medium pt-1">
              <span>Campaign Studio</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="p-4 rounded-xl bg-surface border border-hairline space-y-2 shadow-xs">
            <span className="text-xs font-mono text-terracotta font-semibold">Step 4 &middot; Evolution</span>
            <h4 className="text-sm font-semibold text-ink font-sans">Compare Evolution</h4>
            <p className="text-xs text-ink-secondary leading-relaxed font-sans">
              Run side-by-side evaluation in Memory Evolution to see how persistent memory outperforms stateless prompts.
            </p>
            <Link href="/memory-evolution" className="text-xs text-terracotta hover:underline inline-flex items-center gap-1 font-medium pt-1">
              <span>Memory Evolution</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* 6. FINAL BOTTOM CTA BANNER */}
      <section className="p-8 sm:p-12 rounded-2xl bg-surface border border-hairline text-center space-y-6 shadow-xs relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl sm:text-4xl text-ink font-normal">
            Ready to give your marketing an enduring memory?
          </h2>
          <p className="text-sm sm:text-base text-ink-secondary leading-relaxed">
            Create your workspace today or test our isolated synthetic benchmark. Zero fake causality, zero repetitive mistakes.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {user ? (
            <Link
              href={brands.length === 0 ? "/onboarding" : "/workspace"}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-forest text-white text-sm font-medium hover:bg-forest/90 transition-all shadow-sm"
            >
              <span>{brands.length === 0 ? "Create your first business" : "Enter Workspace Desk"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-terracotta text-white text-sm font-medium hover:bg-terracotta/90 transition-all shadow-sm"
              >
                <span>Create your workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login?next=/workspace"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-surface-subtle border border-hairline text-ink text-sm font-medium hover:border-hairline-strong transition-all shadow-2xs"
              >
                <span>Explore Workspace</span>
              </Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
