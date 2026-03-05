"use client";

import { Bell, ChevronDown, LogOut } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/lib/auth";

interface NavbarProps {
  userName?: string;
  saccoName?: string;
}

export default function Navbar({ userName = "Admin User", saccoName = "SecureChama SACCO" }: NavbarProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    clearAuthCookies();
    router.push("/login");
  };

  const displayName = userName || "User";

  return (
    <div className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[#d5e3f0] bg-white/85 px-4 backdrop-blur md:px-6">
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#51779b]">Current Workspace</span>
        <span className="text-sm font-semibold text-[#15314d] md:text-base">{saccoName}</span>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative rounded-xl border border-[#c9dbeb] bg-[#f7fbff] p-2.5 transition hover:bg-[#edf6ff]">
          <Bell size={18} className="text-[#355a7d]" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[var(--accent)]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-xl border border-[#c9dbeb] bg-white px-3 py-2 transition hover:bg-[#f7fbff]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-sm font-semibold text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="hidden text-sm font-semibold text-[#15314d] sm:inline">{displayName}</span>
            <ChevronDown size={16} className="text-[#5a7d9e]" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 overflow-hidden rounded-xl border border-[#d7e4f0] bg-white shadow-lg">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold text-red-700 transition hover:bg-red-50"
              >
                <LogOut size={15} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
