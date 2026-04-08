export const APP_NAME = "PinBoard";
export const APP_DESCRIPTION = "Descubra e compartilhe imagens incríveis";
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const PINS_PER_PAGE = 30;
export const STORAGE_BUCKET = "pins";

export const DEFAULT_CATEGORIES = [
  { name: "Arte", slug: "arte", icon_emoji: "🎨" },
  { name: "Fotografia", slug: "fotografia", icon_emoji: "📷" },
  { name: "Design", slug: "design", icon_emoji: "✏️" },
  { name: "Natureza", slug: "natureza", icon_emoji: "🌿" },
  { name: "Arquitetura", slug: "arquitetura", icon_emoji: "🏛️" },
  { name: "Moda", slug: "moda", icon_emoji: "👗" },
  { name: "Tecnologia", slug: "tecnologia", icon_emoji: "💻" },
  { name: "Comida", slug: "comida", icon_emoji: "🍕" },
  { name: "Viagem", slug: "viagem", icon_emoji: "✈️" },
  { name: "Animais", slug: "animais", icon_emoji: "🐾" },
  { name: "Esportes", slug: "esportes", icon_emoji: "⚽" },
  { name: "Música", slug: "musica", icon_emoji: "🎵" },
  { name: "Ilustração", slug: "ilustracao", icon_emoji: "🖌️" },
  { name: "Wallpapers", slug: "wallpapers", icon_emoji: "🖼️" },
  { name: "Minimalismo", slug: "minimalismo", icon_emoji: "⬜" },
  { name: "Outros", slug: "outros", icon_emoji: "📌" },
];
