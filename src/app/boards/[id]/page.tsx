"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PinGrid from "@/components/pins/PinGrid";
import type { Board } from "@/types/database";

export default function BoardDetailPage() {
  const { id } = useParams();
  const { authUser } = useAuth();
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchBoard = async () => {
      const { data } = await supabase
        .from("boards")
        .select("*, user:users!boards_user_id_fkey(username, full_name, avatar_url)")
        .eq("id", id)
        .single();

      if (!data) {
        router.push("/");
        return;
      }

      setBoard({
        ...data,
        user: Array.isArray(data.user) ? data.user[0] : data.user,
      } as Board);
      setLoading(false);
    };

    fetchBoard();
  }, [id, supabase, router]);

  const handleDelete = async () => {
    if (!board || !authUser || board.user_id !== authUser.id) return;
    if (!confirm("Tem certeza que deseja excluir esta coleção?")) return;
    await supabase.from("boards").delete().eq("id", board.id);
    router.push(`/${board.user?.username}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#e60023] rounded-full animate-spin" />
      </div>
    );
  }

  if (!board) return null;

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">{board.name}</h1>
        {board.description && (
          <p className="text-gray-600 mt-2">{board.description}</p>
        )}
        {board.user && (
          <p className="text-sm text-gray-500 mt-2">
            por {board.user.full_name || board.user.username}
          </p>
        )}
        {authUser?.id === board.user_id && (
          <button
            onClick={handleDelete}
            className="mt-4 px-4 py-2 text-sm text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition"
          >
            Excluir coleção
          </button>
        )}
      </div>

      <PinGrid boardId={board.id} currentUserId={authUser?.id} />
    </div>
  );
}
