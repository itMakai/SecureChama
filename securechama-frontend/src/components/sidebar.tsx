"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function Sidebar() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role;

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">SecureChama</h2>
        <p className="mt-1 text-xs text-gray-500">SACCO Workspace</p>
      </div>

      <ul className="space-y-2 text-sm">
        <li className="cursor-pointer rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700">
          Dashboard
        </li>

        {(role === "platform_admin" || role === "sacco_admin" || role === "loan_officer") && (
          <>
            <li className="cursor-pointer rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700">
              Members
            </li>
            <li className="cursor-pointer rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700">
              Loans
            </li>
          </>
        )}

        <li className="cursor-pointer rounded-lg px-3 py-2 font-medium text-gray-700 transition hover:bg-indigo-50 hover:text-indigo-700">
          Savings
        </li>
      </ul>
    </aside>
  );
}
