"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { APP_NAME } from "@/lib/constants";

export default function Header() {
  const { authUser, profile, loading, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-[1800px] mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-[#e60023] rounded-full flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.15 9.42 7.6 11.2-.1-.94-.2-2.4.04-3.44.22-.94 1.4-5.94 1.4-5.94s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.76 1.52 1.68 0 1.02-.66 2.56-1 3.98-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.26 3.78-5.5 0-2.88-2.06-4.88-5.02-4.88-3.42 0-5.42 2.56-5.42 5.22 0 1.04.4 2.14.9 2.74.1.12.1.22.08.32-.1.38-.3 1.2-.34 1.36-.06.22-.18.26-.4.16-1.48-.7-2.4-2.86-2.4-4.6 0-3.76 2.72-7.2 7.86-7.2 4.12 0 7.32 2.94 7.32 6.86 0 4.1-2.58 7.4-6.16 7.4-1.2 0-2.34-.62-2.72-1.36l-.74 2.82c-.28 1.06-1.02 2.38-1.52 3.18C9.56 23.82 10.74 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
            </svg>
          </div>
          <span className="text-lg font-bold text-[#e60023] hidden sm:block">
            {APP_NAME}
          </span>
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
          >
            Início
          </Link>
          <Link
            href="/explore"
            className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
          >
            Explorar
          </Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar imagens..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-white transition"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {loading ? (
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
          ) : authUser ? (
            <>
              <Link
                href="/upload"
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 bg-[#e60023] text-white rounded-full text-sm font-semibold hover:bg-[#cc001f] transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Criar
              </Link>
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-bold hover:bg-gray-300 transition overflow-hidden"
                >
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    (profile?.username?.[0] || "U").toUpperCase()
                  )}
                </button>
                {menuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-semibold">
                          {profile?.full_name || profile?.username}
                        </p>
                        <p className="text-xs text-gray-500">
                          @{profile?.username}
                        </p>
                      </div>
                      <Link
                        href={`/${profile?.username}`}
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Meu perfil
                      </Link>
                      <Link
                        href="/likes"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Curtidas
                      </Link>
                      <Link
                        href="/boards/new"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Criar coleção
                      </Link>
                      <Link
                        href="/settings"
                        className="block px-4 py-2.5 text-sm hover:bg-gray-50"
                        onClick={() => setMenuOpen(false)}
                      >
                        Configurações
                      </Link>
                      <hr className="my-1 border-gray-100" />
                      <button
                        onClick={() => {
                          signOut();
                          setMenuOpen(false);
                          router.push("/");
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
                      >
                        Sair
                      </button>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 bg-[#e60023] text-white rounded-full text-sm font-semibold hover:bg-[#cc001f] transition"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="hidden sm:block px-4 py-2 bg-gray-100 text-gray-800 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
              >
                Cadastrar
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
