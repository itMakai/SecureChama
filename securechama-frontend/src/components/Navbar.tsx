"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearAuthCookies } from "@/lib/auth";

interface NavbarProps {
  userName?: string;
  saccoName?: string;
}

export default function Navbar({
  userName = "Admin User",
  saccoName = "SecureChama SACCO",
}: NavbarProps) {
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
    <div className="flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-6 shadow-sm backdrop-blur">
      
      {/* Left Section */}
      <div className="flex flex-col">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-500">Current SACCO</span>
        <span className="text-base font-semibold text-gray-800">
          {saccoName}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">
        
        {/* Notifications */}
        <button className="relative rounded-full border border-gray-200 p-2 transition hover:bg-gray-100">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 rounded-lg border border-transparent px-3 py-2 transition hover:border-gray-200 hover:bg-gray-100"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {displayName}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {open && (
            <div className="absolute right-0 z-10 mt-2 w-48 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-sm text-red-600 transition hover:bg-red-50"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
