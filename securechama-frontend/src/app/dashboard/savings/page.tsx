"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type SavingsTransaction = {
  id: number;
  transaction_type: "deposit" | "withdrawal";
  amount: string;
  reference: string;
  created_at: string;
};

export default function SavingsPage() {
  const [rows, setRows] = useState<SavingsTransaction[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await api.get("savings-transactions/");
      setRows(response.data.results || response.data);
    };
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Savings Transactions</h1>
      <p className="mt-1 text-sm text-gray-500">Deposits and withdrawals with automatic balance impact.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Reference</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.id}>
                <td className="px-4 py-3 capitalize text-gray-700">{row.transaction_type}</td>
                <td className="px-4 py-3 text-gray-700">KES {row.amount}</td>
                <td className="px-4 py-3 text-gray-700">{row.reference || "-"}</td>
                <td className="px-4 py-3 text-gray-700">{new Date(row.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          No savings transactions found.
        </div>
      )}
    </div>
  );
}
