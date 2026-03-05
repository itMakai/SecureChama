"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, LockKeyhole, ShieldCheck } from "lucide-react";
import { jwtDecode } from "jwt-decode";
import api from "@/lib/api";
import { AuthContext, defaultDashboardRoute } from "@/context/AuthContext";

type JwtPayload = {
  role?: "platform_admin" | "sacco_admin" | "loan_officer" | "member";
};

export default function LoginPage() {
  const router = useRouter();
  const auth = useContext(AuthContext);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setError("");
    setSubmitting(true);
    try {
      const response = await api.post("token/", { username, password });
      auth?.login(response.data.access, response.data.refresh);
      const decoded = jwtDecode<JwtPayload>(response.data.access);
      router.push(defaultDashboardRoute(decoded.role));
    } catch {
      setError("Invalid credentials. Please check username and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto grid min-h-[86vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-[#cfe0ef] bg-white shadow-[0_30px_60px_rgba(12,31,53,0.14)] md:grid-cols-[1.05fr_0.95fr]">
        <div className="fin-grid-bg hidden border-r border-[#d9e7f4] bg-[linear-gradient(180deg,#08253e_0%,#103f62_100%)] p-10 text-white md:flex md:flex-col md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-[#5ca6cf] bg-[#0f486f] px-3 py-1 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck size={14} />
              SecureChama Access
            </p>
            <h1 className="mt-6 text-4xl font-bold leading-tight">Professional SACCO intelligence workspace</h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#cbe7ff]">
              Authenticate once and access role-based analytics, lending operations, member records, and audit-ready activity logs.
            </p>
          </div>
          <div className="space-y-3 text-sm text-[#d5ecff]">
            <p className="flex items-center gap-2"><BarChart3 size={16} /> Portfolio and risk dashboards</p>
            <p className="flex items-center gap-2"><LockKeyhole size={16} /> JWT-secured tenant boundaries</p>
          </div>
        </div>

        <div className="p-8 md:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#2b638f]">Welcome Back</p>
          <h2 className="fin-heading mt-2 text-3xl font-bold">Sign in to continue</h2>
          <p className="fin-muted mt-2 text-sm">Use your assigned credentials to access your SACCO dashboard.</p>

          <div className="mt-8 space-y-4">
            <input
              className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]"
              placeholder="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
