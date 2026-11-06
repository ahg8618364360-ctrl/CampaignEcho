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

export interface MemoryStatusResponse {
  brand_id: string;
  bank_provisioned: boolean;
  service_connected: boolean;
  engine_status: "CONNECTED" | "UNREACHABLE" | "NOT_CONFIGURED" | "AUTH_FAILED";
  version?: string;
  message: string;
  memories_count?: number | null;
  last_verified?: string;
}

export interface MemoryActivityItem {
  id: string;
  brand_id: string;
  operation_type: string;
  context_tag?: string;
  items_count: number;
  status: string;
  latency_ms: number;
  created_at: string;
}

export interface MemoryActivityResponse {
  brand_id: string;
  activities: MemoryActivityItem[];
  total_count: number;
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

export async function fetchMemoryStatus(brandId: string): Promise<MemoryStatusResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/memory/status`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function fetchMemoryActivity(brandId: string): Promise<MemoryActivityResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/memory/activity?limit=20`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}
