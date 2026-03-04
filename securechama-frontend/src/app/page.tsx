import Link from "next/link";

interface Sacco {
  id: number;
  name: string;
  description: string;
  benefits: string;
  terms_summary: string;
  interest_rate: number;
}

const SACCOS: Sacco[] = [
  {
    id: 1,
    name: "Imara Women SACCO",
    description:
      "Community-led savings and small business loans tailored for women entrepreneurs.",
    benefits: "Lower guarantor burden, emergency loans, SME growth coaching",
    terms_summary: "Minimum monthly saving: KES 2,000. Loan term up to 24 months.",
    interest_rate: 11.5,
  },
  {
    id: 2,
    name: "Jitegemee Youth SACCO",
    description:
      "Flexible savings plans and startup-friendly lending for young professionals.",
    benefits: "Quick onboarding, digital statements, youth enterprise financing",
    terms_summary: "Minimum monthly saving: KES 1,000. Loan term up to 18 months.",
    interest_rate: 12.0,
  },
  {
    id: 3,
    name: "Afya Workers SACCO",
    description:
      "Savings and welfare lending designed for healthcare and social service workers.",
    benefits: "Salary-backed products, medical emergency support, insurance linkage",
    terms_summary: "Minimum monthly saving: KES 2,500. Loan term up to 36 months.",
    interest_rate: 10.75,
  },
  {
    id: 4,
    name: "Kilimo Growth SACCO",
    description:
      "Farmer-focused SACCO supporting seasonal savings and agribusiness credit cycles.",
    benefits: "Harvest-aligned repayments, input financing, group risk pooling",
    terms_summary: "Minimum monthly saving: KES 1,500. Loan term up to 12 months.",
    interest_rate: 9.5,
  },
  {
    id: 5,
    name: "Transit Staff SACCO",
    description:
      "Savings and credit services for transport and logistics professionals.",
    benefits: "Fast loan review, predictable deductions, family welfare options",
    terms_summary: "Minimum monthly saving: KES 1,800. Loan term up to 24 months.",
    interest_rate: 11.0,
  },
  {
    id: 6,
    name: "Unity Teachers SACCO",
    description:
      "Reliable savings and education-centered loans for teachers and tutors.",
    benefits: "School fee bridge loans, long-term savings plans, transparent terms",
    terms_summary: "Minimum monthly saving: KES 2,000. Loan term up to 30 months.",
    interest_rate: 10.25,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-gray-50">
      <section className="border-b border-indigo-100">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-4 py-1 text-xs font-semibold tracking-wide text-indigo-700">
            Digital Savings • Risk-Aware Lending • Transparent Governance
          </p>
          <h1 className="mt-6 text-4xl font-bold text-gray-900 md:text-5xl">
            SecureChama
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
            A multi-SACCO digital platform that helps members save confidently and
            access fair credit decisions.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              Login
            </Link>
            <Link
              href="/join?sacco=1"
              className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Start Membership
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Available SACCOs</h2>
            <p className="mt-2 text-sm text-gray-600">
              Explore available SACCOs and apply directly from the marketplace.
            </p>
          </div>
          <p className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-medium text-gray-600">
            {SACCOS.length} listed SACCOs
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SACCOS.map((sacco) => (
            <article
              key={sacco.id}
              className="group rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <h3 className="text-lg font-semibold text-gray-900">{sacco.name}</h3>

              <p className="mt-2 text-sm leading-6 text-gray-600">{sacco.description}</p>

              <div className="mt-4 space-y-2 text-sm text-gray-700">
                <p>
                  <span className="font-semibold">Benefits:</span> {sacco.benefits}
                </p>
                <p>
                  <span className="font-semibold">Loan Interest:</span> {sacco.interest_rate}%
                </p>
              </div>

              <p className="mt-4 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                {sacco.terms_summary}
              </p>

              <Link
                href={`/join?sacco=${sacco.id}`}
                className="mt-6 block rounded-lg bg-indigo-600 py-2.5 text-center text-sm font-semibold text-white transition group-hover:bg-indigo-700"
              >
                Join SACCO
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
