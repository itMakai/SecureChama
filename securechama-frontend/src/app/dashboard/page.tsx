"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import Card from "@/components/Card";

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      const response = await api.get("analytics/overview/");
      setStats(response.data);
    };

    fetchStats();
  }, []);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
          <p className="mt-1 text-sm text-gray-500">Loading SACCO analytics...</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div
              key={idx}
              className="h-28 animate-pulse rounded-2xl border border-gray-200 bg-white"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Snapshot of your SACCO performance.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Members" value={stats.total_members} />
        <Card title="Total Savings" value={`KES ${stats.total_savings}`} />
        <Card title="Active Loans" value={stats.active_loans} />
        <Card title="Portfolio at Risk" value={`${stats.portfolio_risk}%`} />
      </div>
    </div>
  );
}
