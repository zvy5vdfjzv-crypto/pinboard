"use client";
import { useAuth } from "@/hooks/useAuth";
import PinGrid from "@/components/pins/PinGrid";
import Link from "next/link";
import { DEFAULT_CATEGORIES } from "@/lib/constants";

export default function HomePage() {
  const { authUser, loading } = useAuth();

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-6">
      {/* Categories bar */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
        <Link
          href="/"
          className="shrink-0 px-4 py-2 bg-black text-white rounded-full text-sm font-semibold"
        >
          Tudo
        </Link>
        {DEFAULT_CATEGORIES.slice(0, 12).map((cat) => (
          <Link
            key={cat.slug}
            href={`/explore?category=${cat.slug}`}
            className="shrink-0 px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
          >
            {cat.icon_emoji� {cat.name}
          </Link>
        ))}
      </div>

      {/* Hero for non-logged users */}
      {!loading && !authUser && (
        <div className="text-center py-16 mb-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Descubra imagens incríveis
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
            Explore, salve e compartilhe as melhores imagens da internet.
            Crie suas coleções e inspire-se.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/register"
              className="px-8 py-3 bg-[#e60023] text-white rounded-full font-semibold text-lg hover:bg-[#cc001f] transition"
            >
              Comece agora
            </Link>
            <Link
              href="/explore"
              className="px-8 py-3 bg-white text-gray-800 rounded-full font-semibold text-lg hover:bg-gray-100 transition shadow-sm"
            >
              Explorar
            </Link>
          </div>
        </div>
      )}

      {/* Pin grid */}
      <PinGrid currentUserId={authUser?.id} />
    </div>
  );
}
