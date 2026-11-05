import React from "react";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { FeatureState } from "@/components/FeatureState";

export default function CampaignHistoryPage() {
  return (
    <PageContainer>
      <PageHeader
        badge="Empirical Observation Ledger"
        badgeSubtext="3 Recorded Historical Records"
        title="Campaign History & Observations"
        description="Review historical campaign records, actual observed performance metrics, and post-mortem causal learnings retained in memory."
      />

      <FeatureState
        category="Historical Performance Ledger"
        title="Campaign History"
        headline="Track empirical performance & lessons"
        description="Every past campaign is an empirical lesson. Historical impressions, conversions, and customer feedback are systematically stored to teach subsequent marketing iterations."
        statusBadge="Observation Ledger Active"
        capabilities={[
          {
            title: "Causal Metric Ingestion",
            description:
              "Records impressions, clicks, conversions, spend, and ROAS with strict distinction between historical observations and causal hypotheses.",
          },
          {
            title: "Post-Mortem Takeaway Retention",
            description:
              "Captures qualitative feedback from sales counters, customer surveys, and comments to document what actually caused outcomes.",
          },
          {
            title: "Negative Pattern Avoidance",
            description:
              "Explicitly flags expensive missteps and ineffective creative formats so future campaign strategies do not repeat proven failures.",
          },
        ]}
        primaryActionText="Return to Overview"
        primaryActionHref="/"
      />
    </PageContainer>
  );
}
