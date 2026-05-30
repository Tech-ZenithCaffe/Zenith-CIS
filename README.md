# Zenith Content Intelligence System (CIS)

<p align="center">
  <strong>Copiloto de Marketing Autónomo & Orientador de Storytelling</strong><br />
  <em>Para o Zenith Caffè — Mercados de Portugal e Espanha</em>
</p>

---

## 🚀 Stack Tecnológica

| Camada | Tecnologia | Propósito |
|--------|-----------|-----------|
| **Frontend & API** | Next.js 15 (App Router) | Server Components, Route Handlers, Streaming SSR |
| **Linguagem** | TypeScript 5.7 (Strict) | Type safety em toda a codebase |
| **Estilização** | Tailwind CSS 3.4 | Utility-first, responsivo |
| **Database & Auth** | Supabase | PostgreSQL, Autenticação, RLS |
| **Orquestração IA** | Gemini 2.0 Flash (via @google/genai) | Geração de conteúdo criativo |
| **Hospedagem** | Vercel | Deploy, Cron Jobs, Edge Functions |
| **Validação** | Zod 3.24 | Runtime type validation (env, API) |

---

## 📁 Estrutura do Projeto

```
zenith-cis/
├── .env.example              # Template de variáveis de ambiente
├── eslint.config.mjs         # Configuração ESLint (flat config)
├── .gitignore
├── .prettierrc               # Configuração Prettier
├── next.config.ts            # Next.js configuration
├── package.json              # Dependências e scripts
├── postcss.config.js         # PostCSS + Tailwind
├── tsconfig.json             # TypeScript strict + path aliases
├── tailwind.config.ts        # Tailwind custom theme
├── vercel.json               # Vercel deployment + Cron Jobs
├── docs/                     # Documentação do projeto
│   ├── api_spec.md
│   ├── brand_voice_and_prompts.md
│   ├── setup_guide.md
│   └── supabase_rls_policies.md
└── src/                      # Código fonte
    ├── app/                  # Next.js App Router
    │   ├── (dashboard)/      # Layout autenticado (Route Group)
    │   │   └── layout.tsx
    │   ├── api/
    │   │   ├── cron/
    │   │   │   └── trend-analysis/
    │   │   │       └── route.ts   # GET - Ciclo autónomo semanal
    │   │   └── ideas/
    │   │       ├── route.ts       # GET - Listar ideias da fila
    │   │       └── approve/
    │   │           └── route.ts   # POST - Aprovar ideia + streaming
    │   ├── globals.css       # Estilos globais + Tailwind
    │   ├── layout.tsx        # Root layout com providers
    │   └── page.tsx          # Home page (placeholder)
    ├── components/
    │   ├── layout/
    │   │   └── header.tsx    # Header da aplicação
    │   ├── providers/
    │   │   └── providers.tsx # Providers combinados
    │   └── ui/               # Componentes base reutilizáveis
    │       └── index.ts      # (placeholder para shadcn/ui futuros)
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts     # Supabase browser client
    │   │   ├── server.ts     # Supabase server client (cookies)
    │   │   └── admin.ts      # Supabase admin client (service_role)
    │   ├── gemini/
    │   │   └── client.ts     # Gemini API client wrapper
    │   ├── env.ts            # Validação Zod das env vars
    │   └── utils.ts          # Funções utilitárias
    ├── services/
    │   ├── base-service.ts   # Serviço base abstrato
    │   ├── ideas-service.ts  # Gestão de ideias de conteúdo
    │   ├── packages-service.ts # Gestão de pacotes de conteúdo
    │   └── gemini-service.ts # Orquestração de chamadas Gemini
    ├── features/
    │   ├── ideas/
    │   │   └── index.ts      # Placeholder (futuro)
    │   ├── calendar/
    │   │   └── index.ts      # Placeholder (futuro)
    │   └── settings/
    │       └── index.ts      # Placeholder (futuro)
    ├── types/
    │   ├── index.ts          # Re-exports
    │   ├── database.ts       # Tipos das tabelas Supabase
    │   ├── market.ts         # Tipos de mercado (portugal | spain)
    │   ├── content.ts        # Tipos de conteúdo (ideias, pacotes)
    │   └── agent.ts          # Tipos do sistema de agentes
    └── agents/
        ├── base-agent.ts     # Agente base abstrato
        ├── ideator/
        │   ├── types.ts      # Tipos específicos do Ideator
        │   └── ideator-agent.ts  # Agente A: Gera 3 ideias
        └── packager/
            ├── types.ts      # Tipos específicos do Packager
            └── packager-agent.ts # Agente B: Gera pacote completo
```

---

## 🧠 Decisões Arquiteturais

### 1. Estrutura de Pastas

```
src/                    # Código fonte (clean separation)
  app/                  # Next.js App Router (ficheiros de rota)
  components/           # Componentes React reutilizáveis
  lib/                  # Clientes e configurações (Supabase, Gemini, env)
  services/             # Lógica de negócio (orquestração)
  types/                # Tipos TypeScript partilhados
  agents/               # Agentes de IA (estratégia extensível)
  features/             # Módulos de funcionalidade (futuro)
```

**Decisão**: `src/` como raiz do código fonte separa claramente configuração de projeto (raiz) de código de aplicação. `features/` prepara o terreno para uma arquitetura modular *feature-first* quando o produto crescer.

---

### 2. TypeScript Strict

- `strict: true` ativa todas as verificações rigorosas de tipo
- `noUncheckedIndexedAccess: true` força handling de `undefined` em acessos de array/objeto
- Path aliases (`@/`) eliminam imports relativos profundos
- `moduleResolution: "bundler"` alinhado com Next.js e Turbopack

---

### 3. ESLint + Prettier

- ESLint 9 com `eslint-config-next` para regras React/Next.js
- Prettier com `prettier-plugin-tailwindcss` para ordenação automática de classes
- Scripts `lint`, `lint:fix`, `format`, `format:check` e `typecheck`

---

### 4. Variáveis de Ambiente (Validação com Zod)

Todas as variáveis de ambiente são validadas **em runtime** através de um schema Zod em `src/lib/env.ts`. O servidor não inicia se faltar alguma variável crítica.

**Estratégia**:
- `NEXT_PUBLIC_*` → validadas e expostas ao browser
- `SUPABASE_SERVICE_ROLE_KEY` → apenas disponível no servidor
- `VERCEL_CRON_SECRET` → validada apenas nos endpoints de cron

---

### 5. Cliente Supabase (Três Camadas)

| Cliente | Arquivo | Uso | Chave |
|---------|---------|-----|------|
| **Browser** | `lib/supabase/client.ts` | Componentes React (client-side) | `anon key` pública |
| **Server** | `lib/supabase/server.ts` | Server Components, Route Handlers | `anon key` + cookies |
| **Admin** | `lib/supabase/admin.ts` | Cron Jobs, operações internas | `service_role key` (bypass RLS) |

**Decisão**: Separar o cliente `admin` (service_role) do `server` (user context) previne que operações internas herdem RLS indevido. O cliente `admin` é usado exclusivamente em endpoints de cron e migrações.

---

### 6. Camada de Serviços

Padrão **Service Layer** com classe base abstrata:

- `BaseService` fornece `supabaseAdmin` e logging padronizado
- Cada serviço encapsula operações CRUD e lógica de negócio
- `GeminiService` abstrai chamadas à API Gemini com retry e timeout

```typescript
// Exemplo de uso:
const ideasService = new IdeasService();
const ideas = await ideasService.getPendingIdeas({ market: "portugal" });
```

---

### 7. Camada de Tipos

Tipos organizados por domínio:

| Ficheiro | Conteúdo |
|----------|----------|
| `database.ts` | Interfaces das tabelas Supabase (`profiles`, `content_packages`) |
| `market.ts` | Tipos `Market` ("portugal" | "spain") e utilitários |
| `content.ts` | `ContentIdea`, `ContentPackage`, `IdeaFormat`, `ContentStatus` |
| `agent.ts` | `AgentInput`, `AgentOutput`, `AgentStep`, `AgentStreamEvent` |

---

### 8. Arquitetura de Agentes (Extensível)

