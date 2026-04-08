export const APP_NAME = "PinBoard";
export const APP_DESCRIPTION = "Descubra e compartilhe imagens incrÃ­veis";
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const PINS_PER_PAGE = 30;
export const STORAGE_BUCKET = "pins";

export const DEFAULT_CATEGORIES = [
  { name: "Arte", slug: "arte", icon_emoji: "ð¨" },
  { name: "Fotografia", slug: "fotografia", icon_emoji: "ð·" },
  { name: "Design", slug: "design", icon_emoji: "âï¸" },
  { name: "Natureza", slug: "natureza", icon_emoji: "ð¿" },
  { name: "Arquitetura", slug: "arquitetura", icon_emoji: "ðï¸" },
  { name: "Moda", slug: "moda", icon_emoji: "ð" },
  { name: "Tecnologia", slug: "tecnologia", icon_emoji: "ð»" },
  { name: "Comida", slug: "comida", icon_emoji: "ð" },
  { name: "Viagem", slug: "viagem", icon_emoji: "âï¸" },
  { name: "Animais", slug: "animais", icon_emoji: "ð¾" },
  { name: "Esportes", slug: "esportes", icon_emoji: "â½" },
  { name: "MÃºsica", slug: "musica", icon_emoji: "ðµ" },
  { name: "IlustraÃ§Ã£o", slug: "ilustracao", icon_emoji: "ðï¸" },
  { name: "Wallpapers", slug: "wallpapers", icon_emoji: "ð¼ï¸" },
  { name: "Minimalismo", slug: "minimalismo", icon_emoji: "â¬" },
  { name: "Outros", slug: "outros", icon_emoji: "ð" },
];

// Alias for backward compatibility
export const CATEGORIES = DEFAULT_CATEGORIES;
