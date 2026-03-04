"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

export default function JoinPage() {
  const params = useSearchParams();
  const saccoId = params.get("sacco");
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleJoin = async () => {
    setError("");
    setSubmitting(true);

    try {
      await api.post("members/register/", {
        name,
        email,
        sacco: saccoId,
      });

      router.push("/login");
    } catch {
      setError("Unable to submit your application right now. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-100 px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-xl md:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
              Membership Application
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">Join SACCO</h1>
            <p className="mt-2 text-sm text-gray-500">
              Complete your details to submit a joining request.
              {saccoId ? ` Selected SACCO ID: ${saccoId}` : ""}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              placeholder="Full Name"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setName(e.target.value)}
            />

            <input
              placeholder="Email"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            onClick={handleJoin}
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </div>
      </div>
    </div>
  );
}
