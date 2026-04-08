"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { APP_NAME } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(
        authError.message === "Invalid login credentials"
          ? "Email ou senha incorretos"
          : authError.message
      );
      setLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-12 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-[#e60023] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.08 3.15 9.42 7.6 11.2-.1-.94-.2-2.4.04-3.44.22-.94 1.4-5.94 1.4-5.94s-.36-.72-.36-1.78c0-1.66.96-2.9 2.16-2.9 1.02 0 1.52.76 1.52 1.68 0 1.02-.66 2.56-1 3.98-.28 1.2.6 2.18 1.78 2.18 2.14 0 3.78-2.26 3.78-5.5 0-2.88-2.06-4.88-5.02-4.88-3.42 0-5.42 2.56-5.42 5.22 0 1.04.4 2.14.9 2.74.1.12.1.22.08.32-.1.38-.3 1.2-.34 1.36-.06.22-.18.26-.4.16-1.48-.7-2.4-2.86-2.4-4.6 0-3.76 2.72-7.2 7.86-7.2 4.12 0 7.32 2.94 7.32 6.86 0 4.1-2.58 7.4-6.16 7.4-1.2 0-2.34-.62-2.72-1.36l-.74 2.82c-.28 1.06-1.02 2.38-1.52 3.18C9.56 23.82 10.74 24 12 24c6.63 0 12-5.37 12-12S18.63 0 12 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold">Entrar no {APP_NAME}</h1>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
              placeholder="Sua senha"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#e60023] text-white rounded-full font-semibold hover:bg-[#cc001f] disabled:opacity-50 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Não tem conta?{" "}
          <Link href="/register" className="text-[#e60023] font-semibold hover:underline">
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
}
