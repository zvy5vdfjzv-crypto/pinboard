"use client";
import { useState } from "react";
import Link from "next/link";
import type { Pin } from "@/types/database";
import { createClient } from "@/lib/supabase/client";

interface PinCardProps {
  pin: Pin;
  currentUserId?: string;
  onAddToBoard?: (pinId: string) => void;
}

export default function PinCard({
  pin,
  currentUserId,
  onAddToBoard,
}: PinCardProps) {
  const [liked, setLiked] = useState(pin.is_liked || false);
  const [likeCount, setLikeCount] = useState(pin.like_count || 0);
  const [hovering, setHovering] = useState(false);
  const supabase = createClient();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!currentUserId) return;

    if (liked) {
      setLiked(false);
      setLikeCount((c) => c - 1);
      await supabase
        .from("likes")
        .delete()
        .eq("user_id", currentUserId)
        .eq("pin_id", pin.id);
    } else {
      setLiked(true);
      setLikeCount((c) => c + 1);
      await supabase
        .from("likes")
        .insert({ user_id: currentUserId, pin_id: pin.id });
    }
  };

  return (
    <div
      className="masonry-item group"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <Link href={`/pin/${pin.id}`} className="block relative">
        {/* Image */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-100">
          <img
            src={pin.image_url}
            alt={pin.title}
            className="w-full object-cover"
            loading="lazy"
          />
          {/* Overlay on hover */}
          <div
            className={`absolute inset-0 bg-black/40 flex flex-col justify-between p-3 transition-opacity duration-200 ${
              hovering ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Top actions */}
            <div className="flex justify-end gap-2">
              {onAddToBoard && (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onAddToBoard(pin.id);
                  }}
                  className="px-3 py-1.5 bg-white rounded-full text-sm font-semibold hover:bg-gray-100 transition"
                >
                  Salvar
                </button>
              )}
            </div>
            {/* Bottom actions */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1">
                <button
                  onClick={handleLike}
                  className={`p-2 rounded-full transition ${
                    liked
                      ? "bg-[#7C3AED] text-white"
                      : "bg-white/90 text-gray-700 hover:bg-white"
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    fill={liked ? "currentColor" : "none"}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </button>
                {likeCount > 0 && (
                  <span className="text-xs text-white font-medium">
                    {likeCount}
                  </span>
                )}
              </div>
              {pin.user && (
                <Link
                  href={`/${pin.user.username}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white/90 rounded-full hover:bg-white transition"
                >
                  <div className="w-5 h-5 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                    {pin.user.avatar_url ? (
                      <img
                        src={pin.user.avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      pin.user.username[0].toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-medium text-gray-700 max-w-[80px] truncate">
                    {pin.user.username}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </Link>
      {/* Title below image */}
      {pin.title && (
        <p className="mt-1.5 px-1 text-sm font-medium text-gray-800 line-clamp-2">
          {pin.title}
        </p>
      )}
    </div>
  );
}
