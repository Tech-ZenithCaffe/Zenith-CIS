import { NextResponse } from "next/server";
import { IdeatorAgent } from "@/agents/ideator/ideator-agent";
import { IdeatorInputSchema } from "@/agents/ideator/types";
import { IdeasService } from "@/services/ideas-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const service = new IdeasService();
    const ideas = await service.getPendingIdeas();

    return NextResponse.json({ status: "success", ideas });
  } catch (error) {
    console.error("[API] Erro ao buscar ideias:", error);
    return NextResponse.json(
      { status: "error", message: "Erro ao buscar ideias" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = IdeatorInputSchema.parse(body);

    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { status: "error", message: "Não autenticado" },
        { status: 401 },
      );
    }

    const profileResult = await supabase
      .from("profiles")
      .select("market")
      .eq("id", user.id)
      .single();

    if (profileResult.error) {
      console.error("[API] Erro ao buscar perfil:", profileResult.error);
    }

    const profileData = profileResult.data as { market: string } | null;
    const market = (profileData?.market ?? parsed.market) as "portugal" | "spain";

    const agent = new IdeatorAgent();
    const output = await agent.execute(parsed);

    const admin = createAdminClient();
    const rows = output.ideas.map((idea) => ({
      idea_title: idea.title,
      idea_description: idea.conceptDescription,
      format: idea.format,
      business_goal: idea.businessGoal,
      market,
      mood: parsed.mood,
      target_audience: parsed.targetAudience,
      is_saved: false,
      status: "draft" as const,
      created_by: user.id,
    }));

    const { data: created, error } = await (admin as any)
      .from("content_packages")
      .insert(rows)
      .select();

    if (error) {
      console.error("[API] Erro ao salvar ideias:", error);
      return NextResponse.json(
        { status: "error", message: "Erro ao salvar ideias", detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        status: "success",
        ideas: created ?? [],
        message: "Ideias geradas com sucesso!",
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[API] Erro ao gerar ideias:", message);
    return NextResponse.json(
      { status: "error", message: "Erro ao processar pedido", detail: message },
      { status: 500 },
    );
  }
}
