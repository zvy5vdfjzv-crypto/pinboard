"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { authUser, profile } = useAuth();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setUsername(profile.username);
      setBio(profile.bio || "");
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    setSaving(true);
    setMessage({ type: "", text: "" });

    // Check username if changed
    if (username !== profile?.username) {
      const { data: existing } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.toLowerCase())
        .neq("id", authUser.id)
        .single();

      if (existing) {
        setMessage({ type: "error", text: "Nome de usuário já em uso" });
        setSaving(false);
        return;
      }
    }

    const { error } = await supabase
      .from("users")
      .update({
        full_name: fullName.trim() || null,
        username: username.toLowerCase(),
        bio: bio.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", authUser.id);

    if (error) {
      setMessage({ type: "error", text: "Erro ao salvar. Tente novamente." });
    } else {
      setMessage({ type: "success", text: "Perfil atualizado!" });
    }
    setSaving(false);
  };

  if (!authUser) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-xl text-sm ${
            message.type === "error"
              ? "bg-red-50 border border-red-200 text-red-600"
              : "bg-green-50 border border-green-200 text-green-600"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome completo
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome de usuário
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) =>
              setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ""))
            }
            required
            minLength={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            maxLength={300}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-none"
            placeholder="Conte um pouco sobre você..."
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-[#e60023] text-white rounded-full font-semibold hover:bg-[#cc001f] disabled:opacity-50 transition"
        >
          {saving ? "Salvando..." : "Salvar alterações"}
        </button>
      </form>
    </div>
  );
}
