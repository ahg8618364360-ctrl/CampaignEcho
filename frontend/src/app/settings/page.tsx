"use client";

import { useEffect, useState } from "react";
import { checkReadiness, fetchMemoryStatus, type HealthReadyResponse, type MemoryStatusResponse } from "@/lib/api";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import {
  Server,
  Database,
  RefreshCw,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Brain,
  ShieldCheck,
} from "lucide-react";

export default function SettingsPage() {
  const [health, setHealth] = useState<HealthReadyResponse | null>(null);
  const [memoryStatus, setMemoryStatus] = useState<MemoryStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshAll = async () => {
    setLoading(true);
    const [hData, mData] = await Promise.all([
      checkReadiness(),
      fetchMemoryStatus("9d215d96-2695-41ee-8625-64be3e547504"),
    ]);
    setHealth(hData);
    setMemoryStatus(mData);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, []);

  const isBackendAlive = health?.status === "ready" || health?.status === "unready";
  const isDbConnected = health?.database === "connected";
  const isMemoryConnected = memoryStatus?.service_connected ?? false;

  return (
    <PageContainer size="wide">
      {/* Header */}
      <PageHeader
        badge="Preferences & Diagnostics"
        badgeSubtext="Local Runtime Environment"
        title="Platform Diagnostics & Settings"
        description="Local developer environment configuration, health probes, and service connectivity diagnostics."
        actions={
          <Button
            variant="secondary"
            onClick={refreshAll}
            disabled={loading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />}
          >
            <span>Test Connections</span>
          </Button>
        }
      />

      {/* System Infrastructure Telemetry */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-[22px] text-ink font-normal leading-snug">
              System Infrastructure Telemetry
            </h2>
            <p className="text-xs text-ink-secondary mt-0.5 font-sans">
              Live connectivity diagnostics across backend services, database persistence, and intelligence engines.
            </p>
          </div>
        </div>

        <div className="divide-y divide-hairline rounded-xl bg-surface border border-hairline shadow-xs">
          {/* Backend API */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Server className="w-4 h-4 text-ink" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-ink font-sans">FastAPI Backend Service</p>
                <p className="text-[11px] text-ink-secondary font-sans">
                  Endpoint: <code className="font-mono text-ink">http://127.0.0.1:8000/api/v1</code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isBackendAlive ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-forest bg-forest-subtle px-2.5 py-0.5 rounded-full border border-forest-border font-sans tabular-nums">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Alive ({health?.latencyMs}ms)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-alert bg-alert/10 px-2.5 py-0.5 rounded-full border border-alert/30 font-sans">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Unreachable</span>
                </span>
              )}
            </div>
          </div>

          {/* SQLite Database */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Database className="w-4 h-4 text-ink" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-ink font-sans">Application Database</p>
                <p className="text-[11px] text-ink-secondary font-sans">
                  Driver: SQLite 3 via SQLAlchemy 2.0 ORM · Alembic Migrated
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isDbConnected ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-forest bg-forest-subtle px-2.5 py-0.5 rounded-full border border-forest-border font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-alert bg-alert/10 px-2.5 py-0.5 rounded-full border border-alert/30 font-sans">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Disconnected</span>
                </span>
              )}
            </div>
          </div>

          {/* Vectorize Hindsight */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Brain className="w-4 h-4 text-terracotta" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-ink font-sans">Vectorize Hindsight Memory Engine</p>
                <p className="text-[11px] text-ink-secondary font-sans">
                  SDK: <code className="font-mono text-ink">hindsight-client v1.2.0</code> (Native async: aretain, arecall, areflect)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isMemoryConnected ? (
                <span className="flex items-center gap-1 text-[11px] font-medium text-forest bg-forest-subtle px-2.5 py-0.5 rounded-full border border-forest-border font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[11px] font-medium text-ink-secondary bg-surface-subtle px-2.5 py-0.5 rounded-full border border-hairline font-sans">
                  <span>Engine: {memoryStatus?.engine_status || "Checking..."}</span>
                </span>
              )}
            </div>
          </div>

          {/* Groq Cloud */}
          <div className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Cpu className="w-4 h-4 text-ink-secondary" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-ink font-sans">Groq LLM Inference</p>
                <p className="text-[11px] text-ink-secondary font-sans">Model: Llama 3.3 70B Versatile</p>
              </div>
            </div>
            <span className="text-[11px] font-medium text-ink-secondary bg-surface-subtle px-2.5 py-0.5 rounded-full border border-hairline self-start sm:self-auto font-sans">
              Integration Target (Milestone 3)
            </span>
          </div>
        </div>
      </div>

      {/* Tenant Privacy & Data Security Notice */}
      <section className="p-4 rounded-xl bg-surface border border-hairline flex items-start gap-3 shadow-xs text-xs font-sans">
        <ShieldCheck className="w-4 h-4 text-forest shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-medium text-ink">Data Boundary &amp; Privacy Architecture</p>
          <p className="text-ink-secondary leading-relaxed">
            CampaignEcho never shares memory bank embeddings or post-mortems across tenant organizations. Each brand is provisioned with a dedicated bank ID strictly isolated at both the application API layer and Vectorize Hindsight cloud storage.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
