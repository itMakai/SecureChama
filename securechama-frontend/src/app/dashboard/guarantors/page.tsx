"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type ExposureRow = {
  guarantor: number;
  guarantor__user__name: string;
  total_exposure: string;
  guaranteed_loans: number;
};

export default function GuarantorsPage() {
  const [rows, setRows] = useState<ExposureRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await api.get("guarantor-relationships/exposure/");
      setRows(response.data);
    };
    load();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-xl font-semibold text-gray-900">Guarantor Exposure</h1>
      <p className="mt-1 text-sm text-gray-500">Concentration and cross-member guarantee pressure.</p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Guarantor</th>
              <th className="px-4 py-3">Guaranteed Loans</th>
              <th className="px-4 py-3">Total Exposure</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.guarantor}>
                <td className="px-4 py-3 font-medium text-gray-900">{row.guarantor__user__name}</td>
                <td className="px-4 py-3 text-gray-700">{row.guaranteed_loans}</td>
                <td className="px-4 py-3 text-gray-700">KES {row.total_exposure}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <div className="mt-4 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          No guarantor exposure data available.
        </div>
      )}
    </div>
  );
}
