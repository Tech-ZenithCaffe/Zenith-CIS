# AGENTS.md — Zenith Content Intelligence System

## Project Overview
Content intelligence system built with Next.js 15.1 (App Router), Supabase, Gemini AI, Tailwind CSS. Generates social media content via AI agents.

## Tech Stack
- Next.js 15.1 (App Router), TypeScript, Tailwind CSS
- Supabase (Postgres, Auth, RLS)
- Google Gemini AI (IdeatorAgent, PackagerAgent)
- Hosted on Vercel (Hobby plan)

## Git Workflow
- Repo: `github.com/Tech-ZenithCaffe/Zenith-CIS`
- Branch: `master`
- After pushing to `master`, Vercel automatically deploys to production

## Environment Variables (.env.local)
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service_role key (admin bypass RLS)
- `GEMINI_API_KEY` — Google Gemini API key
- `VERCEL_CRON_SECRET` — Secret for Vercel Cron Jobs

## Key Architecture
- **Middleware** (`src/middleware.ts`): Protects all routes except `/auth/*`, `/api/cron/*`, `/api/auth/*`
- **Admin Client** (`src/lib/supabase/admin.ts`): Uses `service_role` key, bypasses RLS — used in all API routes
- **Server Client** (`src/lib/supabase/server.ts`): Uses anon key + cookies, used for auth only
- **API routes** use `createAdminClient()` for DB + `createServerSupabaseClient()` for auth (user check)

## API Endpoints
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/ideas` | GET | Get pending ideas (`is_saved=false`) |
| `/api/ideas` | POST | IdeatorAgent → generate 3 ideas → insert |
| `/api/ideas/approve` | POST | Approve → PackagerAgent → SSE streaming (3 phases) |
| `/api/calendar?month=&year=` | GET | Get scheduled + unscheduled approved content |
| `/api/calendar` | PUT | Schedule/unschedule content (`scheduled_date`) |
| `/api/dashboard` | GET | Aggregated metrics (pending, scheduled, published, total) |
| `/api/settings` | GET/PUT | User profile (name, market, role) |

## Database: `content_packages` table
- `is_saved=false` → pending idea (IdeatorAgent output)
- `is_saved=true` → approved package (PackagerAgent output)
- `scheduled_date=null` → approved but not yet scheduled
- `scheduled_date=YYYY-MM-DD` → scheduled
- `status`: `draft` → `approved` → `scheduled` → `published`

## Agents
- **IdeatorAgent** (`src/agents/ideator/`): Takes briefing → Gemini → 3 content ideas
- **PackagerAgent** (`src/agents/packager/`): Takes idea → Gemini → full package (script, captions, prompts, growth tips) — streamed via SSE in 3 phases

## Fixed Issues
- ~~`GeminiService.generateJSON()` removia todo whitespace com regex — agora extrai JSON entre `{}` e remove markdown fences~~
