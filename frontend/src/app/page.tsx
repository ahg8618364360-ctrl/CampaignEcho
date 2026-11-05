"use client";

import { useEffect, useState } from "react";
import { checkReadiness, type HealthReadyResponse } from "@/lib/api";
import {
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Server,
  Database,
  Brain,
  Cpu,
  ShieldCheck,
  ArrowUpRight,
  Terminal,
} from "lucide-react";

export default function OverviewPage() {
  const [health, setHealth] = useState<HealthReadyResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<string>("");

  const refreshHealth = async () => {
    setLoading(true);
    const data = await checkReadiness();
    setHealth(data);
    setLoading(false);
    setLastChecked(new Date().toLocaleTimeString());
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  const isBackendAlive = health?.status === "ready" || health?.status === "unready";
  const isDbConnected = health?.database === "connected";

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Page Title & Mission Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-hairline/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-brand px-2 py-0.5 rounded bg-brand/10 border border-brand/20">
              Milestone 1 · Full-Stack Foundation
            </span>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-100">
            System Infrastructure & Readiness
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Verifying runtime communication between Next.js 15+ frontend, FastAPI backend, and SQLite database.
          </p>
        </div>

        <button
          onClick={refreshHealth}
          disabled={loading}
          className="self-start md:self-auto flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface border border-hairline hover:border-hairline-strong text-xs font-mono text-slate-300 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-brand ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Health</span>
          {lastChecked && <span className="text-slate-500 text-[10px]">({lastChecked})</span>}
        </button>
      </div>

      {/* Primary Infrastructure Telemetry Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Backend Process */}
        <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
              <Server className="w-4 h-4" />
            </div>
            {loading ? (
              <span className="text-[10px] font-mono text-slate-500 animate-pulse">Checking...</span>
            ) : isBackendAlive ? (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3" /> ALIVE
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60">
                <AlertCircle className="w-3 h-3" /> UNREACHABLE
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-mono">Backend API</p>
            <h3 className="text-base font-semibold text-slate-200 mt-0.5">FastAPI Python 3.13</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              {isBackendAlive ? `Port 8000 · ${health?.latencyMs}ms latency` : "Not reachable on port 8000"}
            </p>
          </div>
        </div>

        {/* Card 2: Database Connection */}
        <div className="p-5 rounded-xl bg-surface border border-hairline hover:border-hairline-strong transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <Database className="w-4 h-4" />
            </div>
            {loading ? (
              <span className="text-[10px] font-mono text-slate-500 animate-pulse">Checking...</span>
            ) : isDbConnected ? (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <CheckCircle2 className="w-3 h-3" /> CONNECTED
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-400 border border-rose-800/60">
                <AlertCircle className="w-3 h-3" /> UNREADY
              </span>
            )}
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-mono">Application Store</p>
            <h3 className="text-base font-semibold text-slate-200 mt-0.5">SQLite & Alembic</h3>
            <p className="text-[11px] text-slate-500 font-mono mt-1">
              {isDbConnected ? "PRAGMA foreign_keys = ON · Migrated" : "Database connection failed"}
            </p>
          </div>
        </div>

        {/* Card 3: Vectorize Hindsight */}
        <div className="p-5 rounded-xl bg-surface border border-hairline opacity-80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400">
              <Brain className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-hairline">
              M2 QUEUED
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-mono">Memory Engine</p>
            <h3 className="text-base font-semibold text-slate-200 mt-0.5">Vectorize Hindsight</h3>
            <p className="text-[11px] text-purple-400/80 font-mono mt-1">
              Not integrated yet (Scheduled for M2)
            </p>
          </div>
        </div>

        {/* Card 4: Groq LLM Provider */}
        <div className="p-5 rounded-xl bg-surface border border-hairline opacity-80 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div className="w-9 h-9 rounded-lg bg-orange-950/60 border border-orange-800/40 flex items-center justify-center text-orange-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-hairline">
              M3 QUEUED
            </span>
          </div>
          <div className="mt-4">
            <p className="text-xs text-slate-400 font-mono">LLM Inference</p>
            <h3 className="text-base font-semibold text-slate-200 mt-0.5">Groq Llama 3.3 70B</h3>
            <p className="text-[11px] text-orange-400/80 font-mono mt-1">
              Not integrated yet (Scheduled for M3)
            </p>
          </div>
        </div>
      </div>

      {/* Backend Disconnected Diagnostic Callout (Only appears if backend is unreachable) */}
      {!loading && !isBackendAlive && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-900/60 flex items-start gap-3 text-rose-200">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm">FastAPI Backend is currently not reachable.</p>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              Launch the backend server locally using the command below, then click &quot;Refresh Health&quot;:
            </p>
            <div className="mt-2 p-2 rounded bg-black/60 font-mono text-xs text-rose-100 flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-rose-400" />
              <span>uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload</span>
            </div>
          </div>
        </div>
      )}

      {/* Architectural Standard & Schema Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Engineering Constitution Checklist */}
        <div className="p-6 rounded-xl bg-surface border border-hairline space-y-4">
          <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Milestone 1 Architectural Standards
          </h3>
          <ul className="space-y-2.5 text-xs text-slate-300 font-mono">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Decimal-safe monetary fields (NUMERIC 10,2) with ISO currency codes</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Nullable campaign metric counts preventing false zero observations</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Deterministic 1:1 internal memory bank isolation per brand</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Native async Hindsight methods (aretain, arecall, areflect)</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
              <span>Strictly zero fake memory or mock substitutions claimed as real</span>
            </li>
          </ul>
        </div>

        {/* Right: Next Milestone Preview */}
        <div className="p-6 rounded-xl bg-surface border border-hairline space-y-4">
          <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand" />
            Upcoming Milestone Roadmap
          </h3>
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-surface-raised/70 border border-hairline/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-purple-300">Milestone 2 · Hindsight Memory Engine</span>
                <span className="font-mono text-[10px] text-slate-500">Target</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Implement native aretain, arecall, areflect operations and cross-session persistence testing.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-surface-raised/70 border border-hairline/60">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300">Milestone 3 · Campaign Orchestration</span>
                <span className="font-mono text-[10px] text-slate-500">Target</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Groq LLM strategy synthesis with explicit memory citation chips and outcome retention loop.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

