"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import AnalyticsChart from "@/app/dashboard/AnalyticsChart";
import GuarantorNetworkGraph from "@/app/dashboard/GuarantorNetworkGraph";
import LoanStatusChart from "@/app/dashboard/LoanStatusChart";
import RiskBandChart from "@/app/dashboard/RiskBandChart";
import Card from "@/components/Card";
import { AuthContext } from "@/context/AuthContext";
import api from "@/lib/api";

type Analytics = {
  total_members: number;
  total_savings: number;
  active_loans: number;
  portfolio_risk: number;
  avg_risk_score: number;
  high_risk_members: number;
  default_probability: number;
  guarantor_exposure_total: number;
  savings_growth: { month: string; amount: number }[];
  loan_status_distribution: { status: string; count: number }[];
  risk_band_distribution: { risk_band: "low" | "medium" | "high"; count: number }[];
  guarantor_network: {
    guarantor__user__name: string;
    loan__member__user__name: string;
    guaranteed_amount: string;
  }[];
};

export default function DashboardPage() {
  const auth = useContext(AuthContext);
  const [stats, setStats] = useState<Analytics | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await api.get("analytics/overview/");
      setStats(response.data);
    };

    fetchStats();
  }, []);

  const welcome = useMemo(() => {
    if (auth?.user?.role === "member") return "Member Risk & Savings Overview";
    if (auth?.user?.role === "loan_officer") return "Loan Portfolio Control Center";
    if (auth?.user?.role === "sacco_admin") return "SACCO Performance Dashboard";
    return "Platform Operations Dashboard";
  }, [auth?.user?.role]);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="fin-heading text-3xl font-bold">{welcome}</h1>
          <p className="fin-muted mt-1 text-sm">Loading SACCO analytics...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-28 animate-pulse rounded-2xl border border-[#d7e4f0] bg-white" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fin-fade-up">
      <div>
        <h1 className="fin-heading text-3xl font-bold">{welcome}</h1>
        <p className="fin-muted mt-1 text-sm">Risk intelligence and portfolio metrics for your SACCO scope.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Members" value={stats.total_members} />
        <Card title="Total Savings" value={`KES ${stats.total_savings}`} />
        <Card title="Active Loans" value={stats.active_loans} />
        <Card title="Portfolio at Risk" value={`${stats.portfolio_risk}%`} />
        <Card title="Avg Risk Score" value={stats.avg_risk_score} />
        <Card title="High Risk Members" value={stats.high_risk_members} />
        <Card title="Default Probability" value={`${stats.default_probability}%`} />
        <Card title="Guarantor Exposure" value={`KES ${stats.guarantor_exposure_total}`} />
      </div>

      <AnalyticsChart data={stats.savings_growth} />
      <div className="grid gap-6 xl:grid-cols-2">
        <LoanStatusChart data={stats.loan_status_distribution} />
        <RiskBandChart data={stats.risk_band_distribution} />
      </div>
      <GuarantorNetworkGraph data={stats.guarantor_network} />
    </div>
  );
}
