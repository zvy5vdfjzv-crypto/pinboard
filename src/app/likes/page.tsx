"use client";
import { useAuth } from "@/hooks/useAuth";
import PinGrid from "@/components/pins/PinGrid";
import Link from "next/link";

export default function LikesPage() {
  const { authUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-3 border-gray-200 border-t-[#e60023] rounded-full animate-spin" />
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold mb-2">Faça login para ver suas curtidas</h2>
        <Link href="/login" className="text-[#e60023] font-semibold hover:underline">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-[1800px] mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Minhas curtidas</h1>
      <PinGrid likedByUserId={authUser.id} currentUserId={authUser.id} />
    </div>
  );
}
