-- ================================================================
-- Zenith Content Intelligence System
-- Migration: 002_idea_feedback
-- ================================================================
-- Descrição: Feedback de rejeição de ideias para melhorar o IdeatorAgent
-- Tabela: idea_feedback
--
-- Uso:
--   Quando um utilizador rejeita uma ideia, o motivo é guardado aqui.
--   O IdeatorAgent consulta esta tabela para evitar repetir os mesmos
--   padrões em gerações futuras.
-- ================================================================

-- ----------------------------------------------------------------
-- 2.4 idea_feedback
-- ----------------------------------------------------------------
CREATE TABLE idea_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Utilizador que rejeitou
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Dados da ideia rejeitada (desnormalizados para análise)
  idea_title TEXT NOT NULL,
  idea_description TEXT NOT NULL,
  format content_format NOT NULL,
  business_goal business_goal NOT NULL,
  market market NOT NULL,
  mood TEXT,
  target_audience TEXT,

  -- Motivo da rejeição (fornecido pelo utilizador)
  rejection_reason TEXT NOT NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE idea_feedback IS 'Feedback de rejeição de ideias para melhorar o IdeatorAgent';
COMMENT ON COLUMN idea_feedback.rejection_reason IS 'Explicação do utilizador sobre porque rejeitou a ideia';
COMMENT ON COLUMN idea_feedback.mood IS 'Mood do briefing original (desnormalizado para consulta)';
COMMENT ON COLUMN idea_feedback.target_audience IS 'Público-alvo do briefing original (desnormalizado para consulta)';

-- ----------------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------------
CREATE INDEX idx_feedback_user_id ON idea_feedback(user_id);
CREATE INDEX idx_feedback_market ON idea_feedback(market);
CREATE INDEX idx_feedback_created_at ON idea_feedback(created_at DESC);

-- ----------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------
ALTER TABLE idea_feedback ENABLE ROW LEVEL SECURITY;

-- SELECT: o próprio utilizador vê o seu feedback; admin vê tudo
CREATE POLICY "feedback_select_own"
  ON idea_feedback FOR SELECT
  USING (
    get_current_user_role() = 'admin'
    OR auth.uid() = user_id
  );

-- INSERT: o próprio utilizador insere o seu feedback
CREATE POLICY "feedback_insert_own"
  ON idea_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);
