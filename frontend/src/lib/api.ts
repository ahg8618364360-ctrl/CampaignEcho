export interface HealthLiveResponse {
  status: "alive" | "unreachable";
  latencyMs?: number;
}

export interface HealthReadyResponse {
  status: "ready" | "unready" | "unreachable";
  database: "connected" | "disconnected" | "unknown";
  version?: string;
  latencyMs?: number;
  error?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export async function checkLiveness(): Promise<HealthLiveResponse> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health/live`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json();
      return { status: data.status, latencyMs };
    }
    return { status: "unreachable", latencyMs };
  } catch (err) {
    return { status: "unreachable", latencyMs: Math.round(performance.now() - start) };
  }
}

export async function checkReadiness(): Promise<HealthReadyResponse> {
  const start = performance.now();
  try {
    const res = await fetch(`${API_BASE_URL}/health/ready`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const latencyMs = Math.round(performance.now() - start);

    if (res.ok) {
      const data = await res.json();
      return {
        status: data.status || "ready",
        database: data.database || "connected",
        version: data.version,
        latencyMs,
      };
    }

    if (res.status === 503) {
      const errData = await res.json().catch(() => ({}));
      return {
        status: "unready",
        database: "disconnected",
        latencyMs,
        error: errData.detail?.error || "Database unreachable",
      };
    }

    return {
      status: "unreachable",
      database: "unknown",
      latencyMs,
      error: `HTTP ${res.status}`,
    };
  } catch (err: any) {
    return {
      status: "unreachable",
      database: "unknown",
      latencyMs: Math.round(performance.now() - start),
      error: err.message || "Failed to fetch from backend",
    };
  }
}

