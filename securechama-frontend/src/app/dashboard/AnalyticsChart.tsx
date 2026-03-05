"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type SavingsGrowthPoint = {
  month: string;
  amount: number;
};

export default function AnalyticsChart({ data }: { data: SavingsGrowthPoint[] }) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold">Savings Growth</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#4f46e5" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
