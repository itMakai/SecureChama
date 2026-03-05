"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

type RiskBandPoint = {
  risk_band: "low" | "medium" | "high";
  count: number;
};

const COLOR_MAP: Record<RiskBandPoint["risk_band"], string> = {
  low: "#22c55e",
  medium: "#f59e0b",
  high: "#ef4444",
};

export default function RiskBandChart({ data }: { data: RiskBandPoint[] }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <h2 className="fin-heading mb-4 text-lg font-bold">Risk Band Distribution</h2>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="risk_band" cx="50%" cy="50%" outerRadius={90} label>
            {data.map((entry) => (
              <Cell key={entry.risk_band} fill={COLOR_MAP[entry.risk_band]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
