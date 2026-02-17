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
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h1 className="text-xl font-semibold mb-6">Members</h1>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="pb-3">Name</th>
            <th>Membership No.</th>
            <th>Savings</th>
            <th>Risk Score</th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr key={member.id} className="border-b">
              <td className="py-3">{member.name}</td>
              <td>{member.membership_number}</td>
              <td>KES {member.total_savings}</td>
              <td>{member.risk_score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
