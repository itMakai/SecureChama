"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthContext } from "@/context/AuthContext";
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (!auth?.loading && !auth?.user) {
      router.push("/login");
    }
  }, [auth, router]);

  if (auth?.loading) return null;

  return (
    <div className="flex h-screen bg-gradient-to-b from-gray-100 to-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar
          userName={auth?.user?.name || auth?.user?.username}
          saccoName={`SACCO ID: ${auth?.user?.sacco_id ?? "N/A"}`}
        />

        <main className="overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
