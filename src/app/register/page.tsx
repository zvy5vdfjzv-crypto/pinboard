"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
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

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres.");
      setLoading(false);
      return;
    }

    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username.toLowerCase(),
            full_name: fullName || null,
          },
        },
      });

      if (authError) {
        if (authError.message.includes("rate limit")) {
          setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.");
        } else if (authError.message.includes("already registered")) {
          setError("Este email ja esta cadastrado. Tente fazer login.");
        } else {
          setError(authError.message);
        }
        return;
      }

      router.push("/");
      router.refresh();
    } catch (_e) {
      setError("Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-200">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <polyline points="21 15 16 10 5 21"/>
              </svg>
            </div>
          </Link>
          <h1 className="text-2xl font-bold mt-4 gradient-text">
            Crie sua conta
          </h1>
          <p className="text-gray-500 mt-1">
            Junte-se ao Photogram e comece a criar
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-8 space-y-5"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
              className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Nome de usuario
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) =>
                setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
              }
              placeholder="nome_de_usuario"
              required
              className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caracteres"
              required
              className="w-full px-4 py-3 rounded-xl border border-purple-100 bg-purple-50/50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl btn-gradient font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Criando conta..." : "Cadastrar"}
          </button>

          <p className="text-center text-sm text-gray-500">
            Ja tem uma conta?{" "}
            <Link
              href="/login"
              className="text-purple-600 font-medium hover:text-purple-700"
            >
              Entrar
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