```typescript
abstract class BaseAgent<TInput, TOutput> {
  abstract name: string;
  abstract execute(input: TInput): Promise<TOutput>;
  
  // Métodos comuns:
  protected async callGemini(prompt: string): Promise<string>;
  protected validateOutput<T>(data: unknown, schema: ZodSchema<T>): T;
}
```

**Pattern**: Template Method + Strategy. Cada agente estende `BaseAgent` e implementa `execute()`. Novos agentes adicionam-se sem modificar os existentes — basta criar uma nova pasta em `src/agents/`.

**Exemplo de adição futura**:
```
src/agents/
  ├── base-agent.ts
  ├── ideator/          # Agente A (MVP)
  ├── packager/         # Agente B (MVP)
  ├── reviewer/         # Agente C (futuro: revisão de conteúdo)
  └── scheduler/        # Agente D (futuro: agendamento inteligente)
```

---

### 9. Layout Base

- **Root Layout** (`src/app/layout.tsx`): Providers globais (Supabase), fontes, metadata
- **Dashboard Layout** (`src/app/(dashboard)/layout.tsx`): Header + sidebar (requer autenticação)
- Route Group `(dashboard)` isola layouts autenticados de páginas públicas

---

### 10. Escalabilidade para Agentes Futuros

- **Interface `Agent`** define o contrato que todos os agentes devem seguir
- **Factory pattern** (futuro): `AgentFactory.create("ideator")` retorna o agente correto
- **Pipeline pattern** (futuro): `AgentPipeline.run([ideator, packager, reviewer])` encadeia agentes sequencialmente
- A pasta `agents/` é self-contained: cada agente tem seus próprios tipos, lógica e testes

---

## 📄 Conteúdo dos Ficheiros

Abaixo está o conteúdo completo de cada ficheiro do projeto. Copie cada bloco para o ficheiro correspondente.

---

### `package.json` (atualizado — adicionado `@eslint/eslintrc`)

```json
{
  "name": "zenith-cis",
  "version": "0.1.0",
  "private": true,
  "description": "Zenith Content Intelligence System",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json,css,md}\"",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "@google/genai": "^1.0.0",
    "@supabase/ssr": "^0.5.0",
    "@supabase/supabase-js": "^2.45.0",
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.0.0",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.0",
    "postcss": "^8.4.0",
    "prettier": "^3.4.0",
    "prettier-plugin-tailwindcss": "^0.6.0",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.7.0"
  }
}
```

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"],
      "@/services/*": ["./src/services/*"],
      "@/agents/*": ["./src/agents/*"],
      "@/features/*": ["./src/features/*"],
      "@/app/*": ["./src/app/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "exactOptionalPropertyTypes": false
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

---

### `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  reactStrictMode: true,
};

export default nextConfig;
```

---

### `postcss.config.js`

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

---

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{ts,tsx}",
    "./src/app/**/*.{ts,tsx}",
    "./src/features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8f0",
          100: "#f9edd9",
          200: "#f2d8b0",
          300: "#e9be7e",
          400: "#dfa04e",
          500: "#d4862a",
          600: "#c57122",
          700: "#a4581f",
          800: "#844620",
          900: "#6c3b1d",
          950: "#3a1d0d",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
```

---

### `eslint.config.mjs` (ESLint 9 Flat Config)

```javascript
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals"),
  {
    rules: {
      "@next/next/no-img-element": "warn",
      "no-console": ["warn", { allow: ["warn", "error"] }],
      "prefer-const": "error",
      "no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
];

export default eslintConfig;
```

**Nota**: Usa o formato flat config do ESLint 9 (recomendado para Next.js 15). Requer `@eslint/eslintrc` como compat layer para `eslint-config-next`.

---

### `.prettierrc`

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

---

### `vercel.json`

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

---

### `.gitignore`

```
# Next.js
.next/
out/

# Dependencies
node_modules/
.pnp
.pnp.js

# Environment
.env
.env.*.local
.env.local
.env.production.local
.env.development.local

# IDE
.vscode/*
!.vscode/extensions.json
!.vscode/settings.json
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Supabase
supabase/.temp
```

---

### `.env.example`

```ini
# ===========================================
# Supabase
# ===========================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# ===========================================
# Google Gemini AI
# ===========================================
GEMINI_API_KEY=your-gemini-api-key

# ===========================================
# Vercel (Cron Security)
# ===========================================
VERCEL_CRON_SECRET=your-cron-secret
```

---

## 📁 Ficheiros `src/`

---

### `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Zenith CIS | Content Intelligence System",
    template: "%s | Zenith CIS",
  },
  description:
    "Copiloto de marketing autónomo para o Zenith Caffè — Geração de conteúdo com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // TODO: tornar lang dinâmico baseado no mercado ("pt" | "es")
  return (
    <html lang="pt" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-neutral-50 font-sans text-neutral-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-neutral-200;
  }

  body {
    @apply bg-neutral-50 text-neutral-900;
  }
}
```

---

### `src/app/page.tsx`

```tsx
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="font-display text-5xl font-bold tracking-tight text-brand-800">
        Zenith CIS
      </h1>
      <p className="text-center text-lg text-neutral-600">
        Content Intelligence System
      </p>
      <p className="text-neutral-500">
        Em desenvolvimento. Volta em breve.
      </p>
      <Link
        href="/dashboard"
        className="rounded-lg bg-brand-600 px-6 py-3 text-white transition-colors hover:bg-brand-700"
      >
        Dashboard (em breve)
      </Link>
    </main>
  );
}
```

---

### `src/app/(dashboard)/layout.tsx`

```tsx
import { Header } from "@/components/layout/header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
```

---

### `src/components/providers/providers.tsx`

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import { createContext, useContext, type ReactNode } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a Providers");
  }
  return context.supabase;
}

export function Providers({ children }: { children: ReactNode }) {
  const supabase = createClient();

  return (
    <SupabaseContext.Provider value={{ supabase }}>
      {children}
    </SupabaseContext.Provider>
  );
}
```

---

### `src/components/layout/header.tsx`

```tsx
import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="font-display text-xl font-bold text-brand-700"
        >
          Zenith CIS
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/ideas" className="transition-colors hover:text-brand-600">
            Ideias
          </Link>
          <Link
            href="/calendar"
            className="transition-colors hover:text-brand-600"
          >
            Calendário
          </Link>
        </nav>
      </div>
    </header>
  );
}
```

---

### `src/components/ui/index.ts`

```typescript
// Placeholder para componentes UI reutilizáveis (shadcn/ui)
// Exemplos futuros: Button, Card, Input, Select, Dialog...
export {};
```

---

### `src/features/ideas/index.ts`

```typescript
// Placeholder para o módulo de Ideias (futuro)
export {};
```

---

### `src/features/calendar/index.ts`

```typescript
// Placeholder para o módulo de Calendário Editorial (futuro)
export {};
```

---

### `src/features/settings/index.ts`

```typescript
// Placeholder para o módulo de Configurações (futuro)
export {};
```

---

## 📁 `src/lib/`

---

### `src/lib/env.ts`

```typescript
import { z } from "zod";

/**
 * Schema de validação das variáveis de ambiente.
 * As validações ocorrem em runtime para garantir que
 * todas as variáveis críticas estão definidas antes do servidor iniciar.
 */

const envSchema = z.object({
  // Supabase (públicas)
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Supabase (servidor)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),

  // Gemini
  GEMINI_API_KEY: z.string().min(1),

  // Vercel Cron (opcional em dev)
  VERCEL_CRON_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      "❌ Variáveis de ambiente inválidas:",
      parsed.error.flatten().fieldErrors,
    );
    throw new Error("Variáveis de ambiente inválidas. Verifique o .env.local");
  }

  return parsed.data;
}

/**
 * Environment variables validated at startup.
 * Acesse via `env.NEXT_PUBLIC_SUPABASE_URL` etc.
 */
export const env = validateEnv();
```

---

### `src/lib/utils.ts`

```typescript
/**
 * Combina classes condicionais.
 * Implementação leve sem dependências externas.
 *
 * Uso: cn("base-class", isActive && "active-class")
 */
export function cn(...classes: Array<string | boolean | undefined | null>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Formata uma data ISO para o formato local pt-PT.
 */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("pt-PT", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

/**
 * Gera um ID único simples (para fallback caso o Supabase não gere).
 */
export function generateId(): string {
  return crypto.randomUUID();
}
```

