"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth-context";
import {
  Building2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Target,
  Zap,
  Tag,
  Users,
  Compass,
  AlertCircle,
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1";

export default function OnboardingPage() {
  const router = useRouter();
  const { user, refreshBrands, setActiveBrandId } = useAuth();

  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("Retail & E-Commerce");
  const [description, setDescription] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [marketRegion, setMarketRegion] = useState("");
  const [brandVoice, setBrandVoice] = useState("Authoritative, Fresh, Direct");
  const [website, setWebsite] = useState("");
  const [instagramHandle, setInstagramHandle] = useState("");
  const [productsOrServices, setProductsOrServices] = useState("");
  const [uniqueSellingPoints, setUniqueSellingPoints] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [keyOffers, setKeyOffers] = useState("");
  const [competitors, setCompetitors] = useState("");
  const [restrictions, setRestrictions] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim() || !targetAudience.trim() || !marketRegion.trim()) {
      setError("Please fill in all required identity fields (Business Name, Description, Target Audience, and Market Region).");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        industry: industry.trim(),
        description: description.trim(),
        target_audience: targetAudience.trim(),
        market_region: marketRegion.trim(),
        brand_voice: brandVoice.trim(),
        preferred_language: "en",
        restrictions: restrictions.trim() || undefined,
        website: website.trim() || undefined,
        instagram_handle: instagramHandle.trim() || undefined,
        products_or_services: productsOrServices.trim() || undefined,
        unique_selling_points: uniqueSellingPoints.trim() || undefined,
        price_range: priceRange.trim() || undefined,
        key_offers: keyOffers.trim() || undefined,
        competitors: competitors.trim() || undefined,
      };

      const res = await fetch(`${API_BASE}/brands`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Server returned ${res.status}`);
      }

      const brandData = await res.json();
      await refreshBrands();
      setActiveBrandId(brandData.id);
      router.push("/campaign-studio");
    } catch (err: any) {
      setError(err.message || "Failed to create business workspace.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageContainer>
      <PageHeader
        badge="Multi-Brand Workspaces"
        badgeSubtext={user ? `Authenticated as ${user.email}` : "Guest / Local Mode"}
        title="Create Business Workspace"
        description="Configure an authentic business profile with dedicated 1:1 Vectorize Hindsight cognitive memory."
      />

      <div className="max-w-4xl mx-auto mt-6">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Business Identity */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">1. Business Identity</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex Performance Gear"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Industry Vertical *
                </label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                >
                  <option value="Retail & E-Commerce">Retail & E-Commerce</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Health, Fitness & Wellness">Health, Fitness & Wellness</option>
                  <option value="SaaS & Technology">SaaS & Technology</option>
                  <option value="Consumer Electronics">Consumer Electronics</option>
                  <option value="Beauty & Personal Care">Beauty & Personal Care</option>
                  <option value="Professional Services">Professional Services</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Market Region / Headquarters *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Austin, TX (National DTC)"
                  value={marketRegion}
                  onChange={(e) => setMarketRegion(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Brand Voice & Tone *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Energetic, punchy, irreverent"
                  value={brandVoice}
                  onChange={(e) => setBrandVoice(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Website URL
                </label>
                <input
                  type="url"
                  placeholder="https://apexgear.example.com"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Instagram Handle
                </label>
                <input
                  type="text"
                  placeholder="@apexperformance"
                  value={instagramHandle}
                  onChange={(e) => setInstagramHandle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>
            </div>

            <div className="pt-2">
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                Business Description & Narrative *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describe your business, mission, and core customer value proposition..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
              />
            </div>
          </div>

          {/* Section 2: Commercial Positioning & Offerings */}
          <div className="p-6 rounded-2xl bg-card border border-border space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-border/60">
              <Target className="w-5 h-5 text-primary" />
              <h2 className="text-base font-semibold text-foreground">
                2. Commercial Positioning & Offerings
              </h2>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                Target Audience Breakdown *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. Marathon runners, CrossFitters, and fitness enthusiasts aged 22-40 seeking technical gear."
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Core Products or Services
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ultra-vented running shorts, seamless compression tops"
                  value={productsOrServices}
                  onChange={(e) => setProductsOrServices(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Price Range
                </label>
                <input
                  type="text"
                  placeholder="e.g. $45 - $120"
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Unique Selling Points (USPs)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 100% recycled technical fabric, zero chafing guarantee"
                  value={uniqueSellingPoints}
                  onChange={(e) => setUniqueSellingPoints(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Key Promotional Offers
                </label>
                <input
                  type="text"
                  placeholder="e.g. Free shipping on first 2 orders with code APEX20"
                  value={keyOffers}
                  onChange={(e) => setKeyOffers(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Key Competitors
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lululemon, Gymshark, Ten Thousand"
                  value={competitors}
                  onChange={(e) => setCompetitors(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase text-muted-foreground mb-1">
                  Brand Restrictions / Guardrails
                </label>
                <input
                  type="text"
                  placeholder="e.g. Never make medical claims; avoid aggressive slang"
                  value={restrictions}
                  onChange={(e) => setRestrictions(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg bg-surface border border-border text-foreground text-sm focus:outline-none focus:border-primary/60"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Isolated Vectorize Hindsight memory bank provisioned automatically.</span>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>Provisioning Workspace...</span>
                </>
              ) : (
                <>
                  <span>Create Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </PageContainer>
  );
}
