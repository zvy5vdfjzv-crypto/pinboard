"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  MAX_FILE_SIZE,
  ALLOWED_IMAGE_TYPES,
  DEFAULT_CATEGORIES,
  STORAGE_BUCKET,
} from "@/lib/constants";

export default function UploadPage() {
  const { authUser } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleFile = (f: File) => {
    if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
      setError("Formato não suportado. Use JPG, PNG, WebP ou GIF.");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setError("Imagem muito grande. Máximo 5MB.");
      return;
    }
    setError("");
    setFile(f);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !authUser) return;
    setUploading(true);
    setError("");

    try {
      // Upload image
      const ext = file.name.split(".").pop();
      const path = `${authUser.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(path, file, { cacheControl: "31536000" });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);

      // Get image dimensions
      const img = new Image();
      img.src = preview!;
      await new Promise((resolve) => (img.onload = resolve));

      // Create pin
      const { data: pin, error: pinError } = await supabase
        .from("pins")
        .insert({
          user_id: authUser.id,
          title: title.trim(),
          description: description.trim() || null,
          image_url: publicUrl,
          image_storage_path: path,
          width: img.naturalWidth,
          height: img.naturalHeight,
          is_public: true,
        })
        .select()
        .single();

      if (pinError) throw pinError;

      // Add category
      if (category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("slug", category)
          .single();
        if (cat) {
          await supabase
            .from("pin_categories")
            .insert({ pin_id: pin.id, category_id: cat.id });
        }
      }

      // Add tags
      if (tags.trim()) {
        const tagNames = tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
        for (const tagName of tagNames) {
          const slug = tagName.replace(/\s+/g, "-");
          let { data: existingTag } = await supabase
            .from("tags")
            .select("id")
            .eq("slug", slug)
            .single();

          if (!existingTag) {
            const { data: newTag } = await supabase
              .from("tags")
              .insert({ name: tagName, slug })
              .select()
              .single();
            existingTag = newTag;
          }

          if (existingTag) {
            await supabase
              .from("pin_tags")
              .insert({ pin_id: pin.id, tag_id: existingTag.id });
          }
        }
      }

      router.push(`/pin/${pin.id}`);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Erro ao fazer upload. Tente novamente."
      );
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Criar pin</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dropzone */}
        {!preview ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition ${
              dragActive
                ? "border-[#e60023] bg-red-50"
                : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <div className="text-5xl mb-4">📷</div>
            <p className="text-lg font-semibold text-gray-700">
              Arraste uma imagem ou clique para selecionar
            </p>
            <p className="text-sm text-gray-500 mt-2">
              JPG, PNG, WebP ou GIF (máx. 5MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
              className="hidden"
            />
          </div>
        ) : (
          <div className="relative">
            <img
              src={preview}
              alt="Preview"
              className="w-full max-h-[500px] object-contain rounded-2xl bg-gray-100"
            />
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition"
            >
              ✕
            </button>
          </div>
        )}

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Título *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={255}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            placeholder="Dê um título para sua imagem"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={1000}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition resize-none"
            placeholder="Conte mais sobre esta imagem..."
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Categoria
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
          >
            <option value="">Selecionar categoria</option>
            {DEFAULT_CATEGORIES.map((cat) => (
              <option key={cat.slug} value={cat.slug}>
                {cat.icon_emoji} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
            placeholder="paisagem, pôr do sol, natureza (separadas por vírgula)"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!file || !title.trim() || uploading}
          className="w-full py-3 bg-[#e60023] text-white rounded-full font-semibold hover:bg-[#cc001f] disabled:opacity-50 transition"
        >
          {uploading ? "Publicando..." : "Publicar pin"}
        </button>
      </form>
    </div>
  );
}
