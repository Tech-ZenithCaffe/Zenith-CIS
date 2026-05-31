import { BaseService } from "./base-service";
import type { ContentIdea } from "@/types/content";
import type { Market } from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

export class IdeasService extends BaseService {
  private get sb() {
    return this.supabaseAdmin as any;
  }

  async getPendingIdeas(market?: Market): Promise<ContentIdea[]> {
    this.log("Buscando ideias pendentes", { market });

    let query = this.sb
      .from("content_packages")
      .select("*")
      .eq("is_saved", false)
      .order("created_at", { ascending: false });

    if (market) {
      query = query.eq("market", market);
    }

    const { data, error }: { data: any[] | null; error: PostgrestError | null } =
      await query;

    if (error) {
      this.logError("Erro ao buscar ideias pendentes", error);
      throw error;
    }

    return (data ?? []).map(this.toContentIdea);
  }

  async approveIdea(ideaId: string): Promise<void> {
    this.log("Aprovando ideia", { ideaId });

    const { error } = await this.sb
      .from("content_packages")
      .update({ is_saved: true })
      .eq("id", ideaId);

    if (error) {
      this.logError("Erro ao aprovar ideia", error);
      throw error;
    }
  }

  private toContentIdea(row: Record<string, unknown>): ContentIdea {
    return {
      id: row.id as string,
      title: row.idea_title as string,
      conceptDescription: row.idea_description as string,
      format: row.format as ContentIdea["format"],
      businessGoal: row.business_goal as ContentIdea["businessGoal"],
      market: row.market as ContentIdea["market"],
      mood: row.mood as ContentIdea["mood"],
      targetAudience: row.target_audience as ContentIdea["targetAudience"],
      is_saved: row.is_saved as boolean,
      image_url: row.image_url as string | null,
      created_at: row.created_at as string,
    };
  }
}
