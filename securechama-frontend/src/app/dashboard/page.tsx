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

  if (!stats) return <p>Loading...</p>;

  return (
    <div className="grid grid-cols-4 gap-6">
      <Card title="Total Members" value={stats.total_members} />
      <Card title="Total Savings" value={`KES ${stats.total_savings}`} />
      <Card title="Active Loans" value={stats.active_loans} />
      <Card title="Portfolio at Risk" value={`${stats.portfolio_risk}%`} />
    </div>
  );
}
