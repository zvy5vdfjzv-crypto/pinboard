"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES } from "@/lib/constants";

export default function Header() {
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [username, setUsername] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        const { data: profile } = await supabase
          .from("users")
          .select("username")
          .eq("id", user.id)
          .single();
        if (profile) setUsername(profile.username);
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUsername("");
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-purple-100/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <span className="text-xl font-bold gradient-text hidden sm:block">
            Photogram
          </span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar imagens..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-purple-50/80 border border-purple-100 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </div>
        </form>

        {/* Nav */}
        <nav className="flex items-center gap-2">
          <Link
            href="/"
            className="hidden md:flex px-3 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all"
          >
            Inicio
          </Link>
          <Link
            href="/explore"
            className="hidden md:flex px-3 py-2 rounded-full text-sm font-medium text-gray-600 hover:text-purple-600 hover:bg-purple-50 transition-all"
          >
            Explorar
          </Link>
          {user && (
            <Link
              href="/generate"
              className="hidden md:flex px-3 py-2 rounded-full text-sm font-medium text-white btn-gradient"
            >
              Criar com IA
            </Link>
          )}

          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shadow-md hover:shadow-lg transition-all"
              >
                {username?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-purple-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-purple-50">
                    <p className="font-medium text-sm text-gray-800">
                      {username || "Usuario"}
                    </p>
                    <p className="text-xs text-gray-400">{user.email}</p>
                  </div>
                  <Link
                    href={`/${username}`}
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Meu Perfil
                  </Link>
                  <Link
                    href="/upload"
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Upload
                  </Link>
                  <Link
                    href="/generate"
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Criar com IA
                  </Link>
                  <Link
                    href="/likes"
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Curtidas
                  </Link>
                  <Link
                    href="/settings"
                    className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-purple-50 hover:text-purple-600 transition-colors"
                  >
                    Configuracoes
                  </Link>
                  <hr className="my-1 border-purple-50" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    Sair
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 rounded-full text-sm font-medium text-purple-600 hover:bg-purple-50 transition-all"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-full text-sm font-medium text-white btn-gradient"
              >
                Cadastrar
              </Link>
            </div>
          )}
        </nav>
      </div>

      {/* Categories bar */}
      <div className="border-t border-purple-50/50 overflow-x-auto scrollbar-hide">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 py-2">
          <Link
            href="/explore"
            className="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm"
          >
            Tudo
          </Link>
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              href={`/explore?category=${cat.slug}`}
              className="shrink-0 px-4 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:text-purple-600 hover:bg-purple-50 transition-all whitespace-nowrap"
            >
              {cat.icon_emoji} {cat.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}
