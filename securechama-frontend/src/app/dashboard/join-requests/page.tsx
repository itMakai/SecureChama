"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type JoinRequest = {
  id: number;
  user_name: string;
  user_email: string;
  sacco_name: string;
  status: string;
  created_at: string;
};

export default function JoinRequestsPage() {
  const [rows, setRows] = useState<JoinRequest[]>([]);

  useEffect(() => {
    const load = async () => {
      const response = await api.get("join-requests/?status=pending");
      setRows(response.data.results || response.data);
    };
    load();
  }, []);

  const decide = async (id: number, action: "approve" | "reject") => {
    await api.post(`join-requests/${id}/${action}/`);
    setRows((current) => current.filter((entry) => entry.id !== id));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pending Join Requests</h1>
          <p className="mt-1 text-sm text-gray-500">Approve or reject new SACCO membership requests.</p>
        </div>
        <p className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{rows.length} pending</p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-col gap-3 rounded-xl border border-gray-200 p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-medium text-gray-900">{row.user_name}</p>
              <p className="text-sm text-gray-500">{row.user_email}</p>
              <p className="text-xs text-gray-500">{row.sacco_name}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => decide(row.id, "approve")}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Approve
              </button>
              <button
                onClick={() => decide(row.id, "reject")}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Reject
              </button>
            </div>
          </div>
        ))}

        {rows.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            No pending join requests.
          </div>
        )}
      </div>
    </div>
  );
}
