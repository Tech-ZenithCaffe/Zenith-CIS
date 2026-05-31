import { NextResponse } from "next/server";
import { IdeatorAgent } from "@/agents/ideator/ideator-agent";
import { IdeatorInputSchema } from "@/agents/ideator/types";
import { IdeasService } from "@/services/ideas-service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function DELETE(request: Request) {
  try {
    const { idea_id } = await request.json();

    if (!idea_id) {
      return NextResponse.json(
        { status: "error", message: "ID da ideia é obrigatório" },
        { status: 400 },
      );
    }

    const admin = createAdminClient();
    const { error } = await (admin as any)
      .from("content_packages")
      .delete()
      .eq("id", idea_id);

    if (error) {
      console.error("[API] Erro ao rejeitar ideia:", error);
      return NextResponse.json(
        { status: "error", message: "Erro ao rejeitar ideia", detail: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "success", message: "Ideia rejeitada" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[API] Erro ao rejeitar ideia:", message);
    return NextResponse.json(
      { status: "error", message: "Erro ao processar pedido", detail: message },
      { status: 500 },
    );
  }
}

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

    const admin = createAdminClient();
    const { data: feedbackRows } = await (admin as any)
      .from("idea_feedback")
      .select("idea_title, idea_description, format, business_goal, market, mood, target_audience, rejection_reason")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    const rejectionFeedback = (feedbackRows ?? []).map((r: any) => ({
      ideaTitle: r.idea_title,
      ideaDescription: r.idea_description,
      format: r.format,
      businessGoal: r.business_goal,
      market: r.market,
      mood: r.mood,
      targetAudience: r.target_audience,
      rejectionReason: r.rejection_reason,
    }));

    const agent = new IdeatorAgent();
    const output = await agent.execute({ ...parsed, rejectionFeedback });

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
