"use client";

import { useState, useContext } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthContext } from "@/context/AuthContext";
import { jwtDecode } from "jwt-decode";

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
      const response = await api.post("token/", {
        username,
        password,
      });

      auth?.login(response.data.access, response.data.refresh);

      const decoded = jwtDecode<JwtPayload>(response.data.access);
      const role = decoded.role;

      if (role === "loan_officer") {
        router.push("/dashboard/loans");
      } else if (role === "platform_admin" || role === "sacco_admin") {
        router.push("/dashboard/members");
      } else {
        router.push("/dashboard");
      }

    } catch {
      setError("Invalid credentials. Please check username and password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-100 px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl md:grid-cols-2">
          <div className="hidden bg-indigo-600 p-10 text-white md:flex md:flex-col md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-indigo-100">
                SecureChama
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight">
                Welcome back to your SACCO workspace
              </h1>
              <p className="mt-4 text-sm text-indigo-100">
                Track savings, review loans, and make risk-aware decisions in one place.
              </p>
            </div>
            <p className="text-xs text-indigo-100">Secure access for members, officers, and admins.</p>
          </div>

          <div className="p-8 md:p-10">
            <h2 className="text-2xl font-semibold text-gray-900">Login</h2>
            <p className="mt-2 text-sm text-gray-500">Use your account credentials to continue.</p>

            <div className="mt-8 space-y-4">
              <input
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Username"
                onChange={(e) => setUsername(e.target.value)}
              />

              <input
                type="password"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}

            <button
              onClick={handleLogin}
              disabled={submitting}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {submitting ? "Signing in..." : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
