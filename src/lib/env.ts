import { z } from "zod";

/**
 * Schema de validação das variáveis de ambiente.
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
