import { createAdminClient } from "@/lib/supabase/admin";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Classe base para todos os services.
 */
export abstract class BaseService {
  protected readonly supabaseAdmin: SupabaseClient<Database>;
  protected readonly serviceName: string;

  constructor() {
    this.supabaseAdmin = createAdminClient();
    this.serviceName = this.constructor.name;
  }

  protected log(message: string, data?: Record<string, unknown>): void {
    const prefix = `${this.serviceName}`;
    if (data) {
      console.warn(prefix, message, data);
    } else {
      console.warn(prefix, message);
    }
  }

  protected logError(message: string, error: unknown): void {
    console.error(`[${this.serviceName}] ERROR:`, message, error);
  }

  protected async getUserClient(_userId: string) {
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    return createServerSupabaseClient();
  }
}