---

### `src/lib/supabase/client.ts`

```typescript
"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para uso em componentes client-side.
 * Usa a `anon key` pública — segura para o browser.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
```

---

### `src/lib/supabase/server.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para uso em Server Components e Route Handlers.
 * Lê/define cookies da sessão do utilizador autenticado.
 * Respeita RLS — opera no contexto do utilizador.
 */
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    },
  );
}
```

---

### `src/lib/supabase/admin.ts`

```typescript
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase com a `service_role` key.
 * BYPASSA RLS — usar exclusivamente em:
 * - Cron Jobs automáticos
 * - Migrações de base de dados
 * - Operações internas do sistema
 *
 * ⚠️ NUNCA expor este cliente ao browser.
 */
export function createAdminClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
```

---

### `src/lib/gemini/client.ts`

> ⚠️ **SDK Gemini**: O código usa `@google/genai` (SDK mais recente). Se o `npm install` falhar, usa `@google/generative-ai` e ajusta os imports:
> ```typescript
> import { GoogleGenerativeAI } from "@google/generative-ai";
> const client = new GoogleGenerativeAI({ apiKey });
> const model = client.getGenerativeModel({ model: GEMINI_MODEL });
> const response = await model.generateContent({ contents: userPrompt });
> response.response.text()  // método diferente!
> ```

```typescript
import { GoogleGenAI } from "@google/genai";

/**
 * Cliente Gemini API.
 * Usa exclusivamente Gemini 2.0 Flash no MVP
 * (conforme análise crítica: modelo único simplifica roteamento).
 */
let clientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!clientInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY não definida. Verifique o .env.local",
      );
    }
    clientInstance = new GoogleGenAI({ apiKey });
  }
  return clientInstance;
}

/**
 * Modelo padrão para todas as operações.
 * Centralizado para facilitar futuras mudanças de modelo.
 */
export const GEMINI_MODEL = "gemini-2.0-flash";

/**
 * Gera conteúdo com a Gemini API.
 *
 * @param systemPrompt - Instruções de sistema do agente
 * @param userPrompt - Prompt do utilizador
 * @returns Texto gerado
 */
export async function generateGeminiContent(
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
    },
  });

  const text = response.text();
  if (!text) {
    throw new Error("Gemini retornou resposta vazia");
  }
  return text;
}

/**
 * Gera conteúdo com streaming da Gemini API.
 * Usado nos endpoints de aprovação para feedback em tempo real.
 */
export async function* streamGeminiContent(
  systemPrompt: string,
  userPrompt: string,
): AsyncGenerator<string> {
  const client = getGeminiClient();
  const stream = await client.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      temperature: 0.7,
    },
  });

  for await (const chunk of stream) {
    const text = chunk.text();
    if (text) {
      yield text;
    }
  }
}
```

---

## 📁 `src/types/`

---

### `src/types/database.ts`

```typescript
/**
 * Tipos das tabelas do Supabase.
 * Idealmente substituídos por tipos gerados automaticamente via:
 * `supabase gen types typescript --linked > src/types/database.ts`
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at">;
        Update: Partial<Omit<Profile, "id" | "created_at">>;
      };
      content_packages: {
        Row: ContentPackage;
        Insert: Omit<ContentPackage, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<ContentPackage, "id" | "created_at">>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      market: "portugal" | "spain";
      user_role: "admin" | "creator_portugal" | "creator_spain";
      content_format: "stories" | "reels" | "carousel";
      content_status: "draft" | "scheduled" | "published";
      business_goal: "followers_growth" | "engagement" | "organic_reach";
    };
  };
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: Database["public"]["Enums"]["user_role"];
  market: Database["public"]["Enums"]["market"];
  avatar_url: string | null;
  created_at: string;
}

export interface ContentPackage {
  id: string;
  idea_title: string;
  idea_description: string;
  format: Database["public"]["Enums"]["content_format"];
  business_goal: Database["public"]["Enums"]["business_goal"];
  market: Database["public"]["Enums"]["market"];
  mood: string | null;
  target_audience: string | null;
  script_flow: Json | null;
  captions: Json | null;
  visual_prompts: Json | null;
  growth_tips: Json | null;
  scheduled_date: string | null;
  status: Database["public"]["Enums"]["content_status"];
  is_saved: boolean;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}
```

---

### `src/types/market.ts`

```typescript
/**
 * Mercados suportados pelo Zenith Caffè.
 */
export type Market = "portugal" | "spain";

/**
 * Papéis de utilizador no sistema.
 */
export type UserRole = "admin" | "creator_portugal" | "creator_spain";

/**
 * Mapa de role → market para validação de autorização.
 */
export const ROLE_MARKET_MAP: Record<UserRole, Market | null> = {
  admin: null, // admin vê todos os mercados
  creator_portugal: "portugal",
  creator_spain: "spain",
};

/**
 * Obtém o mercado associado a uma role.
 */
export function getMarketFromRole(role: UserRole): Market | null {
  return ROLE_MARKET_MAP[role] ?? null;
}

/**
 * Verifica se um criador tem acesso a um determinado mercado.
 */
export function canAccessMarket(
  role: UserRole,
  targetMarket: Market,
): boolean {
  const userMarket = getMarketFromRole(role);
  return userMarket === null || userMarket === targetMarket;
}
```

---

### `src/types/content.ts`

```typescript
import type { Database } from "./database";

export type ContentFormat = Database["public"]["Enums"]["content_format"];
export type ContentStatus = Database["public"]["Enums"]["content_status"];
export type BusinessGoal = Database["public"]["Enums"]["business_goal"];

/**
 * Ideia de conteúdo (fase de ideação).
 */
export interface ContentIdea {
  title: string;
  conceptDescription: string;
  format: ContentFormat;
  businessGoal: BusinessGoal;
}

/**
 * Input do formulário de criação.
 * Substitui o Agente 1 (Trend Analyst) conforme análise crítica.
 */
export interface ContentInput {
  mood: string;
  targetAudience: string;
  market: "portugal" | "spain";
  format?: ContentFormat;
  businessGoal?: BusinessGoal;
  competitorReference?: string;
  additionalNotes?: string;
}

/**
 * Output completo do Agente B (Packager).
 */
export interface ContentPackageOutput {
  scriptFlow: Array<{
    timestamp: string;
    visualDescription: string;
    audioOrOverlay: string;
  }>;
  captions: {
    primaryLanguage: string;
    primaryText: string;
    englishTranslation?: string;
  };
  visualPrompts: {
    midjourneyPrompts: string[];
    runwayPrompts: string[];
  };
  growthTips: {
    callToActions: string[];
    engagementStickers?: {
      pollQuestion?: string;
      questionBox?: string;
    };
    suggestedHashtags: string[];
    suggestedGeoTags: string[];
  };
}

/**
 * Eventos de streaming enviados ao cliente.
 */
export type StreamEvent =
  | { step: "copywriting"; status: "started" }
  | { step: "copywriting"; data: Pick<ContentPackageOutput, "scriptFlow" | "captions"> }
  | { step: "prompting"; status: "started" }
  | { step: "prompting"; data: Pick<ContentPackageOutput, "visualPrompts"> }
  | { step: "growth"; status: "started" }
  | { step: "growth"; data: Pick<ContentPackageOutput, "growthTips"> }
  | { step: "complete"; packageId: string };
```

---

### `src/types/agent.ts`

```typescript
/**
 * Interface base que todos os agentes devem implementar.
 * Garante extensibilidade: novos agentes seguem o mesmo contrato.
 */
export interface Agent<TInput = unknown, TOutput = unknown> {
  /** Nome único do agente (ex: "ideator", "packager") */
  readonly name: string;

  /**
   * Executa o agente com o input fornecido.
   * @param input - Dados de entrada específicos do agente
   * @returns Output validado do agente
   */
  execute(input: TInput): Promise<TOutput>;
}

/**
 * Metadados de execução de um agente.
 */
export interface AgentExecution {
  agentName: string;
  startedAt: Date;
  completedAt?: Date;
  durationMs?: number;
  success: boolean;
  error?: string;
}

