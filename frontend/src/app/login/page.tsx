"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageContainer } from "@/components/PageContainer";
import { Button } from "@/components/Button";
import { useAuth } from "@/lib/auth-context";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email.trim(), password);
    setIsSubmitting(false);

    if (res.success) {
      if (typeof window !== "undefined") {
        const searchParams = new URLSearchParams(window.location.search);
        const nextParam = searchParams.get("next");
        const safeNext = nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : null;

        if ((res.brandsCount ?? 0) === 0) {
          router.push("/onboarding");
        } else {
          router.push(safeNext || "/workspace");
        }
      } else {
        router.push("/workspace");
      }
    } else {
      setError(res.error || "Authentication failed. Please verify your credentials.");
    }
  };

  return (
    <PageContainer>
      <div className="max-w-md mx-auto my-10 p-8 rounded-2xl bg-surface border border-hairline shadow-sm">
        <div className="flex items-center gap-3.5 mb-6 pb-5 border-b border-hairline/60">
          <div className="w-10 h-10 rounded-xl bg-surface-subtle border border-hairline flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5 text-terracotta" />
          </div>
          <div>
            <h1 className="font-serif text-2xl text-ink font-normal leading-tight">
              Sign In to CampaignEcho
            </h1>
            <p className="font-sans text-xs text-ink-secondary mt-0.5">
              Access your authentic workspaces &amp; cognitive memory banks
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-alert-subtle border border-alert-border text-alert text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="font-sans font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-ink-secondary mb-1.5">
              Work Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-subtle border border-hairline text-ink text-sm font-sans placeholder:text-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/30 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-mono uppercase tracking-wider text-ink-secondary">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-muted absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-surface-subtle border border-hairline text-ink text-sm font-sans placeholder:text-muted focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta/30 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 text-sm font-semibold flex items-center justify-center gap-2 bg-terracotta hover:bg-terracotta/90 text-white rounded-xl shadow-xs"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <div className="mt-6 pt-5 border-t border-hairline/60 flex items-center justify-between text-xs text-ink-secondary">
          <span>Need an account?</span>
          <Link href="/register" className="text-terracotta hover:underline font-medium">
            Create user workspace
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}
