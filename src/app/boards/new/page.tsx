"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function NewBoardPage() {
  const { authUser } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setLoading(true);
    setError("");

    const { data, error: err } = await supabase
      .from("boards")
      .insert({
        user_id: authUser.id,
        name: name.trim(),
        description: description.trim() || null,
        is_public: isPublic,
      })
      .select()
      .single();

    if (err) {
      setError("Erro ao criar coleção. Tente novamente.");
      setLoading(false);
      return;
    }

    router.push(`/boards/${data.id}`);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Criar coleção</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={100}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            placeholder="Ex: Inspirações de design"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-none"
            placeholder="Sobre o que é esta coleção?"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="public"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="public" className="text-sm text-gray-700">
            Coleção pública (visível para todos)
          </label>
        </div>
        <button
          type="submit"
          disabled={!name.trim() || loading}
          className="w-full py-3 bg-[#e60023] text-white rounded-full font-semibold hover:bg-[#cc001f] disabled:opacity-50 transition"
        >
          {loading ? "Criando..." : "Criar coleção"}
        </button>
      </form>
    </div>
  );
}