/**
 * Pipeline de agentes executados sequencialmente.
 * Útil para encadear agentes (Ideator → Packager).
 */
export interface AgentPipeline {
  agents: Array<{
    agent: Agent;
    input: unknown;
  }>;
  onStepComplete?: (execution: AgentExecution) => void;
}
```

---

### `src/types/index.ts`

```typescript
export * from "./database";
export * from "./market";
export * from "./content";
export * from "./agent";
```

---

## 📁 `src/services/`

---

### `src/services/base-service.ts`

```typescript
import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Classe base para todos os services.
 * Fornece:
 * - Cliente Supabase admin (bypass RLS para operações internas)
 * - Logging padronizado
 * - Tratamento de erros consistente
 */
export abstract class BaseService {
  protected readonly supabaseAdmin: SupabaseClient<Database>;
  protected readonly serviceName: string;

  constructor() {
    this.supabaseAdmin = createAdminClient();
    this.serviceName = this.constructor.name;
  }

  /**
   * Log informativo padronizado.
   */
  protected log(message: string, data?: Record<string, unknown>): void {
    const prefix = `[${this.serviceName}]`;
    if (data) {
      console.log(prefix, message, data);
    } else {
      console.log(prefix, message);
    }
  }

  /**
   * Log de erro padronizado.
   */
  protected logError(message: string, error: unknown): void {
    console.error(`[${this.serviceName}] ERROR:`, message, error);
  }

  /**
   * Obtém o cliente Supabase no contexto do utilizador.
   * Útil para operações que respeitam RLS.
   */
  protected async getUserClient(userId: string) {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    return createServerSupabaseClient();
  }
}
```

---

### `src/services/ideas-service.ts`

```typescript
import { BaseService } from "./base-service";
import type { ContentIdea } from "@/types/content";
import type { Market } from "@/types/market";

/**
 * Serviço de gestão de ideias de conteúdo.
 * Lida com a fila de ideias geradas e sua aprovação/rejeição.
 */
export class IdeasService extends BaseService {
  /**
   * Lista ideias pendentes de aprovação.
   */
  async getPendingIdeas(market?: Market): Promise<ContentIdea[]> {
    this.log("Buscando ideias pendentes", { market });

    let query = this.supabaseAdmin
      .from("content_packages")
      .select("*")
      .eq("is_saved", false)
      .order("created_at", { ascending: false });

    if (market) {
      query = query.eq("market", market);
    }

    const { data, error } = await query;

    if (error) {
      this.logError("Erro ao buscar ideias pendentes", error);
      throw error;
    }

    return (data ?? []).map(this.toContentIdea);
  }

  /**
   * Aprova uma ideia, marcando-a como salva.
   */
  async approveIdea(ideaId: string): Promise<void> {
    this.log("Aprovando ideia", { ideaId });

    const { error } = await this.supabaseAdmin
      .from("content_packages")
      .update({ is_saved: true })
      .eq("id", ideaId);

    if (error) {
      this.logError("Erro ao aprovar ideia", error);
      throw error;
    }
  }

  /**
   * Converte um registo da BD para o formato ContentIdea.
   */
  private toContentIdea(row: Record<string, unknown>): ContentIdea {
    return {
      title: row.idea_title as string,
      conceptDescription: row.idea_description as string,
      format: row.format as ContentIdea["format"],
      businessGoal: row.business_goal as ContentIdea["businessGoal"],
    };
  }
}
```

---

### `src/services/packages-service.ts`

```typescript
import { BaseService } from "./base-service";
import type { ContentPackageOutput, StreamEvent } from "@/types/content";
import type { ContentPackage } from "@/types/database";

/**
 * Serviço de gestão de pacotes de conteúdo.
 * Lida com pacotes completos (após aprovação + geração).
 */
export class PackagesService extends BaseService {
  /**
   * Cria um novo pacote de conteúdo na base de dados.
   */
  async createPackage(data: {
    ideaTitle: string;
    ideaDescription: string;
    format: string;
    market: string;
    output: ContentPackageOutput;
    createdBy?: string;
  }): Promise<string> {
    this.log("Criando pacote de conteúdo", { title: data.ideaTitle });

    const { data: result, error } = await this.supabaseAdmin
      .from("content_packages")
      .insert({
        idea_title: data.ideaTitle,
        idea_description: data.ideaDescription,
        format: data.format,
        market: data.market,
        script_flow: data.output.scriptFlow,
        captions: data.output.captions,
        visual_prompts: data.output.visualPrompts,
        growth_tips: data.output.growthTips,
        status: "draft",
        is_saved: true,
        created_by: data.createdBy ?? null,
      })
      .select("id")
      .single();

    if (error) {
      this.logError("Erro ao criar pacote", error);
      throw error;
    }

    return result!.id;
  }

  /**
   * Lista pacotes para o calendário editorial.
   */
  async getCalendarPackages(
    startDate: string,
    endDate: string,
  ): Promise<ContentPackage[]> {
    this.log("Buscando pacotes do calendário", { startDate, endDate });

    const { data, error } = await this.supabaseAdmin
      .from("content_packages")
      .select("*")
      .in("status", ["draft", "scheduled"])
      .gte("scheduled_date", startDate)
      .lte("scheduled_date", endDate)
      .order("scheduled_date", { ascending: true });

    if (error) {
      this.logError("Erro ao buscar calendário", error);
      throw error;
    }

    return data ?? [];
  }

  /**
   * Atualiza um pacote (data, status, legendas).
   */
  async updatePackage(
    packageId: string,
    updates: Partial<ContentPackage>,
  ): Promise<void> {
    this.log("Atualizando pacote", { packageId, updates });

    const { error } = await this.supabaseAdmin
      .from("content_packages")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", packageId);

    if (error) {
      this.logError("Erro ao atualizar pacote", error);
      throw error;
    }
  }
}
```

---

### `src/services/gemini-service.ts`

```typescript
import {
  generateGeminiContent,
  streamGeminiContent,
} from "@/lib/gemini/client";

/**
 * Serviço de orquestração de chamadas à API Gemini.
 * Centraliza lógica de retry, parsing de JSON e tratamento de erros.
 */
export class GeminiService {
  /**
   * Chama a Gemini e tenta fazer parse do JSON de resposta.
   * Se o parse falhar, tenta novamente (até maxRetries vezes).
   */
  async generateJSON<T>(
    systemPrompt: string,
    userPrompt: string,
    maxRetries = 2,
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const text = await generateGeminiContent(systemPrompt, userPrompt);

        // Remove markdown code blocks se presentes
        const cleaned = text
          .replace(/```json\s*/g, "")
          .replace(/```\s*/g, "")
          .trim();

        return JSON.parse(cleaned) as T;
      } catch (error) {
        lastError = error as Error;
        console.warn(
          `[GeminiService] Tentativa ${attempt}/${maxRetries} falhou:`,
          error,
        );
      }
    }

    throw new Error(
      `GeminiService falhou após ${maxRetries} tentativas: ${lastError?.message}`,
    );
  }

  /**
   * Gera conteúdo com streaming.
   * Útil para endpoints que enviam progresso ao cliente.
   */
  async *generateStream(
    systemPrompt: string,
    userPrompt: string,
  ): AsyncGenerator<string> {
    yield* streamGeminiContent(systemPrompt, userPrompt);
  }


}
```

---

## 📁 `src/agents/`

---

### `src/agents/base-agent.ts`

```typescript
import type { Agent, AgentExecution } from "@/types/agent";
import { GeminiService } from "@/services/gemini-service";
import type { ZodSchema } from "zod";

/**
 * Classe base abstrata para todos os agentes de IA.
 *
 * Padrão: Template Method
 * - Subclasses implementam `execute()`
 * - Métodos auxiliares protegidos para chamadas Gemini e validação
 *
 * Extensibilidade:
 * ```
 * class NovoAgente extends BaseAgent<TInput, TOutput> {
 *   name = "novo-agente";
 *   async execute(input: TInput): Promise<TOutput> { ... }
 * }
 * ```
 */
