"use client";
import Header from "@/components/common/Header";
import PinGrid from "@/components/pins/PinGrid";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function HomeContent() {
  const searchParams = useSearchParams();
  const category = searchParams.get("category");

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative overflow-hidden py-16 px-4">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600/90 via-pink-500/90 to-amber-400/90" />
          <div className="absolute inset-0 backdrop-blur-sm" />
          <div className="relative max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Descubra imagens incriveis
            </h1>
            <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto">
              Explore, crie com IA e compartilhe as melhores imagens.
              Sua criatividade sem limites.
            </p>
            <div className="flex gap-3 justify-center">
              <Link
                href="/generate"
                className="px-8 py-3 rounded-full bg-white text-purple-600 font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
              >
                Criar com IA
              </Link>
              <Link
                href="/explore"
                className="px-8 py-3 rounded-full border-2 border-white/80 text-white font-semibold hover:bg-white/10 transition-all"
              >
                Explorar
              </Link>
            </div>
          </div>
        </section>

        {/* Pin Grid */}
        <section className="max-w-7xl mx-auto py-8">
          <PinGrid categorySlug={category || undefined} />
        </section>
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense>
      <HomeContent />
    </Suspense>
  );
}
