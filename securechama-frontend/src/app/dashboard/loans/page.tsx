"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export default function LoansPage() {
  const [loans, setLoans] = useState<any[]>([]);

  useEffect(() => {
    const fetchLoans = async () => {
      const response = await api.get("loans/?status=PENDING");
      setLoans(response.data.results);
    };

    fetchLoans();
  }, []);

  const approveLoan = async (id: number) => {
    await api.post(`loans/${id}/approve/`);
    setLoans(loans.filter((loan) => loan.id !== id));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm">
      <h1 className="text-xl font-semibold mb-6">Pending Loan Approvals</h1>

      <div className="space-y-4">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="flex justify-between items-center border p-4 rounded-lg"
          >
            <div>
              <p className="font-medium">{loan.member_name}</p>
              <p className="text-sm text-gray-500">
                Amount: KES {loan.amount}
              </p>
            </div>

            <button
              onClick={() => approveLoan(loan.id)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg"
            >
              Approve
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
