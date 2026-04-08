-- =============================================
-- PinBoard - Script de configuração do Supabase
-- Execute este SQL no SQL Editor do Supabase
-- =============================================

-- 1. TABELA DE USUÁRIOS
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  bio TEXT,
  avatar_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA DE PINS (imagens)
CREATE TABLE IF NOT EXISTS pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(500) NOT NULL,
  image_storage_path VARCHAR(500) NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_public BOOLEAN DEFAULT TRUE
);

-- 3. TABELA DE CATEGORIAS
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  icon_emoji VARCHAR(10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RELAÇÃO PIN ↔ CATEGORIAS
CREATE TABLE IF NOT EXISTS pin_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pin_id, category_id)
);

-- 5. TABELA DE TAGS
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RELAÇÃO PIN ↔ TAGS
CREATE TABLE IF NOT EXISTS pin_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(pin_id, tag_id)
);

-- 7. TABELA DE LIKES
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, pin_id)
);

-- 8. TABELA DE COLEÇÕES (boards)
CREATE TABLE IF NOT EXISTS boards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  cover_image_url VARCHAR(500),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. RELAÇÃO BOARD ↔ PINS
CREATE TABLE IF NOT EXISTS board_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  pin_id UUID NOT NULL REFERENCES pins(id) ON DELETE CASCADE,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(board_id, pin_id)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX IF NOT EXISTS idx_pins_user_id ON pins(user_id);
CREATE INDEX IF NOT EXISTS idx_pins_is_public ON pins(is_public);
CREATE INDEX IF NOT EXISTS idx_pins_created_at ON pins(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_pin_id ON likes(pin_id);
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_pin_categories_pin_id ON pin_categories(pin_id);
CREATE INDEX IF NOT EXISTS idx_pin_tags_pin_id ON pin_tags(pin_id);
CREATE INDEX IF NOT EXISTS idx_board_pins_board_id ON board_pins(board_id);

-- =============================================
-- CATEGORIAS PADRÃO
-- =============================================
INSERT INTO categories (name, slug, icon_emoji) VALUES
  ('Arte', 'arte', '🎨'),
  ('Fotografia', 'fotografia', '📷'),
  ('Design', 'design', '✏️'),
  ('Natureza', 'natureza', '🌿'),
  ('Arquitetura', 'arquitetura', '🏛️'),
  ('Moda', 'moda', '👗'),
  ('Tecnologia', 'tecnologia', '💻'),
  ('Comida', 'comida', '🍕'),
  ('Viagem', 'viagem', '✈️'),
  ('Animais', 'animais', '🐾'),
  ('Esportes', 'esportes', '⚽'),
  ('Música', 'musica', '🎵'),
  ('Ilustração', 'ilustracao', '🖌️'),
  ('Wallpapers', 'wallpapers', '🖼️'),
  ('Minimalismo', 'minimalismo', '⬜'),
  ('Outros', 'outros', '📌')
ON CONFLICT (slug) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS) - SEGURANÇA
-- =============================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE pin_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_pins ENABLE ROW LEVEL SECURITY;

-- USERS: qualquer um pode ver, só o próprio pode editar
CREATE POLICY "Users are viewable by everyone" ON users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- PINS: públicos visíveis por todos, próprios editáveis
CREATE POLICY "Public pins are viewable by everyone" ON pins FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create pins" ON pins FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own pins" ON pins FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own pins" ON pins FOR DELETE USING (auth.uid() = user_id);

-- CATEGORIES: visíveis por todos
CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);

-- PIN_CATEGORIES: visíveis por todos, autores podem gerenciar
CREATE POLICY "Pin categories viewable by everyone" ON pin_categories FOR SELECT USING (true);
CREATE POLICY "Pin authors can manage categories" ON pin_categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = pin_id AND pins.user_id = auth.uid())
);
CREATE POLICY "Pin authors can delete categories" ON pin_categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = pin_id AND pins.user_id = auth.uid())
);

-- TAGS: visíveis e criáveis por todos autenticados
CREATE POLICY "Tags viewable by everyone" ON tags FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create tags" ON tags FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- PIN_TAGS: visíveis por todos, autores podem gerenciar
CREATE POLICY "Pin tags viewable by everyone" ON pin_tags FOR SELECT USING (true);
CREATE POLICY "Pin authors can manage tags" ON pin_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = pin_id AND pins.user_id = auth.uid())
);
CREATE POLICY "Pin authors can delete tags" ON pin_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM pins WHERE pins.id = pin_id AND pins.user_id = auth.uid())
);

-- LIKES: visíveis por todos, próprios gerenciáveis
CREATE POLICY "Likes viewable by everyone" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike" ON likes FOR DELETE USING (auth.uid() = user_id);

-- BOARDS: públicos visíveis, próprios gerenciáveis
CREATE POLICY "Public boards viewable by everyone" ON boards FOR SELECT USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Authenticated users can create boards" ON boards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own boards" ON boards FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own boards" ON boards FOR DELETE USING (auth.uid() = user_id);

-- BOARD_PINS: visíveis se board é público, gerenciáveis pelo dono
CREATE POLICY "Board pins viewable if board public" ON board_pins FOR SELECT USING (
  EXISTS (SELECT 1 FROM boards WHERE boards.id = board_id AND (boards.is_public = true OR boards.user_id = auth.uid()))
);
CREATE POLICY "Board owners can add pins" ON board_pins FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM boards WHERE boards.id = board_id AND boards.user_id = auth.uid())
);
CREATE POLICY "Board owners can remove pins" ON board_pins FOR DELETE USING (
  EXISTS (SELECT 1 FROM boards WHERE boards.id = board_id AND boards.user_id = auth.uid())
);

-- =============================================
-- STORAGE BUCKET
-- =============================================
-- Crie um bucket chamado 'pins' no Storage do Supabase
-- Configurações: público, max 5MB, tipos: image/jpeg, image/png, image/webp, image/gif
--
-- Ou execute via SQL:
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('pins', 'pins', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "Anyone can view pin images" ON storage.objects FOR SELECT USING (bucket_id = 'pins');
CREATE POLICY "Authenticated users can upload pin images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pins' AND auth.uid() IS NOT NULL);
CREATE POLICY "Users can delete own pin images" ON storage.objects FOR DELETE USING (bucket_id = 'pins' AND auth.uid()::text = (storage.foldername(name))[1]);
