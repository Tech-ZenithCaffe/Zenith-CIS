# Setup & Configuration Guide

Este guia descreve as etapas necessárias para configurar o ambiente de desenvolvimento local e implantar (deploy) o **Zenith Content Intelligence System** em produção.

---

## 1. Pré-requisitos locais

Certifique-se de que tem instalado na sua máquina:
*   [Node.js](https://nodejs.org/) (Versão 18.x ou superior)
*   [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/)
*   Uma conta no [Supabase](https://supabase.com/) (Gratuita)
*   Uma chave de API no [Google AI Studio](https://aistudio.google.com/) para o Gemini API.

---

## 2. Configuração do Projeto Local

### Passo 1: Criar estrutura de pastas

```powershell
# PowerShell (Windows):
New-Item -ItemType Directory -Force -Path @(
  'src\app\api\cron\trend-analysis',
  'src\app\api\ideas\approve',
  'src\components\ui',
  'src\components\layout',
  'src\components\providers',
  'src\lib\supabase',
  'src\lib\gemini',
  'src\services',
  'src\types',
  'src\agents\ideator',
  'src\agents\packager',
  'src\features\ideas',
  'src\features\calendar',
  'src\features\settings'
)
```

```bash
# Linux/macOS:
mkdir -p src/app/api/cron/trend-analysis \
  src/app/api/ideas/approve \
  src/components/ui \
  src/components/layout \
  src/components/providers \
  src/lib/supabase \
  src/lib/gemini \
  src/services \
  src/types \
  src/agents/ideator \
  src/agents/packager \
  src/features/ideas \
  src/features/calendar \
  src/features/settings
```

### Passo 2: Criar ficheiros de configuração

Crie cada ficheiro listado na [Estrutura do Projeto](../README.md#-estrutura-do-projeto) com o conteúdo indicado no README.

### Passo 3: Instalar dependências
```bash
npm install
# ou
pnpm install
```

### Passo 4: Configurar variáveis de ambiente
Crie um ficheiro `.env.local` na raiz do projeto a partir do template `.env.example`:

```ini
# Supabase (Credenciais do Cliente e do Servidor)
NEXT_PUBLIC_SUPABASE_URL=https://sua-url-supabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-publica
SUPABASE_SERVICE_ROLE_KEY=sua-chave-secreta-de-servico

# Google Gemini API
GEMINI_API_KEY=sua-chave-de-api-gemini

# Vercel Cron Security
VERCEL_CRON_SECRET=chave-secreta-para-validar-cron
```

---

## 3. Configuração do Supabase (Database)

O schema completo está no ficheiro `supabase/migrations/001_initial_schema.sql`. Este migration é **autocontido** — inclui tabelas, enums, índices, triggers e RLS.

**Para aplicar:**
1. Abre o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vai a **SQL Editor**
3. Abre `supabase/migrations/001_initial_schema.sql` e cola o conteúdo
4. Executa o script
5. Verifica se correu sem erros

```bash
# Alternativa: se tiveres a CLI do Supabase instalada:
supabase db push
```

---

## 4. Configuração da Autenticação Supabase

### Passo 1: Ativar Autenticação no Supabase Dashboard

1. Abre o [Supabase Dashboard](https://supabase.com/dashboard) → **Authentication** → **Providers**
2. Ativa **Email/Password** (único provider necessário para o MVP)
3. Opcional: desativa "Confirm email" para desenvolvimento mais rápido

### Passo 2: Configurar Redirect URLs

Em **Authentication** → **URL Configuration**:
- **Site URL**: `http://localhost:3000` (desenvolvimento)
- **Redirect URLs**:
  - `http://localhost:3000/auth/callback`
  - `https://teu-dominio.vercel.app/auth/callback` (produção)

### Passo 3: Ficheiros de Autenticação

O código completo está documentado no `README.md` secção **🔐 Autenticação Supabase — Código Completo**.

#### ✅ Já existem em disco:
- `src/types/auth.ts`
- `src/lib/env.ts`
- `src/lib/supabase/client.ts`

#### ⏳ Criar manualmente (por ordem de dependências):

**Fase 1 — Tipos e Config**
1. `src/types/database.ts` — Interfaces das tabelas Supabase
2. `src/lib/auth-errors.ts` — Mapeamento de erros
3. `src/lib/supabase/server.ts` — Server client (cookies)
4. `src/lib/supabase/admin.ts` — Admin client (service_role)
5. `src/lib/supabase/middleware.ts` — Cliente Edge Middleware
6. `src/lib/utils.ts` — Utilitários (cn, formatDate)

**Fase 2 — Componentes e Layout**
7. `src/components/providers/providers.tsx` — Providers com auth state
8. `src/app/layout.tsx` — Root layout
9. `src/app/globals.css` — Estilos globais
10. `src/app/page.tsx` — Home page (redirect)
11. `src/components/layout/header.tsx` — Header com sessão
12. `src/app/(dashboard)/layout.tsx` — Dashboard protegido

**Fase 3 — Autenticação**
13. `src/app/auth/login/page.tsx` — Página de login
14. `src/components/auth/login-form.tsx` — Formulário
15. `src/components/auth/auth-button.tsx` — Botão login/logout
16. `src/app/auth/callback/route.ts` — Callback OAuth
17. `src/app/auth/confirm/route.ts` — Confirmação de email
18. `src/app/auth/logout/route.ts` — Logout endpoint
19. `src/app/api/auth/user/route.ts` — API de sessão

**Fase 4 — Proteção**
20. `src/middleware.ts` — Proteção de rotas

---

## 5. Configuração do Vercel e Tarefas Agendadas (Cron)

### Passo 1: Configurar o Cron Job no Repositório
O agendamento do ciclo autónomo é configurado através do ficheiro `vercel.json` na raiz do projeto:

```json
{
  "crons": [
    {
      "path": "/api/cron/trend-analysis",
      "schedule": "0 8 * * 1" 
    }
  ]
}
```
*Nota: A expressão cron `0 8 * * 1` executa o endpoint autónomo todas as segundas-feiras às 08:00 UTC.*

### Passo 2: Deploy no Vercel
1.  Importe o projeto no painel da Vercel.
2.  Configure as variáveis de ambiente em *Settings -> Environment Variables*.
3.  Execute o primeiro deploy. A Vercel detetará automaticamente o ficheiro `vercel.json` e ativará o cron job associado.

---

## 6. Verificação

```bash
npm run typecheck   # Verificar tipos TypeScript
npm run lint        # Verificar lint
npm run build       # Verificar build completo
```