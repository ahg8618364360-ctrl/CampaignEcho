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
  service_state:
    | "NOT_CONFIGURED"
    | "ENDPOINT_UNREACHABLE"
    | "AUTH_REQUIRED"
    | "AUTHENTICATED"
    | "BANK_NOT_PROVISIONED"
    | "BANK_PROVISIONED"
    | "OPERATIONS_VERIFIED";
  bank_provisioned: boolean;
  service_connected: boolean;
  engine_status: string;
  version?: string;
  message: string;
  memories_count?: number | null;
  has_api_key?: boolean;
  verification_run_id?: string | null;
  verified_at?: string | null;
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

export interface LiveMemoryRecord {
  id: string;
  content: string;
  tags: string[];
  provenance: string;
  is_synthetic: boolean;
  score?: number;
  timestamp?: string;
  category: string;
}

export interface MemoryExploreResponse {
  brand_id: string;
  status: MemoryStatusResponse;
  live_records: LiveMemoryRecord[];
  activities: MemoryActivityItem[];
}

export interface ReelConcept {
  concept_title: string;
  hook: string;
  visual_direction: string;
  script_or_caption: string;
  call_to_action: string;
  supporting_memory_id?: string | null;
  supporting_memory_quote?: string | null;
}

export interface MemoryCitation {
  memory_id?: string | null;
  observation: string;
  category: string;
  provenance: string;
  is_synthetic: boolean;
  relevance_score?: number | null;
}

export interface EpistemicTriad {
  observed_facts: string[];
  strategic_inferences: string[];
  actionable_recommendations: string[];
  unresolved_uncertainties: string[];
}

export interface CampaignStrategyOutput {
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
  hindsight_reflection_summary?: string | null;
  llm_provider: string;
  llm_model: string;
  fallback_used: boolean;
}

export interface ComparisonDimensionCheck {
  dimension: string;
  label: string;
  mode_a_result: string;
  mode_b_result: string;
  detail: string;
  is_grounded: boolean;
}

export interface ComparisonSummary {
  retrieved_memories_count: number;
  mode_a_citations_count: number;
  mode_b_citations_count: number;
  avoided_past_mistakes: string[];
  brand_rule_compliance: string[];
  strategic_differences: string[];
  uncertainties: string[];
  dimension_checks: ComparisonDimensionCheck[];
  fairness_disclosure: string;
}

export interface CampaignComparisonRequest {
  brand_id: string;
  name: string;
  objective: string;
  platform: string;
  target_audience?: string;
  budget?: number;
  offer_or_promotion?: string;
  constraints?: string;
  primary_kpi?: string;
  content_language?: string;
  geographic_market?: string;
  preferred_provider?: string;
}

export interface CampaignComparisonResponse {
  id: string;
  brand_id: string;
  brand_name: string;
  name: string;
  campaign_brief: any;
  provider: string;
  model: string;
  generation_parameters: any;
  prompt_version: string;
  baseline_status: string;
  memory_status: string;
  baseline_strategy: CampaignStrategyOutput;
  memory_strategy: CampaignStrategyOutput;
  retrieved_memory_references: any[];
  reflection_metadata?: any;
  comparison_summary: ComparisonSummary;
  created_at: string;
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
  } catch {
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

export async function fetchMemoryExplore(
  brandId: string,
  query: string = "campaign marketing audience performance"
): Promise<MemoryExploreResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/brands/${brandId}/memory/explore?query=${encodeURIComponent(query)}`,
      {
        cache: "no-store",
        headers: { Accept: "application/json" },
      }
    );
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
}

export async function executeComparison(
  req: CampaignComparisonRequest
): Promise<CampaignComparisonResponse> {
  const res = await fetch(`${API_BASE_URL}/campaigns/compare`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(req),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail?.message || errorData.detail || `Comparison failed with HTTP ${res.status}`);
  }

  return await res.json();
}

export async function fetchComparison(
  comparisonId: string
): Promise<CampaignComparisonResponse | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/campaigns/compare/${comparisonId}`, {
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

export async function fetchComparisons(
  brandId?: string
): Promise<CampaignComparisonResponse[]> {
  try {
    const url = brandId
      ? `${API_BASE_URL}/campaigns/compare?brand_id=${brandId}`
      : `${API_BASE_URL}/campaigns/compare`;
    const res = await fetch(url, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (res.ok) {
      return await res.json();
    }
    return [];
  } catch {
    return [];
  }
}
