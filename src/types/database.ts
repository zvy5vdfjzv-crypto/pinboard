export type User = {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Pin = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string;
  image_storage_path: string;
  width: number | null;
  height: number | null;
  created_at: string;
  is_public: boolean;
  // Joined fields
  user?: User;
  like_count?: number;
  is_liked?: boolean;
  categories?: Category[];
  tags?: Tag[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon_emoji: string | null;
};

export type Tag = {
  id: string;
  name: string;
  slug: string;
};

export type Board = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  is_public: boolean;
  cover_image_url: string | null;
  created_at: string;
  updated_at: string;
  pin_count?: number;
  user?: User;
  preview_pins?: Pin[];
};

export type Like = {
  id: string;
  user_id: string;
  pin_id: string;
  created_at: string;
};
