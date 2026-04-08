"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PinGrid from "@/components/pins/PinGrid";
import type { User, Board } from "@/types/database";

export default function ProfilePage() {
  const { username } = useParams();
  const { authUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [tab, setTab] = useState<"pins" | "boards">("pins");
  const [pinCount, setPinCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: userData } = await supabase
        .from("users")
        .select("*")
        .eq("username", username)
        .single();

      if (!userData) {
        setLoading(false);
        return;
      }

      setUser(userData);

      const { count } = await supabase
        .from("pins")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userData.id)
        .eq("is_public", true);

      setPinCount(count || 0);

      const { data: boardsData } = await supabase
        .from("boards")
        .select("*, pin_count:board_pins(count)")
        .eq("user_id", userData.id)
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      setBoards(
        boardsData?.map((b) => ({
          ...b,
          pin_count: Array.isArray(b.pin_count)
            ? (b.pin_count as { count: number }[])[0]?.count || 0
            : 0,
        })) || []
      );

      setLoading(false);
    };

    fetchProfile();
  }, [username, supabase]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#e60023] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold">Usuário não encontrado</h2>
      </div>
    );
  }

  const isOwnProfile = authUser?.id === user.id;

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-8">
      {/* Profile header */}
      <div className="text-center mb-8">
        <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-3xl font-bold mx-auto mb-4 overflow-hidden">
          {user.avatar_url ? (
            <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            user.username[0].toUpperCase()
          )}
        </div>
        <h1 className="text-2xl font-bold">
          {user.full_name || user.username}
        </h1>
        <p className="text-gray-500">@{user.username}</p>
        {user.bio && <p className="text-gray-600 mt-2 max-w-md mx-auto">{user.bio}</p>}
        <p className="text-sm text-gray-500 mt-2">{pinCount} pins</p>
        {isOwnProfile && (
          <Link
            href="/settings"
            className="inline-block mt-4 px-6 py-2 bg-gray-100 rounded-full text-sm font-semibold hover:bg-gray-200 transition"
          >
            Editar perfil
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex justify-center gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setTab("pins")}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            tab === "pins"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Pins
        </button>
        <button
          onClick={() => setTab("boards")}
          className={`pb-3 px-4 text-sm font-semibold transition border-b-2 ${
            tab === "boards"
              ? "border-black text-black"
              : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Coleções
        </button>
      </div>

      {/* Content */}
      {tab === "pins" ? (
        <PinGrid userId={user.id} currentUserId={authUser?.id} />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {isOwnProfile && (
            <Link
              href="/boards/new"
              className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-gray-400 hover:text-gray-700 transition"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-semibold">Nova coleção</span>
            </Link>
          )}
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="group aspect-square rounded-2xl bg-gray-100 overflow-hidden relative"
            >
              {board.cover_image_url ? (
                <img src={board.cover_image_url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">📁</div>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white font-semibold">{board.name}</p>
                <p className="text-white/70 text-sm">{board.pin_count} pins</p>
              </div>
            </Link>
          ))}
          {boards.length === 0 && !isOwnProfile && (
            <p className="col-span-full text-center text-gray-500 py-8">
              Nenhuma coleção pública
            </p>
          )}
        </div>
      )}
    </div>
  );
}
