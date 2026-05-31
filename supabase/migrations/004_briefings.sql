-- ================================================================
-- Zenith Content Intelligence System
-- Migration: 004_briefings
-- ================================================================
-- Descrição: Tabela para armazenar informações do negócio do
-- utilizador (briefings, textos, ficheiros, links) que servem
-- de contexto para o IdeatorAgent gerar ideias mais relevantes.
-- ================================================================

-- ================================================================
-- 1. TABELA briefings
-- ================================================================
CREATE TABLE IF NOT EXISTS briefings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  type TEXT NOT NULL DEFAULT 'text' CHECK (type IN ('text', 'file', 'link')),
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- 2. INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_briefings_user_id ON briefings(user_id);
CREATE INDEX IF NOT EXISTS idx_briefings_created_at ON briefings(created_at DESC);

-- ================================================================
-- 3. ROW LEVEL SECURITY
-- ================================================================
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;

-- Apenas o próprio utilizador pode ver os seus briefings
CREATE POLICY "Users can view own briefings"
  ON briefings FOR SELECT
  USING (auth.uid() = user_id);

-- Apenas o próprio utilizador pode criar briefings
CREATE POLICY "Users can insert own briefings"
  ON briefings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Apenas o próprio utilizador pode editar
CREATE POLICY "Users can update own briefings"
  ON briefings FOR UPDATE
  USING (auth.uid() = user_id);

-- Apenas o próprio utilizador pode apagar
CREATE POLICY "Users can delete own briefings"
  ON briefings FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- 4. TRIGGER: updated_at automático
-- ================================================================
CREATE OR REPLACE FUNCTION update_briefings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_briefings_updated_at
  BEFORE UPDATE ON briefings
  FOR EACH ROW
  EXECUTE FUNCTION update_briefings_updated_at();
