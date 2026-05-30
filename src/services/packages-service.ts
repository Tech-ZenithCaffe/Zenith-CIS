import { BaseService } from "./base-service";
import type { ContentPackageOutput } from "@/types/content";
import type { ContentPackage } from "@/types/database";
import type { PostgrestError } from "@supabase/supabase-js";

export class PackagesService extends BaseService {
  private get sb() {
    return this.supabaseAdmin as any;
  }

  async createPackage(data: {
    ideaTitle: string;
    ideaDescription: string;
    format: string;
    market: string;
    output: ContentPackageOutput;
    createdBy?: string;
  }): Promise<string> {
    this.log("Criando pacote de conteudo", { title: data.ideaTitle });

    const { data: result, error }: { data: any; error: PostgrestError | null } =
      await this.sb
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

    return result["id"];
  }

  async getCalendarPackages(
    startDate: string,
    endDate: string,
  ): Promise<ContentPackage[]> {
    this.log("Buscando pacotes do calendario", { startDate, endDate });

    const { data, error }: { data: any[] | null; error: PostgrestError | null } =
      await this.sb
        .from("content_packages")
        .select("*")
        .in("status", ["draft", "scheduled"])
        .gte("scheduled_date", startDate)
        .lte("scheduled_date", endDate)
        .order("scheduled_date", { ascending: true });

    if (error) {
      this.logError("Erro ao buscar calendario", error);
      throw error;
    }

    return data ?? [];
  }

  async updatePackage(
    packageId: string,
    updates: Partial<ContentPackage>,
  ): Promise<void> {
    this.log("Atualizando pacote", { packageId, updates });

    const { error } = await this.sb
      .from("content_packages")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", packageId);

    if (error) {
      this.logError("Erro ao atualizar pacote", error);
      throw error;
    }
  }
}