export abstract class BaseAgent<TInput = unknown, TOutput = unknown>
  implements Agent<TInput, TOutput>
{
  abstract readonly name: string;

  protected readonly gemini: GeminiService;
  protected readonly systemPrompt: string;

  constructor(systemPrompt: string) {
    this.gemini = new GeminiService();
    this.systemPrompt = systemPrompt;
  }

  /**
   * Executa o agente com o input fornecido.
   * Subclasses devem implementar este método.
   */
  abstract execute(input: TInput): Promise<TOutput>;

  /**
   * Recolhe métricas de execução.
   */
  protected createExecution(startedAt: Date): AgentExecution {
    return {
      agentName: this.name,
      startedAt,
      success: false,
    };
  }

  /**
   * Finaliza a execução com métricas.
   */
  protected completeExecution(
    execution: AgentExecution,
    completedAt: Date,
  ): AgentExecution {
    return {
      ...execution,
      completedAt,
      durationMs: completedAt.getTime() - execution.startedAt.getTime(),
      success: true,
    };
  }

  /**
   * Chama a Gemini e valida o output contra um schema Zod.
   */
  protected async generateValidated<T>(
    userPrompt: string,
    schema: ZodSchema<T>,
  ): Promise<T> {
    const raw = await this.gemini.generateJSON<unknown>(
      this.systemPrompt,
      userPrompt,
    );
    return schema.parse(raw);
  }
}
```

---

### `src/agents/ideator/types.ts`

```typescript
import { z } from "zod";

/**
 * Input do Agente Ideator.
 * Vem do formulário preenchido pelo utilizador.
 */
export const IdeatorInputSchema = z.object({
  mood: z.string().min(1, "Mood é obrigatório"),
  targetAudience: z.string().min(1, "Público-alvo é obrigatório"),
  market: z.enum(["portugal", "spain"]),
  format: z.enum(["stories", "reels", "carousel"]).optional(),
  businessGoal: z
    .enum(["followers_growth", "engagement", "organic_reach"])
    .optional(),
  competitorReference: z.string().optional(),
  additionalNotes: z.string().optional(),
});

export type IdeatorInput = z.infer<typeof IdeatorInputSchema>;

/**
 * Output do Agente Ideator.
 * Uma lista de 3 ideias conceituais.
 */
export const IdeatorOutputSchema = z.object({
  ideas: z
    .array(
      z.object({
        title: z.string(),
        conceptDescription: z.string(),
        format: z.enum(["stories", "reels", "carousel"]),
        businessGoal: z.enum([
          "followers_growth",
          "engagement",
          "organic_reach",
        ]),
      }),
    )
    .length(3, "Devem ser geradas exatamente 3 ideias"),
});

export type IdeatorOutput = z.infer<typeof IdeatorOutputSchema>;
```

---

### `src/agents/ideator/ideator-agent.ts`

```typescript
import { BaseAgent } from "../base-agent";
import {
  type IdeatorInput,
  type IdeatorOutput,
  IdeatorInputSchema,
  IdeatorOutputSchema,
} from "./types";

/**
 * Agente A: Ideator
 *
 * Recebe um formulário estruturado (mood, público, mercado)
 * e gera 3 ideias conceituais de conteúdo.
 *
 * Substitui os Agentes 1 e 2 da arquitetura original.
 */
export class IdeatorAgent extends BaseAgent<IdeatorInput, IdeatorOutput> {
  readonly name = "ideator";

  constructor() {
    super(
      [
        "Você é o Ideator do Zenith Caffè, um especialista em conteúdo criativo para redes sociais.",
        "Sua tarefa é gerar 3 ideias conceituais de posts com base no briefing fornecido.",
        "",
        "REGRAS:",
        "- Pense primeiro nas emoções e experiências sensoriais",
        "- Use linguagem visual e descritiva",
        "- Cada ideia deve ter um formato E um objetivo de negócio diferentes",
        "- Evite repetir conceitos de ideias anteriores",
        "- Retorne estritamente um objeto JSON válido, sem markdown envolvente",
        "- O JSON deve seguir exatamente o schema especificado",
      ].join("\n"),
    );
  }

  async execute(input: IdeatorInput): Promise<IdeatorOutput> {
    // Valida input antes de chamar a API
    const validated = IdeatorInputSchema.parse(input);

    const prompt = [
      `## Briefing de Conteúdo`,
      `**Mood/Atmosfera**: ${validated.mood}`,
      `**Público-alvo**: ${validated.targetAudience}`,
      `**Mercado**: ${validated.market === "portugal" ? "Portugal" : "Espanha"}`,
      validated.format && `**Formato preferencial**: ${validated.format}`,
      validated.businessGoal &&
        `**Objetivo de negócio**: ${validated.businessGoal}`,
      validated.competitorReference &&
        `**Referência de concorrência**: ${validated.competitorReference}`,
      validated.additionalNotes &&
        `**Notas adicionais**: ${validated.additionalNotes}`,
    ]
      .filter(Boolean)
      .join("\n");

    return this.generateValidated(prompt, IdeatorOutputSchema);
  }
}
```

---

### `src/agents/packager/types.ts`

```typescript
import { z } from "zod";

/**
 * Input do Agente Packager.
 * Recebe a ideia aprovada + detalhes do mercado.
 */
export const PackagerInputSchema = z.object({
  title: z.string(),
  conceptDescription: z.string(),
  format: z.enum(["stories", "reels", "carousel"]),
  businessGoal: z.enum(["followers_growth", "engagement", "organic_reach"]),
  market: z.enum(["portugal", "spain"]),
  mood: z.string(),
  targetAudience: z.string(),
});

export type PackagerInput = z.infer<typeof PackagerInputSchema>;

/**
 * Output do Agente Packager.
 * Pacote completo: roteiro, legendas, prompts visuais, growth tips.
 */
export const PackagerOutputSchema = z.object({
  scriptFlow: z.array(
    z.object({
      timestamp: z.string(),
      visualDescription: z.string(),
      audioOrOverlay: z.string(),
    }),
  ),
  captions: z.object({
    primaryLanguage: z.string(),
    primaryText: z.string(),
    englishTranslation: z.string().optional(),
  }),
  visualPrompts: z.object({
    midjourneyPrompts: z.array(z.string()),
    runwayPrompts: z.array(z.string()),
  }),
  growthTips: z.object({
    callToActions: z.array(z.string()),
    engagementStickers: z
      .object({
        pollQuestion: z.string().optional(),
        questionBox: z.string().optional(),
      })
      .optional(),
    suggestedHashtags: z.array(z.string()),
    suggestedGeoTags: z.array(z.string()),
  }),
});

export type PackagerOutput = z.infer<typeof PackagerOutputSchema>;
```

---

### `src/agents/packager/packager-agent.ts`

```typescript
import { BaseAgent } from "../base-agent";
import {
  type PackagerInput,
  type PackagerOutput,
  PackagerInputSchema,
  PackagerOutputSchema,
} from "./types";

/**
 * Agente B: Packager
 *
 * Recebe uma ideia aprovada e gera o pacote completo:
 * - Roteiro detalhado
 * - Legendas no idioma correto (PT-PT, ES-ES, EN)
 * - Prompts visuais para Midjourney/Runway
 * - CTAs e estratégias de growth
 *
 * Substitui os Agentes 3, 4 e 5 da arquitetura original.
 */
export class PackagerAgent extends BaseAgent<PackagerInput, PackagerOutput> {
  readonly name = "packager";

  constructor() {
    super(
      [
        "Você é o Packager do Zenith Caffè, um especialista em produção de conteúdo completo.",
        "Sua tarefa é gerar um pacote completo de conteúdo para redes sociais.",
        "",
        "REGRAS DE IDIOMA:",
        "- Se o formato for 'stories': textos em Inglês (EN)",
        "- Se o mercado for 'portugal': legenda em PT-PT (NUNCA PT-BR) + versão EN",
        "- Se o mercado for 'spain': legenda em ES-ES + versão EN",
        "",
        "REGRAS DE CONTEÚDO:",
        "- Foque em experiências sensoriais e lifestyle",
        "- Use o tom premium da marca (nunca mencionar preços ou promoções)",
        "- Gere prompts visuais profissionais para Midjourney v6 e Runway",
        "- Proponha CTAs criativos que gerem interação real",
        "- Retorne estritamente um objeto JSON válido",
      ].join("\n"),
    );
  }

