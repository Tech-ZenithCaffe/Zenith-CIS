-- ================================================================
-- Zenith Content Intelligence System
-- Migration: 001_initial_schema
-- ================================================================
-- Descrição: Schema inicial do MVP
-- Tabelas: profiles, content_packages, execution_logs
-- Enums: user_role, market, content_format, business_goal,
--        content_status, execution_event_type, execution_status
-- ================================================================
-- Uso:
--   1. Abrir o SQL Editor no Supabase Dashboard
--   2. Colar e executar TODO este script
--   3. Verificar que não há erros
-- ================================================================

-- ================================================================
-- 0. EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

-- ================================================================
-- 1. CUSTOM ENUMS
-- ================================================================

CREATE TYPE user_role AS ENUM (
  'admin',
  'creator_portugal',
  'creator_spain'
);

CREATE TYPE market AS ENUM (
  'portugal',
  'spain'
);

CREATE TYPE content_format AS ENUM (
  'stories',
  'reels',
  'carousel'
);

CREATE TYPE business_goal AS ENUM (
  'followers_growth',
  'engagement',
  'organic_reach'
);

CREATE TYPE content_status AS ENUM (
  'draft',
  'scheduled',
  'published'
);

CREATE TYPE execution_event_type AS ENUM (
  'manual',
  'cron'
);

CREATE TYPE execution_status AS ENUM (
  'pending',
  'running',
  'success',
  'failed'
);

-- ================================================================
-- 2. TABLES
-- ================================================================

-- ----------------------------------------------------------------
-- 2.1 profiles
-- ----------------------------------------------------------------
-- Propósito: Extensão do auth.users com dados de negócio
-- Relacionamento: 1:1 com auth.users (mesmo UUID)
-- RLS: Leitura por todos autenticados, escrita apenas pelo próprio
-- ----------------------------------------------------------------
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'creator_portugal',
  market market NOT NULL DEFAULT 'portugal',
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Garantir que cada auth.user tem apenas 1 profile
  CONSTRAINT profiles_email_unique UNIQUE (email)
);

COMMENT ON TABLE profiles IS 'Perfis de utilizador (extensão do auth.users)';

-- ----------------------------------------------------------------
-- 2.2 content_packages
-- ----------------------------------------------------------------
-- Propósito: Tabela unificada para ideias e pacotes completos
--
-- is_saved = false → ideia pendente na fila
-- is_saved = true  → pacote completo guardado
--
-- Campos JSONB (flexíveis para evolução do schema):
--   script_flow, captions, visual_prompts, growth_tips
--
-- Justificação (ver análise crítica secção 2.1):
--   Desnormalização intencional: mood, target_audience e referências
--   são campos diretos em vez de tabelas separadas (trend_vibes, etc.)
-- ----------------------------------------------------------------
CREATE TABLE content_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Fase de Ideia
  idea_title TEXT NOT NULL,
  idea_description TEXT NOT NULL,
  format content_format NOT NULL,
  business_goal business_goal NOT NULL,
  market market NOT NULL,

  -- Input do formulário (desnormalizado)
  mood TEXT,
  target_audience TEXT,

  -- Output do Packager (JSONB para flexibilidade)
  script_flow JSONB,
  captions JSONB,
  visual_prompts JSONB,
  growth_tips JSONB,

  -- Agendamento e estado
  scheduled_date TIMESTAMPTZ,
  status content_status NOT NULL DEFAULT 'draft',
  is_saved BOOLEAN NOT NULL DEFAULT false,

  -- Auditoria
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Um pacote rascunho pode não ter data, mas um agendado precisa
  CONSTRAINT scheduled_package_must_have_date
    CHECK (status != 'scheduled' OR scheduled_date IS NOT NULL)
);

COMMENT ON TABLE content_packages IS 'Tabela unificada: ideias pendentes (is_saved=false) + pacotes completos (is_saved=true)';
COMMENT ON COLUMN content_packages.is_saved IS 'false = ideia na fila de aprovação; true = pacote guardado';
COMMENT ON COLUMN content_packages.script_flow IS 'Array de steps do roteiro [{timestamp, visualDescription, audioOrOverlay}]';
COMMENT ON COLUMN content_packages.captions IS '{primaryLanguage, primaryText, englishTranslation?}';
COMMENT ON COLUMN content_packages.visual_prompts IS '{midjourneyPrompts[], runwayPrompts[]}';
COMMENT ON COLUMN content_packages.growth_tips IS '{callToActions[], engagementStickers?, suggestedHashtags[], suggestedGeoTags[]}';

-- ----------------------------------------------------------------
-- 2.3 execution_logs
-- ----------------------------------------------------------------
-- Propósito: Registo de execuções de agentes (rastreabilidade)
-- Uso: Depuração, métricas de performance, auditoria de erros
-- Estratégia: Append-only (nunca se altera um log)
-- ----------------------------------------------------------------
CREATE TABLE execution_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type execution_event_type NOT NULL,
  agent_name TEXT NOT NULL,
  input_data JSONB,
  output_data JSONB,
  status execution_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  duration_ms INTEGER,
  market market,
  triggered_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE execution_logs IS 'Registo de execuções de agentes (rastreabilidade, append-only)';
COMMENT ON COLUMN execution_logs.duration_ms IS 'Duração da execução em milissegundos';

-- ================================================================
-- 3. INDEXES
-- ================================================================

-- 3.1 profiles
CREATE INDEX idx_profiles_role ON profiles(role);

