interface CardProps {
  title: string;
  value: string | number;
}

export default function Card({ title, value }: CardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <h2 className="mt-2 text-2xl font-semibold text-gray-900">{value}</h2>
    </div>
  );
}
