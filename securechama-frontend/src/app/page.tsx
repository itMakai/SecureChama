"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import api from "@/lib/api";

interface Sacco {
  id: number;
  name: string;
  description: string;
  benefits: string;
  membership_requirements: string;
  terms_of_service: string;
  base_interest_rate: number;
}

export default function LandingPage() {
  const [saccos, setSaccos] = useState<Sacco[]>([]);

  useEffect(() => {
    const fetchSaccos = async () => {
      const response = await api.get("saccos/public/");
      setSaccos(response.data);
    };
    fetchSaccos();
  }, []);

  return (
    <div className="min-h-screen">
      <section className="fin-grid-bg relative overflow-hidden border-b border-[#d4e5f5]">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
            <div className="fin-fade-up">
              <p className="fin-pill inline-flex items-center gap-2 rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-wide">
                <ShieldCheck size={14} />
                Regulated Multi-Tenant SACCO Platform
              </p>
              <h1 className="fin-heading mt-6 text-4xl font-extrabold leading-tight md:text-6xl">
                Digital Cooperative Banking.
                <br />
                Built for Transparent Lending Risk.
              </h1>
              <p className="fin-muted mt-5 max-w-2xl text-base leading-7 md:text-lg">
                SecureChama helps members discover SACCOs, join seamlessly, and access risk-aware lending while
                officers and admins monitor portfolio health, guarantor exposure, and savings growth in real time.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/join"
                  className="inline-flex items-center gap-2 rounded-xl bg-[var(--brand)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)]"
                >
                  Join a SACCO <ArrowRight size={16} />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#c8ddee] bg-white px-6 py-3 text-sm font-semibold text-[#0b2748] transition hover:bg-[#f5fbff]"
                >
                  Access Dashboard
                </Link>
              </div>
            </div>

            <div className="surface-card fin-fade-up rounded-3xl p-7">
              <h2 className="fin-heading text-lg font-bold">Platform Snapshot</h2>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#d9e8f4] bg-[#f7fcff] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2e5f89]">Active SACCOs</p>
                  <p className="mt-2 text-2xl font-bold text-[#0a1f3a]">{saccos.length}</p>
                </div>
                <div className="rounded-2xl border border-[#d9e8f4] bg-[#f7fcff] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2e5f89]">Risk Engine</p>
                  <p className="mt-2 text-2xl font-bold text-[#0a1f3a]">Live</p>
                </div>
                <div className="rounded-2xl border border-[#d9e8f4] bg-[#f7fcff] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2e5f89]">Tenant Isolation</p>
                  <p className="mt-2 text-sm font-bold text-[#0a1f3a]">Enforced</p>
                </div>
                <div className="rounded-2xl border border-[#d9e8f4] bg-[#f7fcff] p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#2e5f89]">Audit Coverage</p>
                  <p className="mt-2 text-sm font-bold text-[#0a1f3a]">End to End</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#fff7e8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#875b07]">
              <Sparkles size={13} />
              SACCO Discovery
            </p>
            <h2 className="fin-heading mt-3 text-3xl font-bold">Compare and join the right cooperative</h2>
            <p className="fin-muted mt-2 max-w-2xl">
              Each SACCO profile includes benefits, base rates, requirements, and terms so members can make informed choices.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {saccos.map((sacco, idx) => (
            <article key={sacco.id} className="surface-card fin-fade-up rounded-3xl p-6" style={{ animationDelay: `${idx * 40}ms` }}>
              <div className="flex items-start justify-between gap-3">
                <h3 className="fin-heading text-lg font-bold leading-snug">{sacco.name}</h3>
                <span className="rounded-full bg-[#e9fff7] px-3 py-1 text-xs font-bold text-[#09634e]">
                  {sacco.base_interest_rate}% APR
                </span>
              </div>
              <p className="fin-muted mt-3 text-sm leading-6">{sacco.description || "No description provided."}</p>
              <div className="mt-4 rounded-2xl border border-[#dde9f5] bg-[#f8fcff] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2e5f89]">Benefits</p>
                <p className="mt-1 text-sm text-[#1f3652]">{sacco.benefits || "Transparent lending and member growth support"}</p>
              </div>
              <div className="mt-3 rounded-2xl border border-[#dde9f5] bg-[#f8fcff] p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#2e5f89]">Requirements</p>
                <p className="mt-1 text-sm text-[#1f3652]">{sacco.membership_requirements || "See onboarding details."}</p>
              </div>
              <Link
                href={`/join?sacco=${sacco.id}`}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b2748] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#14365e]"
              >
                View Details & Join
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
