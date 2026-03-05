import { Suspense } from "react";
import JoinPageClient from "./JoinPageClient";

export default function JoinPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <JoinPageClient />
    </Suspense>
  );
}
