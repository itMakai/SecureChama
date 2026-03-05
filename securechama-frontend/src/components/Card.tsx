interface CardProps {
  title: string;
  value: string | number;
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="surface-card rounded-2xl p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_35px_rgba(14,30,57,0.12)]">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#37638c]">{title}</p>
      <h2 className="mt-2 text-2xl font-bold text-[#0b223f]">{value}</h2>
    </div>
  );
}