  async execute(input: PackagerInput): Promise<PackagerOutput> {
    const validated = PackagerInputSchema.parse(input);

    const prompt = [
      `## Ideia Aprovada`,
      `**Título**: ${validated.title}`,
      `**Descrição**: ${validated.conceptDescription}`,
      `**Formato**: ${validated.format}`,
      `**Objetivo**: ${validated.businessGoal}`,
      `**Mercado**: ${validated.market === "portugal" ? "Portugal" : "Espanha"}`,
      `**Mood**: ${validated.mood}`,
      `**Público-alvo**: ${validated.targetAudience}`,
    ]
      .filter(Boolean)
      .join("\n");

    return this.generateValidated(prompt, PackagerOutputSchema);
  }
}
```

---

## 📁 `src/app/api/`

---

### `src/app/api/cron/trend-analysis/route.ts`

```typescript
import { NextResponse } from "next/server";

/**
 * GET /api/cron/trend-analysis
 *
 * Executado pelo Vercel Cron Job todas as segundas às 08:00 UTC.
 * Acorda os agentes para gerar ideias automaticamente.
 *
 * Segurança:
 * - Valida o header VERCEL_CRON_SECRET para garantir que
 *   apenas o Vercel Cron ativa este endpoint.
 */
export async function GET(request: Request) {
  // Validação do cron secret
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.VERCEL_CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // TODO: Implementar ciclo autónomo
    // 1. Consultar dados de concorrência
    // 2. Recuperar memória editorial (últimos 10 pacotes)
    // 3. Chamar IdeatorAgent para gerar 3 ideias
    // 4. Gravar ideias na BD com is_saved = false

    console.log("[Cron] Trend analysis executado com sucesso");

    return NextResponse.json({
      status: "success",
      message: "Cron executado. Implementação pendente.",
    });
  } catch (error) {
    console.error("[Cron] Erro no trend analysis:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}
```

---

### `src/app/api/ideas/route.ts`

```typescript
import { NextResponse } from "next/server";

/**
 * GET /api/ideas
 *
 * Retorna a fila de ideias conceituais pendentes de aprovação.
 * Ordenadas por data de criação (mais recentes primeiro).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const market = searchParams.get("market");

    // TODO: Implementar com IdeasService
    // const ideasService = new IdeasService();
    // const ideas = await ideasService.getPendingIdeas(market ?? undefined);

    return NextResponse.json({
      status: "success",
      ideas: [],
      message: "Implementação pendente.",
    });
  } catch (error) {
    console.error("[API] Erro ao buscar ideias:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}
```

---

### `src/app/api/ideas/approve/route.ts`

```typescript
import { NextResponse } from "next/server";

/**
 * POST /api/ideas/approve
 *
 * Aprova uma ideia e inicia o pipeline de geração.
 * Responde com Server-Sent Events (streaming) para feedback em tempo real.
 *
 * Body:
 * ```json
 * { "idea_id": "UUID", "campaign_id": "UUID (opcional)" }
 * ```
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ideaId = body.idea_id as string | undefined;

    if (!ideaId) {
      return NextResponse.json(
        { status: "error", message: "idea_id é obrigatório" },
        { status: 400 },
      );
    }

    // TODO: Implementar pipeline de geração com streaming
    // 1. Validar que a ideia existe e está pendente
    // 2. Marcar como is_saved = true
    // 3. Iniciar PackagerAgent com streaming
    // 4. Para cada step, enviar evento SSE
    // 5. Gravar pacote completo na BD
    // 6. Enviar evento "complete" com packageId

    return NextResponse.json({
      status: "success",
      message: `Ideia ${ideaId} aprovada. Implementação pendente.`,
    });
  } catch (error) {
    console.error("[API] Erro ao aprovar ideia:", error);
    return NextResponse.json(
      { status: "error", message: "Erro interno" },
      { status: 500 },
    );
  }
}
```

---

## 🚀 Setup

### 1. Instalar dependências

```bash
npm install
# ou
pnpm install
```

### 2. Configurar variáveis de ambiente

Crie o ficheiro `.env.local` na raiz:

```ini
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
GEMINI_API_KEY=sua-chave-gemini
VERCEL_CRON_SECRET=seu-segredo-cron
```

### 3. Desenvolvimento

```bash
npm run dev        # Iniciar servidor de desenvolvimento
npm run typecheck  # Verificar tipos TypeScript
npm run lint       # Verificar lint
npm run format     # Formatar código
```

### 4. Criar estrutura de pastas

```bash
# Windows (PowerShell):
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

---

## 📚 Documentação

A documentação detalhada encontra-se na pasta `docs/`:

| Documento | Descrição |
|-----------|-----------|
| [Brand Voice & Prompts](docs/brand_voice_and_prompts.md) | Tom de voz e instruções dos agentes |
| [Supabase RLS](docs/supabase_rls_policies.md) | Políticas de segurança |
| [API Spec](docs/api_spec.md) | Especificação dos endpoints |
| [Setup Guide](docs/setup_guide.md) | Guia de configuração |
| [Análise Crítica](zenith_critical_analysis.md) | Revisão arquitetural do MVP |

---

## 📝 Notas de Implementação

- **Modelo Único**: Usar exclusivamente Gemini 2.0 Flash (conforme análise crítica)
- **2 Agentes**: Ideator (A) + Packager (B) em vez de 5
- **Streaming**: Respostas em tempo real via Server-Sent Events
- **RLS**: Service role nos cron jobs, user context nos handlers autenticados
- **Zod**: Validação em runtime de env vars, inputs de API e outputs de agentes

---

## 🔐 Autenticação Supabase — Código Completo

### Estado dos Ficheiros em Disco

| Ficheiro | Estado |
|----------|--------|
| `src/types/auth.ts` | ✅ **Criado** |
| `src/lib/env.ts` | ✅ **Criado** |
| `src/lib/supabase/client.ts` | ✅ **Criado** |
| `supabase/migrations/001_initial_schema.sql` | ✅ **Criado** |
| Todos os restantes | ⏳ **Criar manualmente** (conteúdo abaixo) |

### Ordem de Criação (por dependências)

Cria os ficheiros por esta ordem para evitar erros de import:

**Fase 1 — Tipos e Config** (sem dependências internas)
1. `src/types/database.ts`
2. `src/lib/auth-errors.ts`
3. `src/lib/supabase/server.ts`
4. `src/lib/supabase/admin.ts`
5. `src/lib/supabase/middleware.ts`
6. `src/lib/utils.ts`

**Fase 2 — Componentes e Layout** (dependem da Fase 1)
7. `src/components/providers/providers.tsx`
8. `src/app/layout.tsx`
9. `src/app/globals.css`
10. `src/app/page.tsx`
11. `src/components/layout/header.tsx`
12. `src/app/(dashboard)/layout.tsx`

**Fase 3 — Autenticação** (dependem da Fase 1-2)
13. `src/app/auth/login/page.tsx`
14. `src/components/auth/login-form.tsx`
15. `src/components/auth/auth-button.tsx`
16. `src/app/auth/callback/route.ts`
17. `src/app/auth/confirm/route.ts`
18. `src/app/auth/logout/route.ts`
19. `src/app/api/auth/user/route.ts`

**Fase 4 — Proteção** (depende de tudo acima)
20. `src/middleware.ts`

---

### Estrutura dos ficheiros de autenticação

```
src/
├── app/
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx        # Página de login
│   │   ├── callback/
│   │   │   └── route.ts        # Auth callback (OAuth, email link)
│   │   ├── confirm/
│   │   │   └── route.ts        # Confirmação de email
│   │   └── logout/
│   │       └── route.ts        # Logout endpoint
│   └── api/
│       └── auth/
│           └── user/
│               └── route.ts    # API para obter sessão + profile
├── components/
│   ├── auth/
│   │   ├── login-form.tsx      # Formulário de login
│   │   └── auth-button.tsx     # Botão login/logout
│   └── providers/
│       └── providers.tsx       # Providers atualizado com auth
├── lib/
│   ├── supabase/
│   │   ├── middleware.ts       # Cliente para Edge Middleware
│   │   ├── client.ts           # Browser client
│   │   └── server.ts           # Server client
│   └── auth-errors.ts          # Tratamento de erros
├── middleware.ts               # Proteção de rotas
└── types/
    └── auth.ts                 # Tipos de autenticação
```

---

### `src/types/auth.ts`

```typescript
import type { Profile } from "./database";

/** Estado da sessão */
export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
}

/** Utilizador autenticado com perfil completo */
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "creator_portugal" | "creator_spain";
  market: "portugal" | "spain";
  avatarUrl: string | null;
}

