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
    <PageContainer>
      {/* Header */}
      <PageHeader
        badge="Preferences & Diagnostics"
        badgeSubtext="Local Runtime Environment"
        title="Platform Settings"
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
      <div className="space-y-4">
        <SectionHeading
          title="System Infrastructure Status"
          description="Live connectivity diagnostics across backend services, database persistence, and intelligence engines."
        />

        <div className="divide-y divide-hairline rounded-xl bg-surface border border-hairline shadow-xs">
          {/* Backend API */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Server className="w-4 h-4 text-ink" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink font-sans">FastAPI Backend Service</p>
                <p className="text-xs text-ink-secondary font-sans">
                  Endpoint: <code className="font-mono text-ink">http://127.0.0.1:8000/api/v1</code>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isBackendAlive ? (
                <span className="flex items-center gap-1 text-xs font-medium text-forest bg-forest-subtle px-2.5 py-1 rounded-full border border-forest-border font-sans tabular-nums">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Alive ({health?.latencyMs}ms)</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-alert bg-alert/10 px-2.5 py-1 rounded-full border border-alert/30 font-sans">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Unreachable</span>
                </span>
              )}
            </div>
          </div>

          {/* SQLite Database */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Database className="w-4 h-4 text-ink" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink font-sans">Application Database</p>
                <p className="text-xs text-ink-secondary font-sans">
                  Driver: SQLite 3 via SQLAlchemy 2.0 ORM · Alembic Migrated
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isDbConnected ? (
                <span className="flex items-center gap-1 text-xs font-medium text-forest bg-forest-subtle px-2.5 py-1 rounded-full border border-forest-border font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-alert bg-alert/10 px-2.5 py-1 rounded-full border border-alert/30 font-sans">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Disconnected</span>
                </span>
              )}
            </div>
          </div>

          {/* Vectorize Hindsight */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Brain className="w-4 h-4 text-terracotta" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink font-sans">Vectorize Hindsight Memory Engine</p>
                <p className="text-xs text-ink-secondary font-sans">
                  SDK: <code className="font-mono text-ink">hindsight-client v1.2.0</code> (Native async: aretain, arecall, areflect)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              {isMemoryConnected ? (
                <span className="flex items-center gap-1 text-xs font-medium text-forest bg-forest-subtle px-2.5 py-1 rounded-full border border-forest-border font-sans">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Connected</span>
                </span>
              ) : (
                <span className="flex items-center gap-1 text-xs font-medium text-ink-secondary bg-surface-subtle px-2.5 py-1 rounded-full border border-hairline font-sans">
                  <span>Engine: {memoryStatus?.engine_status || "Checking..."}</span>
                </span>
              )}
            </div>
          </div>

          {/* Groq Cloud */}
          <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-surface-subtle border border-hairline flex items-center justify-center text-ink shrink-0">
                <Cpu className="w-4 h-4 text-ink-secondary" />
              </div>
              <div>
                <p className="text-sm font-medium text-ink font-sans">Groq LLM Inference</p>
                <p className="text-xs text-ink-secondary font-sans">Model: Llama 3.3 70B Versatile</p>
              </div>
            </div>
            <span className="text-xs font-medium text-ink-secondary bg-surface-subtle px-2.5 py-1 rounded-full border border-hairline self-start sm:self-auto font-sans">
              Integration Queued (Milestone 3)
            </span>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
