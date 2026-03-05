"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type Sacco = { id: number; name: string };

export default function JoinPageClient() {
  const params = useSearchParams();
  const saccoFromQuery = params.get("sacco");
  const router = useRouter();

  const [saccos, setSaccos] = useState<Sacco[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [employmentType, setEmploymentType] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [saccoId, setSaccoId] = useState<string>(saccoFromQuery || "");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSaccos = async () => {
      const response = await api.get("saccos/public/");
      setSaccos(response.data);
    };
    fetchSaccos();
  }, []);

  const selectedSaccoName = useMemo(() => {
    const sacco = saccos.find((entry) => `${entry.id}` === `${saccoId}`);
    return sacco?.name;
  }, [saccoId, saccos]);

  const handleJoin = async () => {
    setError("");
    setSubmitting(true);

    try {
      await api.post("members/register/", {
        name,
        email,
        phone_number: phoneNumber,
        employment_type: employmentType,
        monthly_income: monthlyIncome || undefined,
        sacco: saccoId,
      });
      router.push("/login");
    } catch {
      setError("Unable to submit your application right now. Please validate details and retry.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-gray-100 px-6 py-12">
      <div className="mx-auto flex min-h-[80vh] w-full max-w-4xl items-center justify-center">
        <div className="w-full rounded-3xl border border-gray-200 bg-white p-8 shadow-xl md:p-10">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">Membership Application</p>
            <h1 className="mt-2 text-2xl font-semibold text-gray-900">Join SACCO</h1>
            <p className="mt-2 text-sm text-gray-500">
              Submit profile, employment, and income details for membership review.
            </p>
            {selectedSaccoName && <p className="mt-1 text-sm font-medium text-gray-700">Selected: {selectedSaccoName}</p>}
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
            <input
              placeholder="Phone Number"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              placeholder="Employment Type"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setEmploymentType(e.target.value)}
            />
            <input
              placeholder="Monthly Income (KES)"
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              onChange={(e) => setMonthlyIncome(e.target.value)}
            />
            <select
              value={saccoId}
              onChange={(e) => setSaccoId(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select SACCO</option>
              {saccos.map((sacco) => (
                <option key={sacco.id} value={sacco.id}>
                  {sacco.name}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

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
