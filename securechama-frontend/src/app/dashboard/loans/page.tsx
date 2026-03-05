"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type Loan = {
  id: number;
  member_name: string;
  amount: string;
  interest_rate: string;
  term_months: number;
  status: string;
  guarantor_count: number;
};

export default function LoansPage() {
  const [loans, setLoans] = useState<Loan[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      const response = await api.get("loans/?status=pending");
      setLoans(response.data.results || response.data);
    };

    fetchLoans();
  }, []);

  const approveLoan = async (id: number) => {
    await api.post(`loans/${id}/approve/`);
    setLoans((current) => current.filter((loan) => loan.id !== id));
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pending Loan Approvals</h1>
          <p className="mt-1 text-sm text-gray-500">Review risk-linked applications and approve eligible requests.</p>
        </div>
        <p className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">{loans.length} pending</p>
      </div>

      <div className="space-y-3">
        {loans.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            No pending loans at the moment.
          </div>
        )}

        {loans.map((loan) => (
          <div
            key={loan.id}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-indigo-200 hover:bg-indigo-50/40 md:flex-row md:items-center md:justify-between"
          >
            <div>
              <p className="font-medium text-gray-900">{loan.member_name}</p>
              <p className="text-sm text-gray-500">
                KES {loan.amount} | {loan.interest_rate}% | {loan.term_months} months
              </p>
              <p className="text-xs text-gray-500">Guarantors: {loan.guarantor_count || 0}</p>
            </div>

            <button
              onClick={() => approveLoan(loan.id)}
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-green-700"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
