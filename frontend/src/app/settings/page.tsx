"use client";

import { useEffect, useState } from "react";
import { checkReadiness, type HealthReadyResponse } from "@/lib/api";
import {
  Server,
  Database,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Brain,
} from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthReadyResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshHealth = async () => {
    setLoading(true);
    const data = await checkReadiness();
    setHealth(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshHealth();
  }, []);

  const isBackendAlive = health?.status === "ready" || health?.status === "unready";
  const isDbConnected = health?.database === "connected";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-hairline">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted">
            Preferences &amp; Diagnostics
          </span>
          <h1 className="font-serif text-3xl text-ink font-normal mt-1">Platform Settings</h1>
          <p className="text-xs text-muted mt-1">
            Local developer environment configuration, health probes, and API connectivity.
          </p>
        </div>

        <button
          onClick={refreshHealth}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface border border-hairline hover:border-hairline-strong text-xs font-medium text-ink transition-colors shadow-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Test Connections</span>
        </button>
      </div>

      {/* System Infrastructure Telemetry */}
      <div className="space-y-4">
        <h2 className="font-serif text-xl text-ink flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-terracotta" />
          <span>System Infrastructure Status</span>
        </h2>

        <div className="divide-y divide-hairline rounded-xl bg-surface border border-hairline shadow-xs">
          {/* Backend API */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink">
                <Server className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">FastAPI Backend Service</p>
                <p className="text-xs text-muted">
                  Endpoint: <code className="font-mono text-ink">http://127.0.0.1:8000/api/v1</code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isBackendAlive ? (
                <span className="flex items-center gap-1 text-xs font-medium text-forest bg-forest-subtle px-2.5 py-1 rounded-full border border-forest-border">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Alive ({health?.latencyMs}ms)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-alert bg-alert/10 px-2.5 py-1 rounded-full border border-alert/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Unreachable</span>
                </span>
              )}
            </div>
          </div>

          {/* SQLite Database */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Application Database</p>
                <p className="text-xs text-muted">
                  Driver: SQLite 3 via SQLAlchemy 2.0 ORM · Alembic Migrated
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isDbConnected ? (
                <span className="flex items-center gap-1 text-xs font-medium text-forest bg-forest-subtle px-2.5 py-1 rounded-full border border-forest-border">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-alert bg-alert/10 px-2.5 py-1 rounded-full border border-alert/30">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Disconnected</span>
                </span>
              )}
            </div>
          </div>

          {/* Vectorize Hindsight */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink">
                <Brain className="w-4 h-4 text-terracotta" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Vectorize Hindsight Memory Engine</p>
                <p className="text-xs text-muted">
                  SDK: <code className="font-mono text-ink">hindsight-client</code> (Native async: aretain, arecall, areflect)
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-muted bg-surface-subtle px-2.5 py-1 rounded-full border border-hairline">
              Scheduled for M2
            </span>
          </div>

          {/* Groq Cloud */}
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink">
                <Cpu className="w-4 h-4 text-muted" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink">Groq LLM Inference</p>
                <p className="text-xs text-muted">Model: Llama 3.3 70B Versatile</p>
              </div>
            </div>
            <span className="text-xs font-medium text-muted bg-surface-subtle px-2.5 py-1 rounded-full border border-hairline">
              Scheduled for M3
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
