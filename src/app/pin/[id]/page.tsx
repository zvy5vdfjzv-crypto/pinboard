"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import PinGrid from "@/components/pins/PinGrid";
import type { Pin } from "@/types/database";

export default function PinDetailPage() {
  const { id } = useParams();
  const { authUser } = useAuth();
  const [pin, setPin] = useState<Pin | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchPin = async () => {
      const { data } = await supabase
        .from("pins")
        .select(
          `
          *,
          user:users!pins_user_id_fkey(id, username, full_name, avatar_url, bio),
          like_count:likes(count),
          categories:pin_categories(category:categories(*)),
          tags:pin_tags(tag:tags(*))
        `
        )
        .eq("id", id)
        .single();

      if (!data) {
        router.push("/");
        return;
      }

      const transformed = {
        ...data,
        user: Array.isArray(data.user) ? data.user[0] : data.user,
        like_count: Array.isArray(data.like_count)
          ? (data.like_count as { count: number }[])[0]?.count || 0
          : 0,
      };

      setPin(transformed as Pin);
      setLikeCount(transformed.like_count);

      if (authUser) {
        const { data: likeData } = await supabase
          .from("likes")
          .select("id")
          .eq("user_id", authUser.id)
          .eq("pin_id", id as string)
          .single();
        setLiked(!!likeData);
      }
      setLoading(false);
    };

    fetchPin();
  }, [id, authUser, supabase, router]);

  const handleLike = async () => {
    if (!authUser) {
      router.push("/login");
      return;
    }
    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", authUser.id)
        .eq("pin_id", id as string);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase
        .from("likes")
        .insert({ user_id: authUser.id, pin_id: id as string });
    }
  };

  const handleDelete = async () => {
    if (!pin || !authUser || pin.user_id !== authUser.id) return;
    if (!confirm("Tem certeza que deseja excluir este pin?")) return;

    await supabase.storage.from("pins").remove([pin.image_storage_path]);
    await supabase.from("pins").delete().eq("id", pin.id);
    router.push("/");
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#e60023] rounded-full animate-spin" />
      </div>
    );
  }

  if (!pin) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Voltar
      </button>

      <div className="bg-white rounded-3xl shadow-lg overflow-hidden md:flex">
        {/* Image */}
        <div className="md:w-1/2 bg-gray-100 flex items-center justify-center">
          <img
            src={pin.image_url}
            alt={pin.title}
            className="w-full max-h-[700px] object-contain"
          />
        </div>

        {/* Details */}
        <div className="md:w-1/2 p-8">
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold transition ${
                  liked
                    ? "bg-[#e60023] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <svg className="w-5 h-5" fill={liked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {likeCount}
              </button>
            </div>
            {authUser?.id === pin.user_id && (
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm text-red-600 bg-red-50 rounded-full hover:bg-red-100 transition"
              >
                Excluir
              </button>
            )}
          </div>

          {/* Title & Description */}
          <h1 className="text-2xl font-bold mb-3">{pin.title}</h1>
          {pin.description && (
            <p className="text-gray-600 mb-6 whitespace-pre-wrap">
              {pin.description}
            </p>
          )}

          {/* Author */}
          {pin.user && (
            <Link
              href={`/${pin.user.username}`}
              className="flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-50 transition -mx-3"
            >
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-lg font-bold overflow-hidden">
                {pin.user.avatar_url ? (
                  <img src={pin.user.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  pin.user.username[0].toUpperCase()
                )}
              </div>
              <div>
                <p className="font-semibold">
                  {pin.user.full_name || pin.user.username}
                </p>
                <p className="text-sm text-gray-500">@{pin.user.username}</p>
              </div>
            </Link>
          )}

          {/* Tags */}
          {pin.tags && pin.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {pin.tags.map((tagObj: Record<string, unknown>) => {
                const tag = (tagObj as { tag: { name: string; slug: string } }).tag;
                return (
                  <Link
                    key={tag.slug}
                    href={`/search?q=${encodeURIComponent(tag.name)}`}
                    className="px-3 py-1.5 bg-gray-100 text-sm text-gray-700 rounded-full hover:bg-gray-200 transition"
                  >
                    #{tag.name}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Date */}
          <p className="text-sm text-gray-400 mt-6">
            {new Date(pin.created_at).toLocaleDateString("pt-BR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Related pins */}
      <div className="mt-12">
        <h2 className="text-xl font-bold mb-6">Mais imagens</h2>
        <PinGrid currentUserId={authUser?.id} />
      </div>
    </div>
  );
}
