import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";
import type { CookieOptions } from "@supabase/ssr";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          return cookieStore.getAll();
        },
        async setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Chamado a partir de um Server Component.
            // Pode ser ignorado porque o middleware trata
            // de atualizar as sessões dos utilizadores.
          }
        },
      },
    },
  );
}
