"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import PinCard from "./PinCard";
import type { Pin } from "@/types/database";
import { PINS_PER_PAGE } from "@/lib/constants";

interface PinGridProps {
  initialPins?: Pin[];
  categorySlug?: string;
  searchQuery?: string;
  userId?: string;
  boardId?: string;
  likedByUserId?: string;
  currentUserId?: string;
}

export default function PinGrid({
  initialPins,
  categorySlug,
  searchQuery,
  userId,
  boardId,
  likedByUserId,
  currentUserId,
}: PinGridProps) {
  const [pins, setPins] = useState<Pin[]>(initialPins || []);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [didInitialLoad, setDidInitialLoad] = useState(!!initialPins);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const fetchPins = useCallback(
    async (pageNum: number) => {
      const from = pageNum * PINS_PER_PAGE;
      const to = from + PINS_PER_PAGE - 1;

      let query = supabase
        .from("pins")
        .select(
          `
          *,
          user:users!pins_user_id_fkey(id, username, full_name, avatar_url),
          like_count:likes(count),
          categories:pin_categories(category:categories(*)),
          tags:pin_tags(tag:tags(*))
        `
        )
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .range(from, to);

      if (categorySlug) {
        query = supabase
          .from("pins")
          .select(
            `
            *,
            user:users!pins_user_id_fkey(id, username, full_name, avatar_url),
            like_count:likes(count),
            pin_categories!inner(category:categories!inner(*))
          `
          )
          .eq("is_public", true)
          .eq("pin_categories.category.slug", categorySlug)
          .order("created_at", { ascending: false })
          .range(from, to);
      }

      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`
        );
      }

      if (userId) {
        query = query.eq("user_id", userId);
      }

      if (boardId) {
        const { data: boardPinIds } = await supabase
          .from("board_pins")
          .select("pin_id")
          .eq("board_id", boardId);
        if (boardPinIds) {
          query = query.in(
            "id",
            boardPinIds.map((bp) => bp.pin_id)
          );
        }
      }

      if (likedByUserId) {
        const { data: likedPinIds } = await supabase
          .from("likes")
          .select("pin_id")
          .eq("user_id", likedByUserId);
        if (likedPinIds) {
          query = query.in(
            "id",
            likedPinIds.map((lp) => lp.pin_id)
          );
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching pins:", error);
        return [];
      }

      const transformed: Pin[] =
        (data?.map((pin: Record<string, unknown>) => ({
          ...pin,
          user: Array.isArray(pin.user) ? pin.user[0] : pin.user,
          like_count: Array.isArray(pin.like_count)
            ? (pin.like_count as { count: number }[])[0]?.count || 0
            : 0,
        })) as Pin[]) || [];

      if (currentUserId && transformed.length > 0) {
        const { data: likes } = await supabase
          .from("likes")
          .select("pin_id")
          .eq("user_id", currentUserId)
          .in(
            "pin_id",
            transformed.map((p) => p.id)
          );

        const likedIds = new Set(likes?.map((l) => l.pin_id));
        transformed.forEach((pin) => {
          pin.is_liked = likedIds.has(pin.id);
        });
      }

      return transformed;
    },
    [supabase, categorySlug, searchQuery, userId, boardId, likedByUserId, currentUserId]
  );

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const newPins = await fetchPins(page);
    if (newPins.length < PINS_PER_PAGE) setHasMore(false);
    setPins((prev) => [...prev, ...newPins]);
    setPage((p) => p + 1);
    setLoading(false);
  }, [loading, hasMore, page, fetchPins]);

  useEffect(() => {
    if (!initialPins && !didInitialLoad) {
      setDidInitialLoad(true);
      (async () => {
        setLoading(true);
        try {
          const newPins = await fetchPins(0);
          if (newPins.length < PINS_PER_PAGE) setHasMore(false);
          setPins(newPins);
          setPage(1);
        } catch (err) {
          console.error("Error on initial load:", err);
        }
        setLoading(false);
      })();
    }
  }, []);

  useEffect(() => {
    if (didInitialLoad) {
      setPins([]);
      setPage(0);
      setHasMore(true);
      (async () => {
        setLoading(true);
        try {
          const newPins = await fetchPins(0);
          if (newPins.length < PINS_PER_PAGE) setHasMore(false);
          setPins(newPins);
          setPage(1);
        } catch (err) {
          console.error("Error reloading:", err);
        }
        setLoading(false);
      })();
    }
  }, [categorySlug, searchQuery]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    if (loadMoreRef.current) observerRef.current.observe(loadMoreRef.current);
    return () => observerRef.current?.disconnect();
  }, [loadMore, hasMore, loading]);

  if (!loading && pins.length === 0 && didInitialLoad) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">📌</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          Nenhuma imagem encontrada
        </h2>
        <p className="text-gray-500">
          {searchQuery
            ? `Sem resultados para "${searchQuery}"`
            : "Seja o primeiro a compartilhar uma imagem!"}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="masonry-grid">
        {pins.map((pin) => (
          <PinCard
            key={pin.id}
            pin={pin}
            currentUserId={currentUserId}
            onAddToBoard={currentUserId ? () => {} : undefined}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className="py-8 flex justify-center">
        {loading && (
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-[#7C3AED] rounded-full animate-bounce" />
            <div
              className="w-3 h-3 bg-[#7C3AED] rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="w-3 h-3 bg-[#7C3AED] rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
          </div>
        )}
      </div>
    </>
  );
}
