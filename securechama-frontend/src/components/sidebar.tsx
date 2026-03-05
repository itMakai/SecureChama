"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useMemo } from "react";
import { AuthContext } from "@/context/AuthContext";

type NavItem = { label: string; href: string };

export default function Sidebar() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role;
  const pathname = usePathname();

  const navItems = useMemo<NavItem[]>(() => {
    const base: NavItem[] = [{ label: "Dashboard", href: "/dashboard" }];

    if (role === "platform_admin" || role === "sacco_admin") {
      base.push({ label: "Members", href: "/dashboard/members" });
      base.push({ label: "Join Requests", href: "/dashboard/join-requests" });
      base.push({ label: "Loans", href: "/dashboard/loans" });
      base.push({ label: "Guarantors", href: "/dashboard/guarantors" });
      base.push({ label: "Savings", href: "/dashboard/savings" });
      return base;
    }

    if (role === "loan_officer") {
      base.push({ label: "Loans", href: "/dashboard/loans" });
      base.push({ label: "Guarantors", href: "/dashboard/guarantors" });
      base.push({ label: "Savings", href: "/dashboard/savings" });
      return base;
    }

    base.push({ label: "Savings", href: "/dashboard/savings" });
    return base;
  }, [role]);

  return (
    <aside className="w-64 border-r border-gray-200 bg-white p-6">
      <div className="mb-8">
        <h2 className="text-xl font-bold text-gray-900">SecureChama</h2>
        <p className="mt-1 text-xs text-gray-500">SACCO Workspace</p>
      </div>

      <ul className="space-y-2 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`block rounded-lg px-3 py-2 font-medium transition ${
                  isActive
                    ? "bg-indigo-100 text-indigo-700"
                    : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-700"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
