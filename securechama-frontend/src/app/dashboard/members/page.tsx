"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function MembersPage() {
  const [members, setMembers] = useState<any[]>([]);

  useEffect(() => {
    const fetchMembers = async () => {
      const response = await api.get("members/");
      setMembers(response.data.results);
    };

    fetchMembers();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Members</h1>
          <p className="mt-1 text-sm text-gray-500">Directory of SACCO members and profile risk summary.</p>
        </div>
        <p className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          {members.length} members
        </p>
      </div>

      {members.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          No members found.
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Membership No.</th>
                <th className="px-4 py-3">Savings</th>
                <th className="px-4 py-3">Risk Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-indigo-50/40">
                  <td className="px-4 py-3 font-medium text-gray-900">{member.name}</td>
                  <td className="px-4 py-3 text-gray-600">{member.membership_number}</td>
                  <td className="px-4 py-3 text-gray-700">KES {member.total_savings}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {member.risk_score ?? "N/A"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
