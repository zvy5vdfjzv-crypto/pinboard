"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import PinGrid from "@/components/pins/PinGrid";

function SearchContent() {
  const { authUser } = useAuth();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-6">
      {query && (
        <h1 className="text-2xl font-bold mb-6">
          Resultados para &quot;{query}&quot;
        </h1>
      )}
      <PinGrid
        key={query}
        searchQuery={query || undefined}
        currentUserId={authUser?.id}
      />
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-gray-200 border-t-[#e60023] rounded-full animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  );
}
