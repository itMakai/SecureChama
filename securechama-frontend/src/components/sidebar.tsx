"use client";

import { useContext } from "react";
import { AuthContext } from "@/context/AuthContext";

export default function Sidebar() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role;

  return (
    <div className="w-64 bg-white border-r p-6">
      <h2 className="text-xl font-bold mb-8">SecureChama</h2>

      <ul className="space-y-4 text-sm">
        <li className="hover:text-black cursor-pointer">Dashboard</li>

        {(role === "ADMIN" || role === "MANAGER") && (
          <>
            <li className="hover:text-black cursor-pointer">Members</li>
            <li className="hover:text-black cursor-pointer">Loans</li>
          </>
        )}

        <li className="hover:text-black cursor-pointer">Savings</li>
      </ul>
    </div>
  );
}
