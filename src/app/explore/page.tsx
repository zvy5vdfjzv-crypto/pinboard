"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import PinGrid from "@/components/pins/PinGrid";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

function ExploreContent() {
  const { authUser } = useAuth();
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category") || "";

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Explorar</h1>

      <div className="flex flex-wrap gap-2 mb-8">
        <Link
          href="/explore"
          className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
            !activeCategory
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
          }`}
        >
          Todas
        </Link>
        {DEFAULT_CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/explore?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              activeCategory === cat.slug
                ? "bg-black text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200"
            }`}
          >
            {cat.icon_emoji} {cat.name}
          </Link>
        ))}
      </div>

      <PinGrid
        key={activeCategory}
        categorySlug={activeCategory || undefined}
        currentUserId={authUser?.id}
      />
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-gray-200 border-t-[#e60023] rounded-full animate-spin" /></div>}>
      <ExploreContent />
    </Suspense>
  );
}
