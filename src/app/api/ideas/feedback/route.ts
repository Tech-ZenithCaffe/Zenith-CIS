import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const admin = createAdminClient();
    const { data, error } = await (admin as any)
      .from("idea_feedback")
      .select("id, idea_title, idea_description, format, business_goal, mood, target_audience, rejection_reason, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API] Erro ao buscar feedback:", error);
      return NextResponse.json({ status: "error", message: "Erro ao buscar feedback" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", feedback: data ?? [] });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[API] Erro ao buscar feedback:", message);
    return NextResponse.json({ status: "error", message: "Erro interno" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ status: "error", message: "Não autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ status: "error", message: "ID é obrigatório" }, { status: 400 });
    }

    const admin = createAdminClient();
    const { error } = await (admin as any)
      .from("idea_feedback")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("[API] Erro ao apagar feedback:", error);
      return NextResponse.json({ status: "error", message: "Erro ao apagar feedback" }, { status: 500 });
    }

    return NextResponse.json({ status: "success", message: "Feedback apagado" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    console.error("[API] Erro ao apagar feedback:", message);
    return NextResponse.json({ status: "error", message: "Erro interno" }, { status: 500 });
  }
}