/** Códigos de erro de autenticação */
export type AuthErrorCode =
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "USER_EXISTS"
  | "WEAK_PASSWORD"
  | "NETWORK_ERROR"
  | "UNKNOWN";

/** Resultado de uma operação de auth */
export type AuthResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: AuthError };

export interface AuthError {
  code: AuthErrorCode;
  message: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignUpInput {
  email: string;
  password: string;
  name: string;
}

/** Converte Profile → AuthUser */
export function profileToAuthUser(profile: Profile): AuthUser {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    market: profile.market,
    avatarUrl: profile.avatar_url,
  };
}
```

---

### `src/lib/auth-errors.ts`

```typescript
import type { AuthError, AuthErrorCode } from "@/types/auth";

/**
 * Mapeia erros do Supabase Auth para mensagens amigáveis em PT-PT.
 */
const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  INVALID_CREDENTIALS: "Email ou palavra-passe incorretos.",
  EMAIL_NOT_CONFIRMED: "Confirma o teu email antes de fazer login.",
  USER_EXISTS: "Já existe uma conta com este email.",
  WEAK_PASSWORD: "A palavra-passe deve ter pelo menos 6 caracteres.",
  NETWORK_ERROR: "Erro de rede. Verifica a tua ligação.",
  UNKNOWN: "Ocorreu um erro inesperado. Tenta novamente.",
};

/**
 * Mapeia um erro do Supabase Auth para o nosso formato.
 */
export function mapAuthError(error: unknown): AuthError {
  const message =
    error instanceof Error ? error.message.toLowerCase() : "";

  let code: AuthErrorCode = "UNKNOWN";

  if (message.includes("invalid login credentials")) {
    code = "INVALID_CREDENTIALS";
  } else if (message.includes("email not confirmed")) {
    code = "EMAIL_NOT_CONFIRMED";
  } else if (message.includes("user already registered")) {
    code = "USER_EXISTS";
  } else if (
    message.includes("should be at least 6 characters") ||
    message.includes("password should be longer")
  ) {
    code = "WEAK_PASSWORD";
  } else if (
    message.includes("network") ||
    message.includes("fetch")
  ) {
    code = "NETWORK_ERROR";
  }

  return {
    code,
    message: ERROR_MESSAGES[code],
  };
}

/**
 * Cria um AuthError diretamente.
 */
export function createAuthError(code: AuthErrorCode): AuthError {
  return {
    code,
    message: ERROR_MESSAGES[code],
  };
}
```

---

### `src/lib/supabase/middleware.ts`

```typescript
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/types/database";

/**
 * Cliente Supabase para Next.js Middleware (Edge Runtime).
 * Lê/define cookies diretamente no request/response
 * porque o Edge não tem acesso a `cookies()`.
 */
export async function createMiddlewareClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  return { supabase, response };
}
```

---

### `src/middleware.ts`

```typescript
import { type NextRequest, NextResponse } from "next/server";
import { createMiddlewareClient } from "@/lib/supabase/middleware";

/**
 * Rotas públicas que não precisam de autenticação.
 */
const PUBLIC_ROUTES = [
  "/auth/login",
  "/auth/callback",
  "/auth/confirm",
  "/_next/static",
  "/_next/image",
  "/favicon.ico",
];

/**
 * Rotas de API públicas.
 */
const PUBLIC_API_ROUTES = [
  "/api/cron/",
  "/api/auth/",
];

/**
 * Next.js Middleware — corre antes de cada request.
 *
 * Funcionalidades:
 * 1. Renova a sessão do Supabase (refresh token)
 * 2. Redireciona para /auth/login se não autenticado
 * 3. Redireciona para /dashboard se já autenticado e a tentar aceder a /auth/login
 */
export async function middleware(request: NextRequest) {
  const { supabase, response } = await createMiddlewareClient(request);

  // Refresh da sessão (renova token se necessário)
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const pathname = request.nextUrl.pathname;

  // Verificar se é rota pública
  const isPublicRoute = PUBLIC_ROUTES.some((route) =>
    pathname.startsWith(route),
  );
  const isPublicApi = PUBLIC_API_ROUTES.some((route) =>
    pathname.startsWith(route),
  );

  // Se não está autenticado e tenta aceder a rota protegida → redirect para login
  if (!session && !isPublicRoute && !isPublicApi) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Se está autenticado e tenta aceder ao login → redirect para dashboard
  if (session && pathname === "/auth/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

/**
 * Configuração do matcher do Middleware.
 * Otimização: só corre nas rotas que realmente precisam.
 */
export const config = {
  matcher: [
    /*
     * Correr em todas as rotas excepto:
     * - static files (_next/static)
     * - images (_next/image)
     * - favicon
     * - rotas de auth que lidam com callback/confirm
     */
    "/((?!_next/static|_next/image|favicon.ico|auth/callback|auth/confirm).*)",
  ],
};
```

---

### `src/app/auth/login/page.tsx`

```tsx
import { LoginForm } from "@/components/auth/login-form";

/**
 * Página de login.
 * Server Component que renderiza o formulário.
 */
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";

/**
 * Página de login.
 * Server Component que renderiza o formulário.
 * Envolve em Suspense porque LoginForm usa useSearchParams().
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-neutral-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-bold text-brand-800">
            Zenith CIS
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Content Intelligence System
          </p>
        </div>
        <Suspense fallback={<div className="text-center text-neutral-500">A carregar…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
```

---

### `src/components/auth/login-form.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { mapAuthError } from "@/lib/auth-errors";
import type { LoginInput } from "@/types/auth";

/**
 * Formulário de login com email + password.
 *
 * Estados:
 * - idle: pronto para preencher
 * - loading: a autenticar
 * - error: mostra mensagem de erro
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const input: LoginInput = { email, password };

      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword(
          input,
        );

        if (authError) {
          setError(mapAuthError(authError).message);
          return;
        }

        router.push(redirect);
        router.refresh();
      } else {
        const { error: authError } = await supabase.auth.signUp({
          email: input.email,
          password: input.password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (authError) {
          setError(mapAuthError(authError).message);
          return;
        }

        setMode("login");
        setError(null);
        alert("Conta criada! Verifica o teu email para confirmar.");
      }
    } catch (err) {
      setError(mapAuthError(err).message);
        setSuccessMessage("Conta criada! Verifica o teu email para confirmar.");
        return;
      }
    } catch (err) {
      setError(mapAuthError(err).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Success message */}
      {successMessage && (
        <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {successMessage}
        </div>
      )}
      {/* Email */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-neutral-700"
        >
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ola@zenith.pt"
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={loading}
          autoComplete="email"
        />
      </div>

      {/* Password */}
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-neutral-700"
        >
          Palavra-passe
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="mt-1 block w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm shadow-sm placeholder:text-neutral-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          disabled={loading}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="h-4 w-4 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            A processar…
          </span>
        ) : mode === "login" ? (
          "Entrar"
        ) : (
          "Criar conta"
        )}
      </button>

      {/* Toggle mode */}
      <p className="text-center text-sm text-neutral-500">
        {mode === "login" ? (
          <>
            Não tens conta?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Criar conta
            </button>
          </>
        ) : (
          <>
            Já tens conta?{" "}
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-medium text-brand-600 hover:text-brand-700"
            >
              Entrar
            </button>
          </>
        )}
      </p>
    </form>
  );
}
```

---

### `src/components/auth/auth-button.tsx`

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AuthUser } from "@/types/auth";

interface AuthButtonProps {
  user: AuthUser;
}

/**
 * Botão de autenticação no header.
 * Mostra o nome do utilizador e menu de logout.
 */
export function AuthButton({ user }: AuthButtonProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    setLoading(true);
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden sm:inline">{user.name}</span>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 z-50 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
            <div className="border-b px-4 py-2">
              <p className="text-xs text-neutral-500">{user.email}</p>
              <p className="text-xs font-medium text-brand-600">
                {user.role === "admin"
                  ? "Administrador"
                  : user.market === "portugal"
                    ? "Criador • Portugal"
                    : "Criador • Espanha"}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full px-4 py-2 text-left text-sm text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
            >
              {loading ? "A sair…" : "Sair"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

---

### `src/components/providers/providers.tsx`

```tsx
"use client";

