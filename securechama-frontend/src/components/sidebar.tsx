"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useContext, useMemo } from "react";
import type { ReactNode } from "react";
import { BarChart3, Building2, CircleDollarSign, GitBranch, Users } from "lucide-react";
import { AuthContext } from "@/context/AuthContext";

type NavItem = { label: string; href: string; icon: ReactNode };

export default function Sidebar() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role;
  const pathname = usePathname();

  const navItems = useMemo<NavItem[]>(() => {
    const base: NavItem[] = [{ label: "Dashboard", href: "/dashboard", icon: <BarChart3 size={16} /> }];

    if (role === "platform_admin" || role === "sacco_admin") {
      base.push({ label: "Members", href: "/dashboard/members", icon: <Users size={16} /> });
      base.push({ label: "Join Requests", href: "/dashboard/join-requests", icon: <Building2 size={16} /> });
      base.push({ label: "Loans", href: "/dashboard/loans", icon: <CircleDollarSign size={16} /> });
      base.push({ label: "Guarantors", href: "/dashboard/guarantors", icon: <GitBranch size={16} /> });
      base.push({ label: "Savings", href: "/dashboard/savings", icon: <BarChart3 size={16} /> });
      return base;
    }

    if (role === "loan_officer") {
      base.push({ label: "Loans", href: "/dashboard/loans", icon: <CircleDollarSign size={16} /> });
      base.push({ label: "Guarantors", href: "/dashboard/guarantors", icon: <GitBranch size={16} /> });
      base.push({ label: "Savings", href: "/dashboard/savings", icon: <BarChart3 size={16} /> });
      return base;
    }

    base.push({ label: "Savings", href: "/dashboard/savings", icon: <BarChart3 size={16} /> });
    return base;
  }, [role]);

  return (
    <aside className="hidden w-[270px] border-r border-[#d6e4f0] bg-[linear-gradient(180deg,#0a243e_0%,#112f4f_100%)] px-5 py-6 text-white lg:block">
      <div className="mb-8 border-b border-[#2f4f6f] pb-5">
        <h2 className="text-xl font-bold tracking-tight">SecureChama</h2>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-[#96bad8]">Fintech Command Center</p>
      </div>

      <ul className="space-y-2 text-sm">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 font-semibold transition ${
                  isActive
                    ? "bg-[#1d4f76] text-white shadow-[inset_0_0_0_1px_#3a7fa8]"
                    : "text-[#c8ddf1] hover:bg-[#163d60] hover:text-white"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
