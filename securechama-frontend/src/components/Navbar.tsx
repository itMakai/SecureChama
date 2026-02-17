"use client";

import { Bell, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

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
    router.push("/login");
  };

  return (
    <div className="h-16 bg-white border-b flex items-center justify-between px-6 shadow-sm">
      
      {/* Left Section */}
      <div className="flex flex-col">
        <span className="text-sm text-gray-500">Current SACCO</span>
        <span className="text-base font-semibold text-gray-800">
          {saccoName}
        </span>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        
        {/* Notifications */}
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
        </button>

        {/* User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-semibold">
              {userName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-gray-700">
              {userName}
            </span>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-xl shadow-lg overflow-hidden">
              <button
                onClick={() => router.push("/dashboard/profile")}
                className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50"
              >
                Profile
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50"
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
