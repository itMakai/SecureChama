"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, UserPlus } from "lucide-react";
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
    <div className="min-h-screen px-6 py-10">
      <div className="mx-auto w-full max-w-5xl rounded-[2rem] border border-[#cfe0ef] bg-white p-8 shadow-[0_25px_55px_rgba(11,31,57,0.13)] md:p-10">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-[#e8fff8] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#0a6d57]">
              <UserPlus size={14} />
              Membership Onboarding
            </p>
            <h1 className="fin-heading mt-3 text-3xl font-bold">Join a SACCO</h1>
            <p className="fin-muted mt-2 text-sm">Complete your profile and submit your request for SACCO review.</p>
          </div>
          {selectedSaccoName && (
            <div className="inline-flex items-center gap-2 rounded-xl border border-[#d4e6f3] bg-[#f6fbff] px-3 py-2 text-sm font-semibold text-[#1e4569]">
              <Building2 size={16} />
              {selectedSaccoName}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <input className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]" placeholder="Full Name" onChange={(e) => setName(e.target.value)} />
          <input className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]" placeholder="Phone Number" onChange={(e) => setPhoneNumber(e.target.value)} />
          <input className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]" placeholder="Employment Type" onChange={(e) => setEmploymentType(e.target.value)} />
          <input className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]" placeholder="Monthly Income (KES)" onChange={(e) => setMonthlyIncome(e.target.value)} />
          <select
            value={saccoId}
            onChange={(e) => setSaccoId(e.target.value)}
            className="w-full rounded-xl border border-[#c7daea] bg-[#fafdff] px-4 py-3 text-sm outline-none transition focus:border-[#2c8f88] focus:ring-2 focus:ring-[#b8f0e8]"
          >
            <option value="">Select SACCO</option>
            {saccos.map((sacco) => (
              <option key={sacco.id} value={sacco.id}>
                {sacco.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button
          onClick={handleJoin}
          disabled={submitting}
          className="mt-6 w-full rounded-xl bg-[var(--brand)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--brand-strong)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? "Submitting..." : "Submit Application"}
        </button>
      </div>
    </div>
  );
}
