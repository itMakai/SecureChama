"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type SavingsGrowthPoint = {
  month: string;
  amount: number;
};

export default function AnalyticsChart({ data }: { data: SavingsGrowthPoint[] }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <h2 className="fin-heading mb-4 text-lg font-bold">Savings Growth</h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="amount" stroke="#0f766e" strokeWidth={2.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
