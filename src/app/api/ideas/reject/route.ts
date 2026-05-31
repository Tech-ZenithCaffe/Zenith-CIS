import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { idea_id, reason } = await request.json();

    if (!idea_id || !reason) {
      return NextResponse.json(
        { status: "error", message: "idea_id e reason são obrigatórios" },
        { status: 400 },
      );
    }

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

    const admin = createAdminClient();

    const { data: idea, error: fetchError } = await (admin as any)
      .from("content_packages")
      .select("id, idea_title, idea_description, format, business_goal, market, mood, target_audience")
      .eq("id", idea_id)
      .single();

    if (fetchError || !idea) {
      return NextResponse.json(
        { status: "error", message: "Ideia não encontrada" },
        { status: 404 },
      );
    }

    const { error: insertError } = await (admin as any)
      .from("idea_feedback")
      .insert({
        user_id: user.id,
        idea_title: idea.idea_title,
        idea_description: idea.idea_description,
        format: idea.format,
        business_goal: idea.business_goal,
        market: idea.market,
        mood: idea.mood,
        target_audience: idea.target_audience,
        rejection_reason: reason,
      });

    if (insertError) {
      console.error("[API] Erro ao guardar feedback:", insertError);
      return NextResponse.json(
        { status: "error", message: "Erro ao guardar feedback", detail: insertError.message },
        { status: 500 },
      );
    }

    const { error: deleteError } = await (admin as any)
      .from("content_packages")
      .delete()
      .eq("id", idea_id);

    if (deleteError) {
      console.error("[API] Erro ao eliminar ideia:", deleteError);
      return NextResponse.json(
        { status: "error", message: "Erro ao eliminar ideia", detail: deleteError.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ status: "success", message: "Ideia rejeitada com feedback guardado" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[API] Erro ao rejeitar ideia:", message);
    return NextResponse.json(
      { status: "error", message: "Erro ao processar pedido", detail: message },
      { status: 500 },
    );
  }
}
