"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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

const CheckIcon = () => (
  <svg
    className="mr-2 mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

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
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-100 selection:text-blue-900">
      <section className="relative overflow-hidden border-b border-slate-200 bg-white">
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-blue-100 to-emerald-50 opacity-50 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" />
        </div>

        <div className="mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <p className="inline-flex items-center rounded-full bg-slate-100 px-4 py-1.5 text-xs font-semibold tracking-wide text-slate-700 ring-1 ring-inset ring-slate-200">
            <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500" />
            Regulated & Secure Platform
          </p>
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
            Smarter Savings.
            <br />
            <span className="text-blue-600">Fairer Credit.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Discover SACCOs, compare membership terms, and join a cooperative with transparent risk-aware lending.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-4">
            <Link
              href="/join"
              className="rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-slate-800"
            >
              Start Membership
            </Link>
            <Link
              href="/login"
              className="rounded-xl bg-white px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-all hover:bg-slate-50"
            >
              Member Login
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 sm:py-24">
        <div className="mb-12 md:flex md:items-end md:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Available SACCOs</h2>
            <p className="mt-4 text-lg text-slate-600">Explore benefits, rates, and membership requirements.</p>
          </div>
          <div className="mt-4 flex items-center gap-2 md:mt-0">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {saccos.length}
            </span>
            <span className="text-sm font-medium text-slate-600">Active Partners</span>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {saccos.map((sacco) => (
            <article
              key={sacco.id}
              className="group flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-blue-200"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h3 className="line-clamp-2 text-xl font-bold text-slate-900">{sacco.name}</h3>
                  <span className="inline-flex shrink-0 items-center rounded-full bg-emerald-50 px-3 py-1 text-sm font-bold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
                    {sacco.base_interest_rate}% APR
                  </span>
                </div>

                <p className="mt-4 text-sm leading-6 text-slate-600">{sacco.description || "No description provided."}</p>

                <div className="mt-6 border-t border-slate-100 pt-6">
                  <ul className="space-y-3 text-sm text-slate-700">
                    {(sacco.benefits || "Transparent lending, Risk intelligence, Membership growth").split(",").map((benefit, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckIcon />
                        <span>{benefit.trim()}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="rounded-2xl bg-slate-50 p-4 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-200/50">
                  <p>Requirements: {sacco.membership_requirements || "See SACCO terms for full criteria."}</p>
                  <p className="mt-2">Terms: {sacco.terms_of_service || "Available during onboarding."}</p>
                </div>

                <Link
                  href={`/join?sacco=${sacco.id}`}
                  className="block w-full rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-inset ring-slate-300 transition-all group-hover:bg-slate-900 group-hover:text-white group-hover:ring-slate-900 hover:bg-slate-50"
                >
                  View Details & Join
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
