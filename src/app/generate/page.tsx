"use client";
import { useState } from "react";
import Header from "@/components/common/Header";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function GeneratePage() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  const generateImage = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    setImageUrl(null);
    setSaved(false);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro ao gerar imagem.");
        return;
      }

      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      } else {
        setError("Nenhuma imagem foi gerada. Tente um prompt diferente.");
      }
    } catch {
      setError("Erro de conexao. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const saveToProfile = async () => {
    if (!imageUrl) return;
    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { error: insertError } = await supabase.from("pins").insert({
        user_id: user.id,
        title: prompt.substring(0, 100),
        description: "Gerado com IA: " + prompt,
        image_url: imageUrl,
        width: 1024,
        height: 1024,
        is_public: true,
      });

      if (insertError) {
        setError("Erro ao salvar: " + insertError.message);
      } else {
        setSaved(true);
      }
    } catch {
      setError("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  };

  const suggestions = [
    "Um gato astronauta flutuando no espaco com nebulosas coloridas",
    "Paisagem de fantasia com castelo nas nuvens ao por do sol",
    "Retrato artistico com flores e borboletas em aquarela",
    "Cidade futurista cyberpunk com neon e chuva",
    "Floresta encantada com luzes magicas e cogumelos brilhantes",
    "Oceano cristalino com baleias e aurora boreal",
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-4xl mx-auto py-8 px-4">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold gradient-text mb-2">
            Criar com IA
          </h1>
          <p className="text-gray-500">
            Descreva a imagem que voce imagina e a IA cria para voce
          </p>
        </div>

        {/* Input area */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-6 mb-8">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Descreva a imagem que voce quer criar..."
            rows={3}
            className="w-full px-4 py-3 rounded-2xl border border-purple-100 bg-purple-50/50 focus:bg-white focus:border-purple-300 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-sm resize-none"
          />
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-gray-400">
              {prompt.length}/500 caracteres
            </span>
            <button
              onClick={generateImage}
              disabled={loading || !prompt.trim()}
              className="px-8 py-3 rounded-xl btn-gradient font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  Gerar Imagem
                </>
              )}
            </button>
          </div>
        </div>

        {/* Suggestions */}
        {!imageUrl && !loading && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-3">
              Sugestoes para voce:
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => setPrompt(s)}
                  className="text-left px-4 py-3 rounded-xl bg-white/60 border border-purple-100 text-sm text-gray-600 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-600 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Loading animation */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative w-20 h-20 mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-ping opacity-20" />
              <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-pulse" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 animate-pulse" />
            </div>
            <p className="text-gray-500 text-sm animate-pulse">
              Criando sua imagem com IA...
            </p>
          </div>
        )}

        {/* Generated image */}
        {imageUrl && (
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-purple-100 p-6">
            <img
              src={imageUrl}
              alt={prompt}
              className="w-full max-w-lg mx-auto rounded-2xl shadow-lg"
            />
            <div className="flex items-center justify-center gap-3 mt-6">
              <button
                onClick={saveToProfile}
                disabled={saving || saved}
                className="px-6 py-3 rounded-xl btn-gradient font-semibold text-sm disabled:opacity-50 flex items-center gap-2"
              >
                {saved ? "Salvo no seu perfil!" : saving ? "Salvando..." : "Salvar no meu perfil"}
              </button>
              <button
                onClick={() => {
                  setImageUrl(null);
                  setSaved(false);
                }}
                className="px-6 py-3 rounded-xl bg-purple-50 text-purple-600 font-semibold text-sm hover:bg-purple-100 transition-all"
              >
                Gerar outra
              </button>
              <a
                href={imageUrl}
                download="photogram-ai.png"
                target="_blank"
                className="px-6 py-3 rounded-xl bg-purple-50 text-purple-600 font-semibold text-sm hover:bg-purple-100 transition-all"
              >
                Baixar
              </a>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
