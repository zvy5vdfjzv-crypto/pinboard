"use client";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/common/Header";
import PinGrid from "@/components/pins/PinGrid";
import { CATEGORIES } from "@/lib/constants";
import Link from "next/link";

function ExploreContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");
  const activeCat = CATEGORIES.find((c) => c.slug === category);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-7xl mx-auto py-6 px-4">
        {/* Category header */}
        {activeCat ? (
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">{activeCat.icon_emoji}</span>
              <h1 className="text-2xl font-bold text-gray-800">
                {activeCat.name}
              </h1>
            </div>
            <Link
              href="/explore"
              className="text-sm text-purple-500 hover:text-purple-700 transition-colors"
            >
              Ver todas as categorias
            </Link>
          </div>
        ) : (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Explorar</h1>
            <p className="text-gray-500 text-sm">
              Descubra imagens incríveis em todas as categorias
            </p>
          </div>
        )}

        {/* Category pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/explore"
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              !category
                ? "btn-gradient text-white"
                : "bg-purple-50 text-purple-600 hover:bg-purple-100"
            }`}
          >
            Tudo
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                category === cat.slug
                  ? "btn-gradient text-white"
                  : "bg-purple-50 text-purple-600 hover:bg-purple-100"
              }`}
            >
              {cat.icon_emoji} {cat.name}
            </Link>
          ))}
        </div>

        <PinGrid categorySlug={category || undefined} />
      </main>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <Suspense>
      <ExploreContent />
    </Suspense>
  );
}
