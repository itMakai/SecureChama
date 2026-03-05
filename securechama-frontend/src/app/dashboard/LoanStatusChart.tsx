"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type LoanStatusPoint = {
  status: string;
  count: number;
};

export default function LoanStatusChart({ data }: { data: LoanStatusPoint[] }) {
  return (
    <div className="surface-card rounded-2xl p-6">
      <h2 className="fin-heading mb-4 text-lg font-bold">Loan Status Distribution</h2>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="status" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Bar dataKey="count" fill="#0f766e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