import { createClient } from "@/lib/supabase/client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Profile } from "@/types/database";
import type { AuthState, AuthUser } from "@/types/auth";
import { profileToAuthUser } from "@/types/auth";

type SupabaseContextValue = {
  supabase: SupabaseClient<Database>;
  auth: AuthState;
};

const SupabaseContext = createContext<SupabaseContextValue | undefined>(
  undefined,
);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useSupabase must be used within a Providers");
  }
  return context.supabase;
}

export function useAuth() {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error("useAuth must be used within a Providers");
  }
  return context.auth;
}

export function Providers({ children }: { children: ReactNode }) {
  const supabase = createClient();
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    loading: true,
  });

  useEffect(() => {
    let mounted = true;

    // 1. Buscar sessão atual
    async function fetchSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!mounted) return;

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setAuth({ user: null, loading: false });
      }
    }

    // 2. Buscar profile na tabela profiles
    async function fetchProfile(userId: string) {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single<Profile>();

      if (!mounted) return;

      if (data) {
        setAuth({
          user: profileToAuthUser(data),
          loading: false,
        });
      } else {
        // Profile ainda não foi criado (trigger handle_new_user)
        setAuth({ user: null, loading: false });
      }
    }

    // 3. Subscrever a mudanças de estado de auth
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (event === "SIGNED_IN" && session?.user) {
        fetchProfile(session.user.id);
      } else if (event === "SIGNED_OUT") {
        setAuth({ user: null, loading: false });
      }
    });

    fetchSession();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <SupabaseContext.Provider value={{ supabase, auth }}>
      {children}
    </SupabaseContext.Provider>
  );
}
```

---

### `src/components/layout/header.tsx`

```tsx
import Link from "next/link";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AuthButton } from "@/components/auth/auth-button";
import { profileToAuthUser } from "@/types/auth";

/**
 * Header da aplicação com estado de autenticação.
 * Server Component — busca a sessão e passa ao client component.
 */
export async function Header() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Buscar profile associado
  let userName = "";
  let userRole = "creator_portugal" as const;
  let userMarket = "portugal" as const;
  let userEmail = "";

  if (session?.user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .single();

    if (profile) {
      const authUser = profileToAuthUser(profile);
      userName = authUser.name;
      userRole = authUser.role;
      userMarket = authUser.market;
      userEmail = authUser.email;
    }
  }

  const user = session?.user
    ? { id: session.user.id, name: userName, email: userEmail, role: userRole, market: userMarket, avatarUrl: null as string | null }
    : null;

  return (
    <header className="sticky top-0 z-50 border-b bg-white/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/dashboard"
          className="font-display text-xl font-bold text-brand-700"
        >
          Zenith CIS
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-neutral-600">
          <Link href="/ideas" className="transition-colors hover:text-brand-600">
            Ideias
          </Link>
          <Link
            href="/calendar"
            className="transition-colors hover:text-brand-600"
          >
            Calendário
          </Link>
          {user ? (
            <AuthButton
              user={{
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                market: user.market,
                avatarUrl: user.avatarUrl,
              }}
            />
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-brand-600 px-4 py-2 text-white transition-colors hover:bg-brand-700"
            >
              Entrar
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
```

---

### `src/app/auth/callback/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /auth/callback
 *
 * Endpoint chamado pelo Supabase após:
 * - Confirmação de email (sign up)
 * - Magic link
 * - OAuth (Google, GitHub, etc.)
 *
 * Troca o code de autorização por uma sessão e redireciona.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  // Code de autorização do Supabase
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  // Se algo falhou, redireciona para login com erro
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
```

---

### `src/app/auth/confirm/route.ts`

```typescript
import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /auth/confirm
 *
 * Confirma o token recebido por email.
 * Usado para:
 * - Confirmação de registo (signup)
 * - Reset de palavra-passe
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  if (tokenHash && type) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (!error) {
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=confirm_failed`);
}
```

---

### `src/app/auth/logout/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * GET /auth/logout
 *
 * Termina a sessão e redireciona para o login.
 * Usa URL relativa — funciona em dev e produção.
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();

  return NextResponse.redirect("/auth/login");
}
```

> **Nota**: Usa `NextResponse.redirect("/auth/login")` com URL relativa — o Next.js resolve automaticamente para o domínio correto em dev e produção.

---

### `src/app/api/auth/user/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { profileToAuthUser } from "@/types/auth";

/**
 * GET /api/auth/user
 *
 * Retorna o utilizador autenticado com o perfil completo.
 * Útil para client components que precisam de recarregar o estado.
 *
 * Response:
 * - 200: { user: AuthUser }
 * - 401: { user: null }
 */
export async function GET() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    return NextResponse.json(
      { error: "Profile não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json({
    user: profileToAuthUser(profile),
  });
}
```

---

### `src/app/(dashboard)/layout.tsx`

```tsx
import { redirect } from "next/navigation";
import { Header } from "@/components/layout/header";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Layout do dashboard — requer autenticação.
 * Server Component: verifica a sessão antes de renderizar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
```

---

### `src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: {
    default: "Zenith CIS | Content Intelligence System",
    template: "%s | Zenith CIS",
  },
  description:
    "Copiloto de marketing autónomo para o Zenith Caffè — Geração de conteúdo com IA",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-neutral-50 font-sans text-neutral-900 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

---

### `src/app/page.tsx`

```tsx
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Página inicial.
 * Redireciona para dashboard ou login conforme sessão.
 */
export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect("/dashboard");
  }

  redirect("/auth/login");
}
```

---

### `src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    @apply border-neutral-200;
  }

  body {
    @apply bg-neutral-50 text-neutral-900;
  }
}
```

---

### Rotas protegidas e públicas — resumo

| Rota | Tipo | Comportamento |
|------|------|---------------|
| `/auth/login` | Pública | Mostra formulário de login/registo |
| `/auth/callback` | Pública | Troca code por sessão (redirect) |
| `/auth/confirm` | Pública | Confirma token de email (redirect) |
| `/auth/logout` | Pública | Termina sessão (redirect) |
| `/api/auth/user` | Pública | Retorna JSON com user ou 401 |
| `/dashboard` | Protegida | Redireciona para login se não autenticado |
| `/api/**` | Protegida | Redireciona para login se não autenticado (exceto /api/auth/) |
| `/api/cron/**` | Pública | Acessível via Vercel Cron (validação própria) |

### Fluxo de autenticação

```
Utilizador → /auth/login → preenche email+password
  → signInWithPassword() → Supabase valida
  → Se OK: redirect para /dashboard
  → Se erro: mostra mensagem amigável

Registo:
  → /auth/login → toggle "Criar conta"
  → signUp() → Supabase envia email de confirmação
  → Utilizador clica link → /auth/callback
  → exchangeCodeForSession() → redirect para /dashboard
  → Trigger handle_new_user() cria profile automaticamente
```

### Tratamento de erros

| Erro Supabase | Mensagem (PT-PT) | Código |
|--------------|-------------------|--------|
| `invalid login credentials` | "Email ou palavra-passe incorretos." | `INVALID_CREDENTIALS` |
| `email not confirmed` | "Confirma o teu email antes de fazer login." | `EMAIL_NOT_CONFIRMED` |
| `user already registered` | "Já existe uma conta com este email." | `USER_EXISTS` |
| `password` error | "A palavra-passe deve ter pelo menos 6 caracteres." | `WEAK_PASSWORD` |
| network error | "Erro de rede. Verifica a tua ligação." | `NETWORK_ERROR` |

---

## 🧪 Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run lint` | Verificar ESLint |
| `npm run lint:fix` | Corrigir ESLint automaticamente |
| `npm run format` | Formatar código com Prettier |
| `npm run format:check` | Verificar formatação |
| `npm run typecheck` | Verificar tipos TypeScript |