-- 3.2 content_packages
CREATE INDEX idx_packages_market ON content_packages(market);
CREATE INDEX idx_packages_status ON content_packages(status);
CREATE INDEX idx_packages_is_saved ON content_packages(is_saved);
CREATE INDEX idx_packages_scheduled_date ON content_packages(scheduled_date)
  WHERE scheduled_date IS NOT NULL;
CREATE INDEX idx_packages_created_by ON content_packages(created_by);
CREATE INDEX idx_packages_created_at ON content_packages(created_at DESC);
-- Índice composto para a query principal do calendário:
-- "mostrar pacotes rascunho/agendados num intervalo de datas"
CREATE INDEX idx_packages_calendar ON content_packages(status, scheduled_date)
  WHERE status IN ('draft', 'scheduled');

-- 3.3 execution_logs
CREATE INDEX idx_logs_event_type ON execution_logs(event_type);
CREATE INDEX idx_logs_status ON execution_logs(status);
CREATE INDEX idx_logs_agent ON execution_logs(agent_name);
CREATE INDEX idx_logs_created_at ON execution_logs(created_at DESC);

-- ================================================================
-- 4. TRIGGER: updated_at automático
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_content_packages_updated_at
  BEFORE UPDATE ON content_packages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- 5. ROW LEVEL SECURITY
-- ================================================================

-- ----------------------------------------------------------------
-- 5.1 Helper functions para RLS
-- ----------------------------------------------------------------
-- Nota: Usamos SECURITY DEFINER para ter acesso consistente à tabela profiles
-- search_path restrito a 'public' para prevenir ataques de search path

CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION get_current_user_market()
RETURNS market
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT market FROM profiles WHERE id = auth.uid();
$$;

-- ----------------------------------------------------------------
-- 5.2 profiles RLS
-- ----------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer utilizador autenticado pode ler perfis
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: o próprio utilizador cria o seu perfil
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- UPDATE: o próprio utilizador atualiza o seu perfil
-- A role só pode ser alterada por admin (verificado no WITH CHECK)
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      -- Se a role não mudou, qualquer um pode atualizar
      role = (SELECT role FROM profiles WHERE id = auth.uid())
      -- Se a role mudou, só admin pode
      OR get_current_user_role() = 'admin'
    )
  );

-- DELETE: apenas admin pode apagar perfis
CREATE POLICY "profiles_delete_admin"
  ON profiles FOR DELETE
  USING (get_current_user_role() = 'admin');

-- ----------------------------------------------------------------
-- 5.3 content_packages RLS
-- ----------------------------------------------------------------

ALTER TABLE content_packages ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer autenticado pode ler pacotes
-- (útil para o calendário editorial colaborativo entre mercados)
CREATE POLICY "packages_select_authenticated"
  ON content_packages FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: market deve corresponder à região do utilizador
-- Admin pode inserir em qualquer market
CREATE POLICY "packages_insert_by_market"
  ON content_packages FOR INSERT
  WITH CHECK (
    get_current_user_role() = 'admin'
    OR (
      get_current_user_role() IN ('creator_portugal', 'creator_spain')
      AND market = get_current_user_market()
    )
  );

-- UPDATE: mesma regra do INSERT
CREATE POLICY "packages_update_by_market"
  ON content_packages FOR UPDATE
  USING (
    get_current_user_role() = 'admin'
    OR (
      get_current_user_role() IN ('creator_portugal', 'creator_spain')
      AND market = get_current_user_market()
    )
  );

-- DELETE: apenas admin pode apagar pacotes
CREATE POLICY "packages_delete_admin"
  ON content_packages FOR DELETE
  USING (get_current_user_role() = 'admin');

-- ----------------------------------------------------------------
-- 5.4 execution_logs RLS
-- ----------------------------------------------------------------

ALTER TABLE execution_logs ENABLE ROW LEVEL SECURITY;

-- SELECT: qualquer autenticado pode ver logs (debugging/auditoria)
CREATE POLICY "logs_select_authenticated"
  ON execution_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- INSERT: apenas admin
-- Cron jobs usam service_role (bypass RLS) para inserir logs automaticamente
CREATE POLICY "logs_insert_admin"
  ON execution_logs FOR INSERT
  WITH CHECK (get_current_user_role() = 'admin');

-- Nota: execution_logs é append-only.
-- Não há políticas de UPDATE ou DELETE.
--
-- Atenção: Se uma Route Handler autenticada (não admin, não service_role)
-- precisar de inserir logs, será bloqueada por esta policy.
-- Para esses casos, usar o admin client (service_role) que bypassa RLS.

-- ================================================================
-- 6. AUTO-PROFILE ON SIGNUP
-- ================================================================
-- Cria automaticamente um profile quando um utilizador se regista
-- via Supabase Auth (email, magic link, OAuth).
-- Isto garante que profiles e auth.users estão sempre sincronizados.

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, role, market)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data ->> 'name',
      NEW.raw_user_meta_data ->> 'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'creator_portugal',
    'portugal'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- 7. VERIFICAÇÃO
-- ================================================================
-- Executar após a migração para confirmar que está tudo correto:
--
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT typname FROM pg_type WHERE typname IN ('user_role', 'market', 'content_format', 'business_goal', 'content_status', 'execution_event_type', 'execution_status');
-- SELECT tablename, indexname FROM pg_indexes WHERE schemaname = 'public';
-- SELECT event_object_table, trigger_name FROM information_schema.triggers;
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public';
